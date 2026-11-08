// DIWALI CAM — Live Video & Audio Party Service
// Dual engine: Full LiveKit SFU Client with automatic Cross-Device WebRTC Peer Mesh fallback

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
  private localRawAudioTrack: MediaStreamTrack | null = null;

  private participants: Map<string, PartyParticipant> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();

  // Cross-device signaling polling state
  private pollIntervalId: any = null;
  private lastSignalTimestamp: number = 0;
  private isDestroyed: boolean = false;

  // Callbacks
  public onParticipantsChanged?: (participants: PartyParticipant[]) => void;
  public onChatMessage?: (msg: PartyChatMessage) => void;
  public onRoomCelebration?: (evt: RoomCelebrationEvent) => void;
  public onConnectionState?: (state: string, isLiveKit: boolean) => void;

  constructor() {
    this.localId = 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  }

  public async joinParty(
    rawRoomId: string,
    username: string,
    processedVideoStream: MediaStream,
    rawAudioTrack: MediaStreamTrack | null,
    isHost: boolean = false
  ) {
    this.isDestroyed = false;
    this.roomId = (rawRoomId || 'DIWALI-PARTY').trim().toUpperCase();
    this.localName = username || 'Festive Guest';
    this.localProcessedStream = processedVideoStream;
    this.localRawAudioTrack = rawAudioTrack;

    this.onConnectionState?.('Connecting to Diwali Cam room...', false);

    // 1. Add local participant to UI
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

    // 2. Try requesting LiveKit server token
    let tokenData: any = null;
    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: this.roomId, username: this.localName }),
      });
      if (res.ok) {
        tokenData = await res.json();
      }
    } catch (e) {
      console.warn('Could not contact LiveKit token API:', e);
    }

    // 3. If LiveKit credentials configured, connect via LiveKit SFU
    if (tokenData && tokenData.configured && tokenData.token && tokenData.wsUrl) {
      try {
        await this.connectLiveKit(tokenData.wsUrl, tokenData.token, processedVideoStream, rawAudioTrack);
        this.isLiveKitActive = true;
        this.onConnectionState?.('Connected via LiveKit Cloud SFU', true);
        return;
      } catch (lkErr) {
        console.warn('LiveKit SFU connection error, switching to WebRTC Mesh fallback:', lkErr);
      }
    }

    // 4. Fallback: Cross-Device WebRTC Mesh (works on separate phones, laptops, and networks without credentials)
    this.onConnectionState?.('Connected (Direct Multi-Device WebRTC)', false);
    this.initCrossDeviceMesh();
  }

  // -------------------------------------------------------------
  // LiveKit SFU Implementation (when LiveKit credentials are set)
  // -------------------------------------------------------------
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

    // Handle new participant joining
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

    // Handle participant leaving
    this.room.on(RoomEvent.ParticipantDisconnected, (p) => {
      this.participants.delete(p.identity);
      this.notifyParticipants();
    });

    // Handle subscribed tracks
    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant) => {
      let existing = this.participants.get(participant.identity);
      if (!existing) {
        existing = {
          id: participant.identity,
          name: participant.name || participant.identity,
          isLocal: false,
          isMuted: !participant.isMicrophoneEnabled,
          isVideoOff: !participant.isCameraEnabled,
        };
        this.participants.set(participant.identity, existing);
      }

      if (track.kind === Track.Kind.Video) {
        existing.stream = new MediaStream([track.mediaStreamTrack]);
        existing.isVideoOff = false;
      } else if (track.kind === Track.Kind.Audio) {
        track.attach();
        existing.isMuted = false;
      }
      this.notifyParticipants();
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

    // Connect to LiveKit room
    await this.room.connect(wsUrl, token);

    // CRITICAL FIX: Immediately load any existing participants who were already in the room!
    this.room.remoteParticipants.forEach((p) => {
      const part: PartyParticipant = {
        id: p.identity,
        name: p.name || p.identity,
        isLocal: false,
        isMuted: !p.isMicrophoneEnabled,
        isVideoOff: !p.isCameraEnabled,
      };

      p.trackPublications.forEach((pub) => {
        if (pub.track) {
          if (pub.kind === Track.Kind.Video) {
            part.stream = new MediaStream([pub.track.mediaStreamTrack]);
            part.isVideoOff = false;
          } else if (pub.kind === Track.Kind.Audio) {
            pub.track.attach();
            part.isMuted = false;
          }
        }
      });

      this.participants.set(p.identity, part);
    });
    this.notifyParticipants();

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

  // -------------------------------------------------------------
  // Cross-Device WebRTC Mesh Fallback (Zero Config / Free)
  // -------------------------------------------------------------
  private initCrossDeviceMesh() {
    const pcConfig: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    };

    // Helper to send a signaling packet via HTTP
    const sendSignal = async (type: string, payload?: any, targetId?: string) => {
      if (this.isDestroyed) return;
      try {
        await fetch('/api/diwali-cam/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room: this.roomId,
            senderId: this.localId,
            senderName: this.localName,
            targetId,
            type,
            payload,
          }),
        });
      } catch (e) {
        // network retry
      }
    };

    // Helper to create PeerConnection with a remote peer
    const getOrCreatePeerConnection = (remoteId: string, remoteName: string): RTCPeerConnection => {
      let pc = this.peerConnections.get(remoteId);
      if (pc) return pc;

      pc = new RTCPeerConnection(pcConfig);
      this.peerConnections.set(remoteId, pc);

      // Add local video & audio tracks
      if (this.localProcessedStream) {
        this.localProcessedStream.getTracks().forEach((track) => {
          pc!.addTrack(track, this.localProcessedStream!);
        });
      }
      if (this.localRawAudioTrack) {
        pc.addTrack(this.localRawAudioTrack);
      }

      // Handle receiving remote tracks
      pc.ontrack = (event) => {
        const stream = event.streams[0] || new MediaStream([event.track]);
        let participant = this.participants.get(remoteId);
        if (!participant) {
          participant = {
            id: remoteId,
            name: remoteName,
            isLocal: false,
            isMuted: false,
            isVideoOff: false,
          };
          this.participants.set(remoteId, participant);
        }
        participant.stream = stream;
        participant.isVideoOff = false;
        this.notifyParticipants();
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal('CANDIDATE', event.candidate.toJSON(), remoteId);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc?.connectionState === 'disconnected' || pc?.connectionState === 'failed') {
          this.participants.delete(remoteId);
          this.peerConnections.delete(remoteId);
          this.notifyParticipants();
        }
      };

      return pc;
    };

    // Setup local BroadcastChannel for ultra-fast local tab testing too
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(`diwali_cam_${this.roomId}`);
        this.broadcastChannel.onmessage = (event) => {
          const data = event.data;
          if (!data || data.senderId === this.localId) return;
          if (data.type === 'CHAT') {
            this.onChatMessage?.(data.message);
          } else if (data.type === 'CELEBRATION_TRIGGER') {
            this.onRoomCelebration?.(data);
          }
        };
      } catch (e) {}
    }

    // Polling loop for cross-device signaling
    const pollSignals = async () => {
      if (this.isDestroyed) return;
      try {
        const res = await fetch(
          `/api/diwali-cam/signal?room=${encodeURIComponent(this.roomId)}&peerId=${encodeURIComponent(
            this.localId
          )}&since=${this.lastSignalTimestamp}`
        );

        if (res.ok) {
          const data = await res.json();
          if (data.serverTime) {
            this.lastSignalTimestamp = data.serverTime;
          }

          // 1. Process active peers in room
          if (Array.isArray(data.peers)) {
            data.peers.forEach((peer: { id: string; name: string }) => {
              if (peer.id !== this.localId) {
                // Ensure participant exists in state
                if (!this.participants.has(peer.id)) {
                  this.participants.set(peer.id, {
                    id: peer.id,
                    name: peer.name,
                    isLocal: false,
                    isMuted: false,
                    isVideoOff: false,
                  });
                  this.notifyParticipants();
                }

                // If localId is lexicographically greater, initiate the offer
                if (this.localId > peer.id && !this.peerConnections.has(peer.id)) {
                  const pc = getOrCreatePeerConnection(peer.id, peer.name);
                  pc.createOffer()
                    .then((offer) => pc.setLocalDescription(offer).then(() => offer))
                    .then((offer) => {
                      sendSignal('OFFER', offer, peer.id);
                    })
                    .catch((err) => console.warn('Error creating WebRTC offer:', err));
                }
              }
            });
          }

          // 2. Process incoming signaling messages
          if (Array.isArray(data.messages)) {
            for (const msg of data.messages) {
              const senderId = msg.senderId;
              const senderName = msg.senderName;

              if (msg.type === 'JOIN') {
                if (!this.participants.has(senderId)) {
                  this.participants.set(senderId, {
                    id: senderId,
                    name: senderName,
                    isLocal: false,
                    isMuted: false,
                    isVideoOff: false,
                  });
                  this.notifyParticipants();
                }

                // If this is the older/initiator peer, send an offer to the newcomer
                const pc = getOrCreatePeerConnection(senderId, senderName);
                if (pc.signalingState === 'stable') {
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  sendSignal('OFFER', offer, senderId);
                }
              } else if (msg.type === 'OFFER' && msg.payload) {
                const pc = getOrCreatePeerConnection(senderId, senderName);
                await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignal('ANSWER', answer, senderId);
              } else if (msg.type === 'ANSWER' && msg.payload) {
                const pc = this.peerConnections.get(senderId);
                if (pc && pc.signalingState !== 'stable') {
                  await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
                }
              } else if (msg.type === 'CANDIDATE' && msg.payload) {
                const pc = this.peerConnections.get(senderId);
                if (pc && pc.remoteDescription) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
                  } catch (e) {}
                }
              } else if (msg.type === 'CHAT' && msg.payload) {
                this.onChatMessage?.(msg.payload);
              } else if (msg.type === 'CELEBRATION' && msg.payload) {
                this.onRoomCelebration?.(msg.payload);
              } else if (msg.type === 'LEAVE') {
                this.participants.delete(senderId);
                const pc = this.peerConnections.get(senderId);
                if (pc) {
                  pc.close();
                  this.peerConnections.delete(senderId);
                }
                this.notifyParticipants();
              }
            }
          }
        }
      } catch (err) {
        // Poll retry
      }
    };

    // Send initial join announce to room
    sendSignal('JOIN');

    // Poll every 1.5 seconds for active peers & incoming messages
    this.pollIntervalId = setInterval(pollSignals, 1500);
    pollSignals();
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

    // Broadcast via LiveKit if active
    if (this.isLiveKitActive && this.room) {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'CHAT', message: msg }));
      this.room.localParticipant.publishData(payload, { reliable: true });
    } else {
      // Broadcast via HTTP Signal & local BroadcastChannel
      fetch('/api/diwali-cam/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: this.roomId,
          senderId: this.localId,
          senderName: this.localName,
          type: 'CHAT',
          payload: msg,
        }),
      }).catch(() => {});

      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'CHAT', message: msg });
      }
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
    } else {
      fetch('/api/diwali-cam/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: this.roomId,
          senderId: this.localId,
          senderName: this.localName,
          type: 'CELEBRATION',
          payload: evt,
        }),
      }).catch(() => {});

      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(evt);
      }
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
    this.isDestroyed = true;

    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }

    if (!this.isLiveKitActive) {
      fetch('/api/diwali-cam/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: this.roomId,
          senderId: this.localId,
          senderName: this.localName,
          type: 'LEAVE',
        }),
      }).catch(() => {});
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();

    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }

    this.participants.clear();
    this.notifyParticipants();
  }
}
