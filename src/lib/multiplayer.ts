import { Client, Room } from 'colyseus.js';

const SERVER_URL =
  process.env.NEXT_PUBLIC_GAME_SERVER_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? `wss://${window.location.host}`
    : 'ws://localhost:2567');

class MultiplayerManager {
  private client: Client;
  private currentRoom: Room | null = null;

  constructor() {
    this.client = new Client(SERVER_URL);
  }

  public getClient(): Client {
    return this.client;
  }

  public getCurrentRoom(): Room | null {
    return this.currentRoom;
  }

  public async joinOrCreateRoom(roomName: string, options: any = {}): Promise<Room> {
    try {
      const room = await this.client.joinOrCreate(roomName, options);
      this.currentRoom = room;
      return room;
    } catch (err) {
      console.warn(`[Multiplayer] Could not connect to remote room ${roomName}:`, err);
      throw err;
    }
  }

  public async joinByRoomId(roomId: string, options: any = {}): Promise<Room> {
    try {
      const room = await this.client.joinById(roomId, options);
      this.currentRoom = room;
      return room;
    } catch (err) {
      console.warn(`[Multiplayer] Could not join room ${roomId}:`, err);
      throw err;
    }
  }

  public async createCustomRoom(roomName: string, options: any = {}): Promise<Room> {
    try {
      const room = await this.client.create(roomName, options);
      this.currentRoom = room;
      return room;
    } catch (err) {
      console.warn(`[Multiplayer] Could not create custom room ${roomName}:`, err);
      throw err;
    }
  }

  public leaveCurrentRoom() {
    if (this.currentRoom) {
      this.currentRoom.leave();
      this.currentRoom = null;
    }
  }
}

export const multiplayer = new MultiplayerManager();

