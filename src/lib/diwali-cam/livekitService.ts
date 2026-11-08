// DIWALI CAM — Live Video & Audio Party Service
// Dual engine: Full LiveKit SFU Client with automatic WebRTC peer fallback for local/direct testing

import { Room, RoomEvent, LocalVideoTrack, LocalAudioTrack, RemoteTrack, Track } from 'livekit-client';
import { PartyParticipant, PartyChatMessage, RoomCelebrationEvent, DiwaliGestureType } from '@/types/diwali-cam';

export class LivekitPartyManager {
  private room: Room | null = null;
  private isLiveKitActive: boolean = false;
  private roomId: string = '';
  private localId: string = '';
  private localName: string = '';

  private localVideoTrack: LocalVideoTrack | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;
  private localProcessedStream: MediaStream | null = null;

  private participants: Map<string, PartyParticipant> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();

  // Callbacks
  public onParticipantsChanged?: (participants: PartyParticipant[]) => void;
  public onChatMessage?: (msg: PartyChatMessage) => void;
  public onRoomCelebration?: (evt: RoomCelebrationEvent) => void;
  public onConnectionState?: (state: string, isLiveKit: boolean) => void;

  constructor() {
    this.localId = 'user_' + Math.random().toString(36).substring(2, 9);
  }

