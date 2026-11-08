// DIWALIverse Core TypeScript Type Definitions

export type GameId = 
  | 'rocket-rush'
  | 'fireworks'
  | 'cracker-clash'
  | 'rangoli'
  | 'home-decorator'
  | 'diya-dash';

export interface PlayerProfile {
  id: string;
  isGuest: boolean;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  selectedSkin?: string;
  createdAt: string;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    rocketRushWins: number;
    fireworksCrafted: number;
    crackerClashStreak: number;
    rangoliStars: number;
    diyasLit: number;
  };
  achievements: string[];
  inventory: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  coinReward: number;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'rocket_skin' | 'sparkler_trail' | 'diya_glow' | 'rangoli_palette' | 'avatar_frame';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  previewUrl?: string;
  priceCoins: number;
  unlocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  avatar: string;
  xp: number;
  wins: number;
  coins: number;
  badge?: string;
}

export interface Tournament {
  id: string;
  title: string;
  gameId: GameId;
  gameName: string;
  prizePool: number;
  entryFee: number;
  status: 'upcoming' | 'registering' | 'in_progress' | 'completed';
  startTime: string;
  durationMinutes: number;
  maxParticipants: number;
  currentParticipants: number;
  stages: number;
  bracket?: TournamentMatch[];
}

export interface TournamentMatch {
  matchId: string;
  round: number;
  player1: { id: string; username: string; score?: number };
  player2: { id: string; username: string; score?: number };
  winnerId?: string;
}

export interface RoomParticipant {
  sessionId: string;
  playerId: string;
  username: string;
  avatar: string;
  level: number;
  isHost: boolean;
  isReady: boolean;
  ping: number;
  skin?: string;
}

export interface RoomChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameRoomDetails {
  roomId: string;
  roomCode: string;
  gameId: GameId;
  name: string;
  hostId: string;
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  status: 'waiting' | 'starting' | 'in_progress' | 'finished';
  participants: RoomParticipant[];
  config: {
    trackId?: string;
    hazardsEnabled: boolean;
    boostMultiplier: number;
    lapsCount?: number;
    durationSeconds?: number;
  };
}

// Rocket Rush specific real-time state
export interface RocketPlayerState {
  id: string;
  username: string;
  avatar: string;
  x: number; // 0 to 1 across track width
  y: number; // track distance / progress
  speed: number; // km/h
  lane: number; // -1 (left), 0 (center), 1 (right)
  isBoosting: boolean;
  isShielded: boolean;
  boostCharge: number; // 0 to 100
  lap: number;
  finished: boolean;
  finishTime?: number;
  rank: number;
  color: string;
}

export interface RocketObstacle {
  id: string;
  type: 'lantern' | 'boost_pad' | 'diya_gate' | 'spark_hazard';
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

// Fireworks specific real-time state
export interface FireworkRocket {
  id: string;
  ownerId: string;
  ownerName: string;
  x: number;
  targetY: number;
  currentY: number;
  color: string;
  type: 'anar' | 'chakri' | 'sky_rocket' | 'sparkler_fountain' | 'multiburst';
  exploded: boolean;
}

export interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

// Cracker Clash specific state
export interface CrackerTarget {
  id: string;
  x: number;
  y: number;
  type: 'ladi' | 'bomb' | 'sparkler' | 'golden_anar';
  points: number;
  durationMs: number;
  spawnTime: number;
  clickedBy?: string;
}

