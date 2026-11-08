import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class FireworkUser extends Schema {
  @type("string") id: string = "";
  @type("string") username: string = "";
  @type("string") avatar: string = "";
  @type("number") launchedCount: number = 0;
  @type("number") appreciationVotes: number = 0;
}

export class FireworksState extends Schema {
  @type({ map: FireworkUser }) users = new MapSchema<FireworkUser>();
  @type("number") totalFireworks: number = 0;
}

export class FireworksRoom extends Room<{ state: FireworksState }> {
  maxClients = 12;

  onCreate(options: any) {
    this.setState(new FireworksState());

    this.onMessage("launch", (client: Client, data: { type: string; color: string; x: number; targetY: number }) => {
      const user = this.state.users.get(client.sessionId);
      if (user) {
        user.launchedCount++;
        this.state.totalFireworks++;

        this.broadcast("firework_launched", {
          id: Math.random().toString(36).substring(2, 9),
          ownerId: user.id,
          ownerName: user.username,
          type: data.type || "sky_rocket",
          color: data.color || "#ffc16c",
          x: Math.max(0.05, Math.min(0.95, data.x)),
          targetY: Math.max(0.1, Math.min(0.6, data.targetY)),
          timestamp: Date.now(),
        });
      }
    });

    this.onMessage("applause", (client: Client, data: { targetUserId: string }) => {
      const user = this.state.users.get(client.sessionId);
      const target = this.state.users.get(data.targetUserId);
      if (user && target) {
        target.appreciationVotes++;
        this.broadcast("audience_reaction", {
          fromUser: user.username,
          toUser: target.username,
          emoji: "✨",
          timestamp: Date.now(),
        });
      }
    });

    this.onMessage("chat", (client: Client, message: { text: string }) => {
      const user = this.state.users.get(client.sessionId);
      if (user) {
        this.broadcast("chat_message", {
          id: Math.random().toString(36).substring(2, 9),
          senderId: user.id,
          senderName: user.username,
          avatar: user.avatar,
          content: message.text.slice(0, 140),
          timestamp: Date.now(),
        });
      }
    });
  }

  onJoin(client: Client, options: any) {
    const user = new FireworkUser();
    user.id = options?.playerId || client.sessionId;
    user.username = options?.username || `Artisan_${client.sessionId.slice(0, 4)}`;
    user.avatar = options?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdj1BnJOeIpu27ZMjRTJHTNqx8S-X8TrpcufbFpCPEiQ8yfPCGa2H8ujHRsHV0879F6XctnS1u84B_QkUlc1zKUHQekmr2a7U-ijp3ngl2Rgqo4E3zPj7gtVByeEE-lENcIL5i8UQ-1gYwOFWx2qKBi0suT8BpvQlbc0Mko8WNIoa_iG2IW_iXeZSVVPVbWIOJ6sUE-L5j4vga7oI_PUYfszekHIRlvrO3ymjkUoY';
    this.state.users.set(client.sessionId, user);

    this.broadcast("chat_message", {
      id: Math.random().toString(36).substring(2, 9),
      senderId: "system",
      senderName: "SYSTEM",
      avatar: "",
      content: `${user.username} entered the fireworks night sky ✨`,
      timestamp: Date.now(),
      isSystem: true,
    });
  }

  onLeave(client: Client, code?: number) {
    this.state.users.delete(client.sessionId);
  }
}
