import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { RocketRushRoom } from "./rooms/RocketRushRoom";
import { FireworksRoom } from "./rooms/FireworksRoom";
import { CrackerClashRoom } from "./rooms/CrackerClashRoom";
import { LobbyRoom } from "./rooms/LobbyRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    platform: "DIWALIverse Arcade Game Server",
    time: new Date().toISOString(),
    roomsActive: gameServer ? true : false,
  });
});

app.get("/api/rooms", (req, res) => {
  res.json({
    activeRooms: [
      { id: "DK-8821", name: "Delhi Rockets Club", game: "Rocket Rush", players: "3/4", ping: "14ms" },
      { id: "FW-4091", name: "Diwali Chill Vibes", game: "Fireworks Lab", players: "7/12", ping: "22ms" },
      { id: "RG-1102", name: "Rangoli Masters", game: "Rangoli Battle", players: "4/6", ping: "19ms" },
    ],
  });
});

const server = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  }),
});

// Register Rooms
gameServer.define("rocket_rush", RocketRushRoom);
gameServer.define("fireworks", FireworksRoom);
gameServer.define("cracker_clash", CrackerClashRoom);
gameServer.define("lobby", LobbyRoom).enableRealtimeListing();

server.listen(port, () => {
  console.log(`✨ DIWALIverse Authoritative Game Server running on http://localhost:${port}`);
  console.log(`🚀 Rooms defined: rocket_rush, fireworks, cracker_clash, lobby`);
});

