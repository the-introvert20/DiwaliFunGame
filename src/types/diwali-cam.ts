export type DiwaliGestureType =
  | 'none'
  | 'fireworks'     // Open Palm
  | 'rocket'        // Peace Sign
  | 'sparkler'      // Pinch
  | 'finale'        // Both Hands Raised
  | 'diya';         // Index Finger

export interface HandPoint {
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  z?: number;
}

export interface DetectedGesture {
  type: DiwaliGestureType;
  confidence: number;
  position: { x: number; y: number };
  handIndex: number;
  isTwoHanded?: boolean;
}

export interface ARFilterSettings {
  gestureControlEnabled: boolean;
  arEffectsEnabled: boolean;
  intensity: number; // 0.5 to 2.0
  soundEnabled: boolean;
  activeManualEffects: Set<DiwaliGestureType>;
}

export interface PartyParticipant {
  id: string;
  name: string;
  isLocal: boolean;
  isHost?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
  activeGesture?: DiwaliGestureType;
}

export interface PartyChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isReaction?: boolean;
  isCelebration?: boolean;
}

export interface RoomCelebrationEvent {
  type: 'CELEBRATION_TRIGGER';
  effect: DiwaliGestureType;
  senderId: string;
  senderName: string;
  timestamp: number;
}

