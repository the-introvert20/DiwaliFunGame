import { Room, Client } from "colyseus";
import { RocketRushState, RocketPlayer, RocketObstacleState } from "./schema/RocketRushState";

const COLORS = ["#ffc16c", "#00e1ef", "#f26419", "#f6bd60", "#d62246", "#70b58c", "#ffdbcd", "#7df4ff"];

export class RocketRushRoom extends Room<{ state: RocketRushState }> {
  maxClients = 8;
  private updateInterval: any = null;
  private countdownInterval: any = null;

  onCreate(options: any) {
    this.setState(new RocketRushState());
    this.state.lapsCount = options?.lapsCount || 3;
    this.state.trackLength = 6000;

    // Generate track obstacles (lantern hazards, boost pads, diya gates)
    this.generateTrackObstacles();

    // Message Handlers
    this.onMessage("ready", (client: Client, message: any) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isReady = message && message.ready !== undefined ? message.ready : !player.isReady;
        this.checkStartGame();
      }
    });

    this.onMessage("steer", (client: Client, data: { x: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (player && this.state.status === "racing") {
        player.targetX = Math.max(0.08, Math.min(0.92, data.x));
      }
    });

    this.onMessage("boost", (client: Client, data: { active: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (player && this.state.status === "racing") {
        if (data.active && player.boostCharge > 10) {
          player.isBoosting = true;
        } else {
          player.isBoosting = false;
        }
      }
    });

    this.onMessage("shield", (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (player && this.state.status === "racing" && !player.isShielded) {
        player.isShielded = true;
        this.clock.setTimeout(() => {
          player.isShielded = false;
        }, 6000);
      }
    });

    this.onMessage("chat", (client: Client, message: { text: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        this.broadcast("chat_message", {
          id: Math.random().toString(36).substring(2, 9),
          senderId: player.id,
          senderName: player.username,
          avatar: player.avatar,
          content: message.text.slice(0, 140),
          timestamp: Date.now(),
        });
      }
    });

    this.onMessage("reaction", (client: Client, message: { emoji: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        this.broadcast("squad_reaction", {
          senderName: player.username,
          emoji: message.emoji,
          timestamp: Date.now(),
        });
      }
    });

    // Start Simulation Loop at 20 updates per second
    this.setSimulationInterval((deltaTime: number) => this.update(deltaTime), 50);
  }

  private generateTrackObstacles() {
    const types = ["lantern", "boost_pad", "diya_gate"];
    for (let i = 0; i < 40; i++) {
      const obs = new RocketObstacleState();
      obs.id = `obs_${i}`;
      obs.obstacleType = types[i % types.length];
      obs.x = 0.15 + Math.random() * 0.7;
      obs.y = (i + 1) * 140; // spaced out along the track
      obs.active = true;
      this.state.obstacles.push(obs);
    }
  }

  onJoin(client: Client, options: any) {
    const player = new RocketPlayer();
    player.id = options?.playerId || client.sessionId;
    player.username = options?.username || `Racer_${client.sessionId.slice(0, 4)}`;
    player.avatar = options?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdj1BnJOeIpu27ZMjRTJHTNqx8S-X8TrpcufbFpCPEiQ8yfPCGa2H8ujHRsHV0879F6XctnS1u84B_QkUlc1zKUHQekmr2a7U-ijp3ngl2Rgqo4E3zPj7gtVByeEE-lENcIL5i8UQ-1gYwOFWx2qKBi0suT8BpvQlbc0Mko8WNIoa_iG2IW_iXeZSVVPVbWIOJ6sUE-L5j4vga7oI_PUYfszekHIRlvrO3ymjkUoY';
    
    // Assign lane and color
    const playerIndex = this.state.players.size;
    player.color = COLORS[playerIndex % COLORS.length];
    player.x = 0.2 + (playerIndex % 4) * 0.2;
    player.targetX = player.x;

    this.state.players.set(client.sessionId, player);

    this.broadcast("chat_message", {
      id: Math.random().toString(36).substring(2, 9),
      senderId: "system",
      senderName: "SYSTEM",
      avatar: "",
      content: `${player.username} joined the launch bay! 🚀`,
      timestamp: Date.now(),
      isSystem: true,
    });
  }

  onLeave(client: Client, code?: number) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.broadcast("chat_message", {
        id: Math.random().toString(36).substring(2, 9),
        senderId: "system",
        senderName: "SYSTEM",
        avatar: "",
        content: `${player.username} disconnected.`,
        timestamp: Date.now(),
        isSystem: true,
      });
    }
    this.state.players.delete(client.sessionId);
  }

  private checkStartGame() {
    if (this.state.status !== "waiting") return;
    let allReady = true;
    let count = 0;

    this.state.players.forEach((p: RocketPlayer) => {
      count++;
      if (!p.isReady) allReady = false;
    });

    if (count >= 1 && allReady) {
      this.startCountdown();
    }
  }

  public forceStart() {
    if (this.state.status === "waiting") {
      this.startCountdown();
    }
  }

  private startCountdown() {
    this.state.status = "countdown";
    this.state.countdown = 3;

    this.countdownInterval = this.clock.setInterval(() => {
      this.state.countdown--;
      if (this.state.countdown <= 0) {
        this.countdownInterval.clear();
        this.state.status = "racing";
        this.state.raceStartTime = Date.now();
        this.broadcast("race_started", { startTime: this.state.raceStartTime });
      }
    }, 1000);
  }

  private update(deltaTime: number) {
    if (this.state.status !== "racing") return;

    const dtSeconds = deltaTime / 1000;
    const playerList: RocketPlayer[] = [];

    this.state.players.forEach((player: RocketPlayer) => {
      if (player.finished) {
        playerList.push(player);
        return;
      }

      // Smooth horizontal steering lerp
      player.x += (player.targetX - player.x) * Math.min(1, 8 * dtSeconds);

      // Boost mechanics
      if (player.isBoosting) {
        player.speed = Math.min(560, player.speed + 120 * dtSeconds);
        player.boostCharge = Math.max(0, player.boostCharge - 25 * dtSeconds);
        if (player.boostCharge <= 0) {
          player.isBoosting = false;
        }
      } else {
        // Natural speed recovery / decay towards base 360 km/h
        if (player.speed > 360) {
          player.speed = Math.max(360, player.speed - 80 * dtSeconds);
        } else if (player.speed < 360) {
          player.speed = Math.min(360, player.speed + 60 * dtSeconds);
        }
        // Passive boost recharge
        player.boostCharge = Math.min(100, player.boostCharge + 10 * dtSeconds);
      }

      // Track distance delta
      const distanceDelta = (player.speed / 3.6) * dtSeconds * 3;
      player.y += distanceDelta;

      // Obstacle collision check
      this.state.obstacles.forEach((obs: RocketObstacleState) => {
        if (!obs.active) return;
        const dy = Math.abs(player.y - obs.y);
        const dx = Math.abs(player.x - obs.x);

        if (dy < 25 && dx < 0.12) {
          if (obs.obstacleType === "boost_pad") {
            player.speed = 520;
            player.boostCharge = Math.min(100, player.boostCharge + 35);
          } else if (obs.obstacleType === "lantern") {
            if (!player.isShielded) {
              player.speed = Math.max(160, player.speed - 120);
            }
          } else if (obs.obstacleType === "diya_gate") {
            player.boostCharge = Math.min(100, player.boostCharge + 20);
          }
        }
      });

      // Lap progression
      if (player.y >= this.state.trackLength) {
        player.y -= this.state.trackLength;
        player.lap++;

        if (player.lap > this.state.lapsCount) {
          player.finished = true;
          player.finishTime = Date.now() - this.state.raceStartTime;
          if (!this.state.winnerId) {
            this.state.winnerId = player.id;
            this.state.winnerName = player.username;
          }
        }
      }

      playerList.push(player);
    });

    // Calculate live ranks based on total distance: (lap - 1) * trackLength + y
    playerList.sort((a, b) => {
      const distA = (a.lap - 1) * this.state.trackLength + a.y;
      const distB = (b.lap - 1) * this.state.trackLength + b.y;
      return distB - distA;
    });

    playerList.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    // Check if match ended
    let finishedCount = 0;
    this.state.players.forEach((p: RocketPlayer) => {
      if (p.finished) finishedCount++;
    });

    if (finishedCount > 0 && finishedCount === this.state.players.size) {
      this.state.status = "finished";
      this.broadcast("race_finished", {
        winnerId: this.state.winnerId,
        winnerName: this.state.winnerName,
      });
    }
  }

  onDispose() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }
}