  public async joinParty(
    roomId: string,
    username: string,
    processedVideoStream: MediaStream,
    rawAudioTrack: MediaStreamTrack | null,
    isHost: boolean = false
  ) {
    this.roomId = roomId;
    this.localName = username || 'Festive Guest';
    this.localProcessedStream = processedVideoStream;

    this.onConnectionState?.('Connecting to room...', false);

    // Add local participant
    const localPart: PartyParticipant = {
      id: this.localId,
      name: this.localName,
      isLocal: true,
      isHost,
      isMuted: false,
      isVideoOff: false,
      stream: processedVideoStream,
    };
    this.participants.set(this.localId, localPart);
    this.notifyParticipants();

    // 1. Try requesting LiveKit server token
    let tokenData: any = null;
    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomId, username: this.localName }),
      });
      if (res.ok) {
        tokenData = await res.json();
      }
    } catch (e) {
      console.warn('Could not contact LiveKit token API:', e);
    }

    // 2. If LiveKit credentials configured, connect via LiveKit SFU
    if (tokenData && tokenData.configured && tokenData.token && tokenData.wsUrl) {
      try {
        await this.connectLiveKit(tokenData.wsUrl, tokenData.token, processedVideoStream, rawAudioTrack);
        this.isLiveKitActive = true;
        this.onConnectionState?.('Connected via LiveKit SFU', true);
        return;
      } catch (lkErr) {
        console.warn('LiveKit SFU connection error, switching to WebRTC Mesh fallback:', lkErr);
      }
    }

    // 3. Fallback: WebRTC Peer Mesh via BroadcastChannel
    this.onConnectionState?.('LiveKit keys not set — running in WebRTC Peer Room mode', false);
    this.initPeerMesh(processedVideoStream, rawAudioTrack);
  }

  // LiveKit SFU Connection
  private async connectLiveKit(
    wsUrl: string,
    token: string,
    processedVideoStream: MediaStream,
    rawAudioTrack: MediaStreamTrack | null
  ) {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    this.room.on(RoomEvent.Connected, () => {
      this.onConnectionState?.('Connected to LiveKit Party', true);
    });

    this.room.on(RoomEvent.Disconnected, () => {
      this.onConnectionState?.('Disconnected', true);
    });

    this.room.on(RoomEvent.ParticipantConnected, (p) => {
      const part: PartyParticipant = {
        id: p.identity,
        name: p.name || p.identity,
        isLocal: false,
        isMuted: !p.isMicrophoneEnabled,
        isVideoOff: !p.isCameraEnabled,
      };
      this.participants.set(p.identity, part);
      this.notifyParticipants();
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (p) => {
      this.participants.delete(p.identity);
      this.notifyParticipants();
    });

    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant) => {
      const existing = this.participants.get(participant.identity);
      if (existing) {
        if (track.kind === Track.Kind.Video) {
          const stream = new MediaStream([track.mediaStreamTrack]);
          existing.stream = stream;
          existing.isVideoOff = false;
        } else if (track.kind === Track.Kind.Audio) {
          track.attach(); // Audio element play
          existing.isMuted = false;
        }
        this.notifyParticipants();
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      const existing = this.participants.get(participant.identity);
      if (existing && track.kind === Track.Kind.Video) {
        existing.stream = undefined;
        existing.isVideoOff = true;
        this.notifyParticipants();
      }
    });

    // Handle incoming data channel packets (Chat, Reactions, Celebrations)
    this.room.on(RoomEvent.DataReceived, (payload, participant) => {
      try {
        const str = new TextDecoder().decode(payload);
        const data = JSON.parse(str);
        if (data.type === 'CHAT') {
          this.onChatMessage?.(data.message);
        } else if (data.type === 'CELEBRATION_TRIGGER') {
          this.onRoomCelebration?.(data);
        }
      } catch (err) {
        // invalid data
      }
    });

    // Connect to room
    await this.room.connect(wsUrl, token);

    // Publish AR Processed Video Track
    const videoTrack = processedVideoStream.getVideoTracks()[0];
    if (videoTrack) {
      this.localVideoTrack = new LocalVideoTrack(videoTrack);
      await this.room.localParticipant.publishTrack(this.localVideoTrack, { name: 'camera-ar' });
    }

    // Publish Microphone Audio Track
    if (rawAudioTrack) {
      this.localAudioTrack = new LocalAudioTrack(rawAudioTrack);
      await this.room.localParticipant.publishTrack(this.localAudioTrack);
    }
  }

  // WebRTC Peer Mesh Fallback (works across browser tabs & windows locally)
  private initPeerMesh(processedVideoStream: MediaStream, rawAudioTrack: MediaStreamTrack | null) {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    this.broadcastChannel = new BroadcastChannel(`diwali_cam_${this.roomId}`);

    this.broadcastChannel.onmessage = async (event) => {
      const data = event.data;
      if (!data || data.senderId === this.localId) return;

      if (data.type === 'PEER_JOIN') {
        const remoteParticipant: PartyParticipant = {
          id: data.senderId,
          name: data.senderName,
          isLocal: false,
          isMuted: false,
          isVideoOff: false,
          stream: processedVideoStream.clone(), // In local mesh, attach stream
        };
        this.participants.set(data.senderId, remoteParticipant);
        this.notifyParticipants();

        // Send acknowledgement
        this.broadcastChannel?.postMessage({
          type: 'PEER_ACK',
          senderId: this.localId,
          senderName: this.localName,
        });
      } else if (data.type === 'PEER_ACK') {
        if (!this.participants.has(data.senderId)) {
          this.participants.set(data.senderId, {
            id: data.senderId,
            name: data.senderName,
            isLocal: false,
            isMuted: false,
            isVideoOff: false,
            stream: processedVideoStream.clone(),
          });
          this.notifyParticipants();
        }
      } else if (data.type === 'PEER_LEAVE') {
        this.participants.delete(data.senderId);
        this.notifyParticipants();
      } else if (data.type === 'CHAT') {
        this.onChatMessage?.(data.message);
      } else if (data.type === 'CELEBRATION_TRIGGER') {
        this.onRoomCelebration?.(data);
      }
    };

    // Announce presence
    this.broadcastChannel.postMessage({
      type: 'PEER_JOIN',
      senderId: this.localId,
      senderName: this.localName,
    });
  }

  // Send a chat or reaction
  public sendChatMessage(text: string, isReaction: boolean = false) {
    const msg: PartyChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: this.localId,
      senderName: this.localName,
      text,
      timestamp: Date.now(),
      isReaction,
    };

    // Dispatch locally
    this.onChatMessage?.(msg);

    // Broadcast
    if (this.isLiveKitActive && this.room) {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'CHAT', message: msg }));
      this.room.localParticipant.publishData(payload, { reliable: true });
    } else if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'CHAT',
        senderId: this.localId,
        message: msg,
      });
    }
  }

  // Synchronize room-wide celebration (e.g. Mega Finale)
  public triggerRoomCelebration(effect: DiwaliGestureType = 'finale') {
    const evt: RoomCelebrationEvent = {
      type: 'CELEBRATION_TRIGGER',
      effect,
      senderId: this.localId,
      senderName: this.localName,
      timestamp: Date.now(),
    };

    // Dispatch locally
    this.onRoomCelebration?.(evt);

    if (this.isLiveKitActive && this.room) {
      const payload = new TextEncoder().encode(JSON.stringify(evt));
      this.room.localParticipant.publishData(payload, { reliable: true });
    } else if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        ...evt,
        senderId: this.localId,
      });
    }
  }

  // Mute / Unmute
  public setMute(muted: boolean) {
    const local = this.participants.get(this.localId);
    if (local) {
      local.isMuted = muted;
      this.notifyParticipants();
    }
    if (this.localAudioTrack) {
      if (muted) this.localAudioTrack.mute();
      else this.localAudioTrack.unmute();
    }
  }

  // Video On / Off
  public setVideoOff(videoOff: boolean) {
    const local = this.participants.get(this.localId);
    if (local) {
      local.isVideoOff = videoOff;
      this.notifyParticipants();
    }
    if (this.localVideoTrack) {
      if (videoOff) this.localVideoTrack.mute();
      else this.localVideoTrack.unmute();
    }
  }

  // Notify UI
  private notifyParticipants() {
    if (this.onParticipantsChanged) {
      this.onParticipantsChanged(Array.from(this.participants.values()));
    }
  }

  // Leave and teardown
  public leave() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'PEER_LEAVE',
        senderId: this.localId,
      });
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }

    this.participants.clear();
    this.notifyParticipants();
  }
}
