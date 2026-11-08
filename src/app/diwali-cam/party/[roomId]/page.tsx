'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ARCameraPipeline } from '@/lib/diwali-cam/arCameraPipeline';
import { LivekitPartyManager } from '@/lib/diwali-cam/livekitService';
import FilterControlPanel from '@/components/diwali-cam/FilterControlPanel';
import {
  PartyParticipant,
  PartyChatMessage,
  DiwaliGestureType,
  ARFilterSettings,
  RoomCelebrationEvent,
} from '@/types/diwali-cam';
import { soundManager } from '@/lib/audio';

const QUICK_REACTIONS = ['🪔', '🎆', '🚀', '✨', '💥', '🎉', '❤️', '👏'];

function PartyRoomContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawParam = (params?.roomId as string) || 'DIWALI-PARTY';
  const roomId = decodeURIComponent(rawParam).trim().toUpperCase();
  const username = searchParams.get('name') || 'Festive Guest';
  const isHost = searchParams.get('role') === 'host';
  const initialCam = searchParams.get('cam') !== '0';
  const initialMic = searchParams.get('mic') !== '0';

  // Refs
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipelineRef = useRef<ARCameraPipeline | null>(null);
  const partyManagerRef = useRef<LivekitPartyManager | null>(null);

  // State
  const [participants, setParticipants] = useState<PartyParticipant[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Initializing Diwali Cam...');
  const [isLiveKitSFU, setIsLiveKitSFU] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(!initialMic);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(!initialCam);
  const [activeGestures, setActiveGestures] = useState<DiwaliGestureType[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState<string>('Starting camera...');

  // Drawers & Controls
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(true);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<PartyChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const [roomCelebrationActive, setRoomCelebrationActive] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Filter settings state
  const [filterSettings, setFilterSettings] = useState<ARFilterSettings>({
    gestureControlEnabled: true,
    arEffectsEnabled: true,
    intensity: 1.0,
    soundEnabled: true,
    activeManualEffects: new Set<DiwaliGestureType>(),
  });

  // Initialize pipeline & party manager
  useEffect(() => {
    let active = true;

    async function initParty() {
      if (!localCanvasRef.current) return;

      const pipeline = new ARCameraPipeline();
      pipelineRef.current = pipeline;

      pipeline.onStatusChange = (status) => {
        if (active) setPipelineStatus(status);
      };

      pipeline.onGestureDetected = (gestures) => {
        if (active && gestures.length > 0) {
          setActiveGestures(gestures.map((g) => g.type));
          setTimeout(() => {
            if (active) setActiveGestures([]);
          }, 800);
        }
      };

      try {
        const { processedStream, rawAudioTrack } = await pipeline.startCamera(localCanvasRef.current);

        if (!active) {
          pipeline.stop();
          return;
        }

        // Apply initial mute/cam settings
        if (!initialCam) pipeline.setVideoEnabled(false);
        if (!initialMic) pipeline.setAudioEnabled(false);

        // Initialize LiveKit / WebRTC Party Manager
        const partyManager = new LivekitPartyManager();
        partyManagerRef.current = partyManager;

        partyManager.onParticipantsChanged = (updated) => {
          if (active) setParticipants([...updated]);
        };

        partyManager.onConnectionState = (state, isLiveKit) => {
          if (active) {
            setConnectionStatus(state);
            setIsLiveKitSFU(isLiveKit);
          }
        };

        partyManager.onChatMessage = (msg) => {
          if (active) {
            setChatMessages((prev) => [...prev, msg]);
            if (msg.isReaction) {
              triggerFloatingReaction(msg.text);
            }
          }
        };

        partyManager.onRoomCelebration = (evt: RoomCelebrationEvent) => {
          if (active) {
            setRoomCelebrationActive(true);
            soundManager.playFireworkBurst();
            pipeline.triggerManualEffect('finale');
            setTimeout(() => {
              if (active) setRoomCelebrationActive(false);
            }, 3500);
          }
        };

        await partyManager.joinParty(roomId, username, processedStream, rawAudioTrack, isHost);
      } catch (err: any) {
        console.error('Error starting Diwali Cam party:', err);
        if (active) {
          setConnectionStatus('Camera error: ' + (err.message || 'Permission denied'));
        }
      }
    }

    initParty();

    return () => {
      active = false;
      if (partyManagerRef.current) {
        partyManagerRef.current.leave();
        partyManagerRef.current = null;
      }
      if (pipelineRef.current) {
        pipelineRef.current.stop();
        pipelineRef.current = null;
      }
    };
  }, [roomId, username, isHost, initialCam, initialMic]);

  // Floating reaction animation
  const triggerFloatingReaction = (emoji: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const left = Math.floor(20 + Math.random() * 60);
    setFloatingReactions((prev) => [...prev, { id, emoji, left }]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    soundManager.playClick();
    const next = !isMicMuted;
    setIsMicMuted(next);
    pipelineRef.current?.setAudioEnabled(!next);
    partyManagerRef.current?.setMute(next);
  };

  // Toggle Video
  const handleToggleVideo = () => {
    soundManager.playClick();
    const next = !isVideoOff;
    setIsVideoOff(next);
    pipelineRef.current?.setVideoEnabled(!next);
    partyManagerRef.current?.setVideoOff(next);
  };

  // Leave Party
  const handleLeaveParty = () => {
    soundManager.playClick();
    if (pipelineRef.current) {
      pipelineRef.current.stop();
    }
    if (partyManagerRef.current) {
      partyManagerRef.current.leave();
    }
    router.push('/diwali-cam');
  };

  // Filter settings updates
  const handleUpdateFilterSettings = (newSettings: Partial<ARFilterSettings>) => {
    setFilterSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (pipelineRef.current) {
        pipelineRef.current.settings = updated;
      }
      return updated;
    });
  };

  // Manual Trigger Effect
  const handleTriggerManualEffect = (effect: DiwaliGestureType) => {
    pipelineRef.current?.triggerManualEffect(effect);
  };

  // Send Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    soundManager.playClick();
    partyManagerRef.current?.sendChatMessage(chatInput.trim(), false);
    setChatInput('');
  };

  // Send Emoji Reaction
  const handleSendReaction = (emoji: string) => {
    soundManager.playClick();
    triggerFloatingReaction(emoji);
    partyManagerRef.current?.sendChatMessage(emoji, true);
  };

  // Synchronized Room Celebration
  const handleTriggerCelebration = () => {
    soundManager.playClick();
    soundManager.playRocketLaunch();
    partyManagerRef.current?.triggerRoomCelebration('finale');
  };

  // Copy Room Code / Link
  const handleCopyRoomCode = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Determine grid columns based on total participants
  const totalCount = Math.max(1, participants.length);
  const gridClasses =
    totalCount === 1
      ? 'grid-cols-1'
      : totalCount === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : totalCount <= 4
      ? 'grid-cols-2'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className="flex flex-col flex-1 w-full bg-surface-dim relative overflow-hidden select-none">
      {/* Room Grand Celebration Banner Overlay */}
      {roomCelebrationActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-pulse">
          <div className="p-6 rounded-3xl bg-surface-container/95 border-2 border-primary shadow-[0_0_50px_rgba(255,193,108,0.8)] text-center space-y-2">
            <span className="text-5xl animate-bounce inline-block">🎆🪔✨</span>
            <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-primary uppercase tracking-wider drop-shadow-md">
              HAPPY DIWALI!
            </h2>
            <p className="font-hud-code text-xs font-bold text-tertiary uppercase tracking-widest">
              ROOM-WIDE CELEBRATION DETONATED
            </p>
          </div>
        </div>
      )}

      {/* Floating Reactions Emitter */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.left}%` }}
            className="absolute bottom-20 text-4xl animate-floatUp"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Party Status Bar */}
      <div className="w-full bg-surface-container/80 backdrop-blur-md px-margin-sm py-2.5 flex items-center justify-between border-b border-outline-variant/30 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/40">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="font-hud-code text-xs font-bold text-primary tracking-wider">
              {roomId}
            </span>
            <button
              onClick={handleCopyRoomCode}
              title="Copy Room Code"
              className="ml-1 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">
                {copiedCode ? 'check' : 'content_copy'}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-on-surface-variant font-hud-code">
            <span className="material-symbols-outlined text-[16px] text-tertiary">group</span>
            <span>
              {totalCount}/8 Participants
            </span>
          </div>
        </div>

        {/* LiveKit Connection Badge & Pipeline Status */}
        <div className="flex items-center gap-2">
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-hud-code font-bold uppercase border ${
              isLiveKitSFU
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-tertiary/20 text-tertiary border-tertiary/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            <span>{isLiveKitSFU ? 'LiveKit SFU Active' : 'WebRTC Peer Mode'}</span>
          </div>

          {/* Room-wide celebration button */}
          <button
            onClick={handleTriggerCelebration}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-hud-code text-xs font-bold uppercase tracking-wider shadow-diya flex items-center gap-1 active:scale-95 transition-all"
            title="Trigger Room-Wide Finale"
          >
            <span className="material-symbols-outlined text-[16px]">celebration</span>
            <span className="hidden sm:inline">Grand Finale</span>
          </button>
        </div>
      </div>

      {/* Main Party Video Grid & Side Drawers */}
      <div className="flex-1 flex flex-col md:flex-row relative p-3 gap-3 overflow-hidden">
        {/* Responsive Video Tiles Grid */}
        <div className={`flex-1 grid ${gridClasses} gap-3 auto-rows-fr h-full overflow-y-auto`}>
          {/* Local Participant Tile (Canvas with AR stream) */}
          <div className="relative rounded-2xl bg-surface-container-lowest overflow-hidden border-2 border-primary/50 shadow-2xl flex items-center justify-center aspect-video sm:aspect-auto">
            <canvas
              ref={localCanvasRef}
              className={`w-full h-full object-cover ${isVideoOff ? 'opacity-20' : ''}`}
            />

            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-high/80">
                <span className="material-symbols-outlined text-4xl mb-1">videocam_off</span>
                <span className="text-xs font-mono">Camera Off</span>
              </div>
            )}

            {/* Local Tile Label Badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container/85 backdrop-blur-md border border-primary/30">
              <span className="text-xs font-bold text-on-surface truncate max-w-[120px]">
                {username} (You)
              </span>
              {isHost && (
                <span className="text-[9px] font-hud-code font-bold px-1.5 py-0.2 rounded bg-primary text-on-primary">
                  HOST
                </span>
              )}
              <span
                className={`material-symbols-outlined text-[15px] ${
                  isMicMuted ? 'text-error' : 'text-primary'
                }`}
              >
                {isMicMuted ? 'mic_off' : 'mic'}
              </span>
            </div>

            {/* Active Gesture HUD Pill */}
            {activeGestures.length > 0 && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/90 text-on-primary text-xs font-hud-code font-bold tracking-wider animate-bounce shadow-diya">
                GESTURE: {activeGestures[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Remote Participants' Video Tiles */}
          {participants
            .filter((p) => !p.isLocal)
            .map((p) => (
              <RemoteParticipantTile key={p.id} participant={p} />
            ))}

          {/* Empty Slot Placeholder if only 1 user */}
          {participants.filter((p) => !p.isLocal).length === 0 && (
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-container/40 border border-dashed border-outline-variant/40 text-center space-y-2 aspect-video sm:aspect-auto">
              <span className="text-3xl">🪔</span>
              <h3 className="font-headline-sm text-sm font-bold text-primary">
                Waiting for Friends...
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed">
                Share room code <span className="text-tertiary font-bold font-mono">{roomId}</span> with family and friends to celebrate together!
              </p>
              <button
                onClick={handleCopyRoomCode}
                className="mt-2 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs font-hud-code font-bold text-tertiary border border-tertiary/30 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>{copiedCode ? 'Copied Code!' : 'Copy Invite Code'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Control Panel Drawer (Desktop Right Side / Collapsible) */}
        {showFilterPanel && (
          <div className="w-full md:w-80 flex-shrink-0 z-20">
            <FilterControlPanel
              settings={filterSettings}
              onUpdateSettings={handleUpdateFilterSettings}
              onTriggerEffect={handleTriggerManualEffect}
              activeGestures={activeGestures}
              isExpanded={true}
              onToggleExpand={() => setShowFilterPanel(false)}
            />
          </div>
        )}

        {/* Chat & Reactions Drawer */}
        {showChat && (
          <div className="w-full md:w-80 flex-shrink-0 bg-surface-container/95 backdrop-blur-xl border border-outline-variant/40 rounded-2xl shadow-2xl flex flex-col h-72 md:h-full z-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 bg-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">chat</span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">Party Chat</span>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.length === 0 ? (
                <div className="text-center text-on-surface-variant/60 py-8 font-mono text-[11px]">
                  Send the first Diwali wish! 🪔
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col p-2 rounded-xl ${
                      msg.senderName === username
                        ? 'bg-primary-container/20 text-on-surface border border-primary/20 ml-4'
                        : 'bg-surface-container-high/80 text-on-surface mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-tertiary font-hud-code">
                      <span className="font-bold">{msg.senderName}</span>
                      <span className="opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="text-xs mt-0.5 leading-snug">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Fast Emoji Reactions Bar */}
            <div className="px-3 py-2 border-t border-outline-variant/30 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar bg-surface-container-lowest/50">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-bright flex items-center justify-center text-lg active:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-outline-variant/30 flex gap-2">
              <input
                type="text"
                placeholder="Type Diwali message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-surface-container-high border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-tertiary"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-tertiary text-on-tertiary font-bold text-xs hover:bg-tertiary-fixed transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Control Bar */}
      <div className="w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 px-4 py-3 flex items-center justify-between gap-2 z-30 shadow-2xl">
        <div className="flex items-center gap-2">
          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isMicMuted
                ? 'bg-error-container text-on-error-container shadow-sm'
                : 'bg-surface-container text-primary border border-primary/40'
            }`}
            title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMicMuted ? 'mic_off' : 'mic'}
            </span>
          </button>

          {/* Camera Toggle */}
          <button
            onClick={handleToggleVideo}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isVideoOff
                ? 'bg-error-container text-on-error-container shadow-sm'
                : 'bg-surface-container text-primary border border-primary/40'
            }`}
            title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isVideoOff ? 'videocam_off' : 'videocam'}
            </span>
          </button>

          {/* Filter Panel Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowFilterPanel(!showFilterPanel);
            }}
            className={`px-3.5 h-11 rounded-full flex items-center gap-1.5 transition-all text-xs font-hud-code font-bold border ${
              showFilterPanel
                ? 'bg-primary text-on-primary border-primary shadow-diya'
                : 'bg-surface-container text-on-surface-variant hover:text-primary border-outline-variant/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">magic_button</span>
            <span className="hidden sm:inline">AR Filters</span>
          </button>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Chat Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowChat(!showChat);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${
              showChat
                ? 'bg-tertiary text-on-tertiary border-tertiary'
                : 'bg-surface-container text-on-surface-variant hover:text-tertiary border-outline-variant/40'
            }`}
            title="Toggle Chat"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
          </button>

          {/* Leave Party Button */}
          <button
            onClick={handleLeaveParty}
            className="px-4 h-11 rounded-full bg-error text-on-error font-hud-code text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-error-container transition-all active:scale-95 shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">call_end</span>
            <span className="hidden sm:inline">Leave Party</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Remote Participant Video Tile Component
function RemoteParticipantTile({ participant }: { participant: PartyParticipant }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative rounded-2xl bg-surface-container-lowest overflow-hidden border border-outline-variant/40 shadow-xl flex items-center justify-center aspect-video sm:aspect-auto">
      {participant.stream && !participant.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-4">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary text-xl font-bold mb-2 border border-primary/20">
            {participant.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-mono">{participant.name}</span>
          <span className="text-[10px] text-on-surface-variant/60 font-mono mt-0.5">
            Camera Off
          </span>
        </div>
      )}

      {/* Participant Name Badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container/85 backdrop-blur-md border border-outline-variant/30">
        <span className="text-xs font-semibold text-on-surface truncate max-w-[120px]">
          {participant.name}
        </span>
        <span
          className={`material-symbols-outlined text-[15px] ${
            participant.isMuted ? 'text-error' : 'text-primary'
          }`}
        >
          {participant.isMuted ? 'mic_off' : 'mic'}
        </span>
      </div>
    </div>
  );
}

export default function PartyRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-primary font-hud-code">
          Joining Diwali Cam Party...
        </div>
      }
    >
      <PartyRoomContent />
    </Suspense>
  );
}
