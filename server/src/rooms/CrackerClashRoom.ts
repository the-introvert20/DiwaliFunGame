import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class ClashPlayer extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("string") avatar: string = "";
  @type("number") score: number = 0;
  @type("number") combo: number = 0;
  @type("number") maxCombo: number = 0;
  @type("boolean") isReady: boolean = false;
}

export class CrackerClashState extends Schema {
  @type("string") status: string = "waiting";
  @type("number") timeLeft: number = 60;
  @type("string") winnerId: string = "";
  @type("string") winnerName: string = "";
  @type({ map: ClashPlayer }) players = new MapSchema<ClashPlayer>();
}

export class CrackerClashRoom extends Room<{ state: CrackerClashState }> {
  maxClients = 4;
  private gameTimer: any = null;
  private spawnTimer: any = null;

  onCreate(options: any) {
    this.setState(new CrackerClashState());

    this.onMessage("ready", (client: Client) => {
      const p = this.state.players.get(client.sessionId);
      if (p) {
        p.isReady = !p.isReady;
        this.checkStartGame();
      }
    });

    this.onMessage("tap_target", (client: Client, data: { targetId: string; points: number }) => {
      if (this.state.status !== "playing") return;
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.combo++;
        if (player.combo > player.maxCombo) {
          player.maxCombo = player.combo;
        }

        let multiplier = 1;
        if (player.combo >= 10) multiplier = 3;
        else if (player.combo >= 5) multiplier = 2;

        const earned = (data.points || 10) * multiplier;
        player.score += earned;

        this.broadcast("target_hit", {
          targetId: data.targetId,
          hitterId: player.id,
          hitterName: player.username,
          points: earned,
          combo: player.combo,
        });
      }
    });

    this.onMessage("miss", (client: Client) => {
      if (this.state.status !== "playing") return;
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.combo = 0;
      }
    });
  }

  onJoin(client: Client, options: any) {
    const player = new ClashPlayer();
    player.id = options?.playerId || client.sessionId;
    player.username = options?.username || `Clasher_${client.sessionId.slice(0, 4)}`;
    player.avatar = options?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdj1BnJOeIpu27ZMjRTJHTNqx8S-X8TrpcufbFpCPEiQ8yfPCGa2H8ujHRsHV0879F6XctnS1u84B_QkUlc1zKUHQekmr2a7U-ijp3ngl2Rgqo4E3zPj7gtVByeEE-lENcIL5i8UQ-1gYwOFWx2qKBi0suT8BpvQlbc0Mko8WNIoa_iG2IW_iXeZSVVPVbWIOJ6sUE-L5j4vga7oI_PUYfszekHIRlvrO3ymjkUoY';
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, code?: number) {
    this.state.players.delete(client.sessionId);
  }

  private checkStartGame() {
    if (this.state.status !== "waiting") return;
    let allReady = true;
    let count = 0;

    this.state.players.forEach((p: ClashPlayer) => {
      count++;
      if (!p.isReady) allReady = false;
    });

    if (count >= 1 && allReady) {
      this.startGame();
    }
  }

  private startGame() {
    this.state.status = "playing";
    this.state.timeLeft = 60;

    this.spawnTimer = this.clock.setInterval(() => {
      if (this.state.status !== "playing") return;
      const types = ["sparkler", "bomb", "ladi", "golden_anar"];
      const newTarget = {
        id: `target_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        x: 0.15 + Math.random() * 0.7,
        y: 0.15 + Math.random() * 0.7,
        type: types[Math.floor(Math.random() * types.length)],
        points: 20 + Math.floor(Math.random() * 30),
        durationMs: 2500,
        spawnTime: Date.now(),
      };
      this.broadcast("new_target", newTarget);
    }, 700);

    this.gameTimer = this.clock.setInterval(() => {
      this.state.timeLeft--;
      if (this.state.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  private endGame() {
    this.state.status = "finished";
    if (this.gameTimer) this.gameTimer.clear();
    if (this.spawnTimer) this.spawnTimer.clear();

    let highestScore = -1;
    let winner: ClashPlayer | null = null;

    this.state.players.forEach((p: ClashPlayer) => {
      if (p.score > highestScore) {
        highestScore = p.score;
        winner = p;
      }
    });

    if (winner) {
      this.state.winnerId = (winner as ClashPlayer).id;
      this.state.winnerName = (winner as ClashPlayer).username;
    }

    const scoresList: any[] = [];
    this.state.players.forEach((p: ClashPlayer) => {
      scoresList.push({
        id: p.id,
        username: p.username,
        score: p.score,
        maxCombo: p.maxCombo,
      });
    });

    this.broadcast("game_finished", {
      winnerId: this.state.winnerId,
      winnerName: this.state.winnerName,
      scores: scoresList,
    });
  }

  onDispose() {
    if (this.gameTimer) this.gameTimer.clear();
    if (this.spawnTimer) this.spawnTimer.clear();
  }
}
