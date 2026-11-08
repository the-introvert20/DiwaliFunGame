import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class LobbyParticipant extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("string") avatar: string = "";
  @type("number") level: number = 1;
  @type("boolean") isHost: boolean = false;
  @type("boolean") isReady: boolean = false;
  @type("number") ping: number = 18;
  @type("string") skin: string = "Saffron Comet";
}

export class LobbyRoomState extends Schema {
  @type("string") roomCode: string = "";
  @type("string") gameId: string = "rocket-rush";
  @type("string") gameName: string = "Rocket Rush";
  @type("string") hostId: string = "";
  @type("number") maxPlayers: number = 4;
  @type("string") status: string = "waiting";
  @type("boolean") hazardsEnabled: boolean = true;
  @type("number") boostMultiplier: number = 1.5;
  @type({ map: LobbyParticipant }) participants = new MapSchema<LobbyParticipant>();
}

export class LobbyRoom extends Room<{ state: LobbyRoomState }> {
  onCreate(options: any) {
    this.setState(new LobbyRoomState());
    this.state.roomCode = options?.roomCode || `DW-${Math.floor(1000 + Math.random() * 9000)}`;
    this.state.gameId = options?.gameId || "rocket-rush";
    this.state.gameName = options?.gameName || "Rocket Rush";
    this.state.maxPlayers = options?.maxPlayers || 4;
    this.maxClients = this.state.maxPlayers;

    this.onMessage("toggle_ready", (client: Client) => {
      const p = this.state.participants.get(client.sessionId);
      if (p) {
        p.isReady = !p.isReady;
      }
    });

    this.onMessage("toggle_hazard", (client: Client) => {
      const p = this.state.participants.get(client.sessionId);
      if (p && p.isHost) {
        this.state.hazardsEnabled = !this.state.hazardsEnabled;
      }
    });

    this.onMessage("launch_game", (client: Client) => {
      const p = this.state.participants.get(client.sessionId);
      if (p && p.isHost) {
        this.state.status = "launching";
        this.broadcast("countdown_started", {
          countdown: 3,
        });

        this.clock.setTimeout(() => {
          this.state.status = "launched";
          this.broadcast("game_redirect", {
            gameId: this.state.gameId,
            roomCode: this.state.roomCode,
          });
        }, 3000);
      }
    });

    this.onMessage("chat", (client: Client, message: { text: string }) => {
      const p = this.state.participants.get(client.sessionId);
      if (p) {
        this.broadcast("chat_message", {
          id: Math.random().toString(36).substring(2, 9),
          senderId: p.id,
          senderName: p.username,
          avatar: p.avatar,
          content: message.text.slice(0, 140),
          timestamp: Date.now(),
        });
      }
    });

    this.onMessage("reaction", (client: Client, message: { emoji: string }) => {
      const p = this.state.participants.get(client.sessionId);
      if (p) {
        this.broadcast("squad_reaction", {
          senderName: p.username,
          emoji: message.emoji,
          timestamp: Date.now(),
        });
      }
    });
  }

  onJoin(client: Client, options: any) {
    const isFirst = this.state.participants.size === 0;
    const participant = new LobbyParticipant();
    participant.id = options?.playerId || client.sessionId;
    participant.username = options?.username || `Racer_${client.sessionId.slice(0, 4)}`;
    participant.avatar = options?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdj1BnJOeIpu27ZMjRTJHTNqx8S-X8TrpcufbFpCPEiQ8yfPCGa2H8ujHRsHV0879F6XctnS1u84B_QkUlc1zKUHQekmr2a7U-ijp3ngl2Rgqo4E3zPj7gtVByeEE-lENcIL5i8UQ-1gYwOFWx2qKBi0suT8BpvQlbc0Mko8WNIoa_iG2IW_iXeZSVVPVbWIOJ6sUE-L5j4vga7oI_PUYfszekHIRlvrO3ymjkUoY';
    participant.level = options?.level || 42;
    participant.isHost = isFirst;
    participant.isReady = isFirst;

    if (isFirst) {
      this.state.hostId = participant.id;
    }

    this.state.participants.set(client.sessionId, participant);

    this.broadcast("chat_message", {
      id: Math.random().toString(36).substring(2, 9),
      senderId: "system",
      senderName: "SYSTEM",
      avatar: "",
      content: `${participant.username} entered the squad lobby!`,
      timestamp: Date.now(),
      isSystem: true,
    });
  }

  onLeave(client: Client, code?: number) {
    const p = this.state.participants.get(client.sessionId);
    if (p) {
      const wasHost = p.isHost;
      this.state.participants.delete(client.sessionId);

      if (wasHost && this.state.participants.size > 0) {
        const nextHost = this.state.participants.values().next().value;
        if (nextHost) {
          nextHost.isHost = true;
          this.state.hostId = nextHost.id;
          this.broadcast("chat_message", {
            id: Math.random().toString(36).substring(2, 9),
            senderId: "system",
            senderName: "SYSTEM",
            avatar: "",
            content: `Host migrated to ${nextHost.username}!`,
            timestamp: Date.now(),
            isSystem: true,
          });
        }
      }
    }
  }
}
