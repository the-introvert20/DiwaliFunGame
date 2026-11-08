'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { soundManager } from '@/lib/audio';
import { getPlayerProfile } from '@/lib/storage';

interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  level: number;
  ship: string;
  isHost: boolean;
  status: 'READY' | 'TUNING' | 'WAITING';
  ping: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  color: string;
}

function RoomLobbyContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = (params?.roomId as string) || 'DW-8492';
  const game = searchParams.get('game') || 'rocket-rush';
  const isHostParam = searchParams.get('host') === 'true';

  const [copied, setCopied] = useState(false);
  const [hazardsEnabled, setHazardsEnabled] = useState(true);
  const [turboBoostEnabled, setTurboBoostEnabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Aarav_Gamer',
      text: "Let's use the chakra boost shortcuts on lap 2! 🚀",
      time: '2m ago',
      color: 'text-tertiary',
    },
    {
      id: '2',
      sender: 'Priya_Pro',
      text: 'Almost ready, equipping the golden sparkler trail ✨🪔',
      time: 'Just now',
      color: 'text-secondary',
    },
  ]);

  const [squad, setSquad] = useState<SquadMember[]>([]);

  useEffect(() => {
    const profile = getPlayerProfile();
    setSquad([
      {
        id: profile.id,
        name: `${profile.username} (You)`,
        avatar: profile.avatar,
        level: profile.level,
        ship: 'Saffron Comet',
        isHost: true,
        status: 'READY',
        ping: 16,
      },
      {
        id: 'user_aarav',
        name: 'Aarav_Gamer',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCg31mhbZO8yZlKywmVwHjFyQ_hoHR5ZTtoXALxkRvj05RmTKm8ZEPFdTT_3g-n_iFvLjJF-WIsqXOQb9MS5crCylDgq0oiyTtdf_H35sxlmR7hCspZ0hBd7erB79xVahFCdj69aVAJXcgRI8DVLDzs5ylK_niE5vvdWeVBAij4f2heGLbEsK55ucjaWM-0lU8t6lpxXC6X0jwAOy0DPEIw4f8l_ntDIWqKIBqOR60',
        level: 38,
        ship: 'Neon Chakra',
        isHost: false,
        status: 'READY',
        ping: 24,
      },
      {
        id: 'user_priya',
        name: 'Priya_Pro',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuATL6hJvjH-d9ff9n-JNzouBTs4VBwAjD0T1x_UpHR_A5u8mqMnh97txQab3-evrTPLtmK2ItUu42iaLa6g_GOJFjYr7y1zX20W66FBLrHBeDL1499IkoP3zDUrVudBE4uZiAvwvRdeRjcTI-7GmH9DUekBi9JxTyaB-9S6vWlAhpYq23xqW6VVKejqi7ey6lXkEd6TWxfBZl_uUWMdcEiFK0ToCBb5X3vsoyPenJM',
        level: 50,
        ship: 'Selecting Loadout...',
        isHost: false,
        status: 'TUNING',
        ping: 18,
      },
    ]);
  }, []);

  const copyRoomCode = () => {
    soundManager.playClick();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(roomId);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInviteLink = () => {
    soundManager.playClick();
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Join DiwaliVerse Squad Room!',
        text: `Join my private room ${roomId} in DiwaliVerse!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      copyRoomCode();
      alert(`Invite link for room ${roomId} copied to clipboard!`);
    }
  };

  const sendReaction = (emoji: string) => {
    soundManager.playClick();
    soundManager.playChime();
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'You',
      text: `${emoji} Festive cheer sent to squad!`,
      time: 'Just now',
      color: 'text-primary',
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const triggerRaceLaunch = () => {
    soundManager.playClick();
    soundManager.playCountdownTick();
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        soundManager.playCountdownTick();
        setCountdown(count);
      } else if (count === 0) {
        soundManager.playCountdownGo();
        soundManager.playRocketLaunch();
        setCountdown(0);
      } else {
        clearInterval(interval);
        router.push(`/games/${game}?room=${roomId}`);
      }
    }, 1000);
  };

  const abortCountdown = () => {
    soundManager.playClick();
    setCountdown(null);
  };

  return (
    <div className="flex flex-col w-full px-margin-sm pb-10 space-y-space-md max-w-2xl mx-auto select-none">
      {/* Ambient Skyway Visual Accent */}
      <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-low shadow-xl border border-outline-variant/30">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-container/20 via-primary-container/10 to-transparent pointer-events-none"></div>
        <div className="p-space-md flex flex-col gap-space-xs relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_10px_#00e1ef]"></span>
              <span className="font-hud-code text-[11px] uppercase tracking-wider text-tertiary font-bold">
                Live Match Bay
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-highest/80 px-2.5 py-0.5 rounded-full shadow-inner border border-outline-variant/30">
              <span className="material-symbols-outlined text-[14px] text-primary">wifi</span>
              <span className="font-hud-metric text-label-sm text-on-surface">Asia South (18ms)</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <h2 className="font-headline-md text-headline-sm text-on-surface tracking-tight font-extrabold uppercase">
              {game.replace('-', ' ')}
            </h2>
            <span className="font-label-sm text-label-sm text-secondary-fixed-dim bg-secondary-container/40 px-2 py-0.5 rounded font-semibold">
              4 Laps · Power-ups ON
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[16px] text-primary">navigation</span>
            Chandni Chowk Skyway · Circuit 04
          </p>
        </div>
      </div>

      {/* Room Code Card */}
      <div className="w-full bg-surface-container rounded-xl p-space-md shadow-lg flex flex-col gap-space-sm relative overflow-hidden border border-outline-variant/30">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Private Squad Room
          </span>
          <span className="font-hud-code text-label-sm text-primary font-bold">
            {squad.length} / 4 PLAYERS
          </span>
        </div>
        <div className="flex items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">key</span>
            <div>
              <span className="block font-label-sm text-[10px] uppercase text-outline font-semibold">PIN Code</span>
              <span className="font-hud-timer-mobile text-hud-timer-mobile text-primary tracking-widest font-bold">
                {roomId}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-1 px-3 py-2 bg-surface-container-high active:bg-surface-bright rounded-lg text-on-surface hover:text-primary transition-all active:scale-95 shadow-sm border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span className="font-label-sm text-label-sm font-semibold">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={shareInviteLink}
              className="flex items-center gap-1 px-3 py-2 bg-primary-container text-on-primary-container font-semibold rounded-lg hover:bg-primary transition-all active:scale-95 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span className="font-label-sm text-label-sm">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Squad Slots (Grid Cards) */}
      <div className="space-y-space-xs">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline-sm text-label-md uppercase tracking-wider text-on-surface font-semibold">
            Grid Lineup
          </h3>
          <span className="font-hud-metric text-[12px] text-tertiary font-bold">
            Ready Check: {squad.filter((s) => s.status === 'READY').length}/{squad.length}
          </span>
        </div>

        {/* Squad Members */}
        {squad.map((member) => (
          <div
            key={member.id}
            className="w-full bg-surface-container p-space-sm rounded-xl flex items-center justify-between gap-space-sm relative overflow-hidden shadow-md border border-outline-variant/20"
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                member.isHost ? 'bg-primary shadow-[0_0_12px_#ffc16c]' : 'bg-tertiary shadow-[0_0_10px_#00e1ef]'
              }`}
            ></div>
            <div className="flex items-center gap-space-sm pl-2">
              <div className="relative">
                <img
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover shadow-[0_0_10px_rgba(232,163,60,0.4)] ring-1 ring-primary/40"
                  src={member.avatar}
                />
                {member.isHost && (
                  <span className="absolute -bottom-1 -right-1 bg-surface-container-lowest text-primary text-[11px] p-0.5 rounded-full flex items-center justify-center">
                    👑
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-body-md text-on-surface font-bold leading-tight">
                    {member.name}
                  </span>
                  <span className="font-label-sm text-[11px] text-primary-fixed bg-surface-container-highest px-1.5 rounded">
                    LVL {member.level}
                  </span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5 font-medium">
                  <span className="material-symbols-outlined text-[13px] text-secondary">rocket_launch</span>
                  {member.ship}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`font-hud-code text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  member.status === 'READY'
                    ? 'text-on-primary bg-primary shadow-[0_0_12px_rgba(255,193,108,0.4)]'
                    : 'text-secondary bg-surface-container-highest'
                }`}
              >
                {member.isHost ? 'HOST READY' : member.status}
              </span>
              <span className="font-hud-metric text-[11px] text-outline">{member.ping}ms</span>
            </div>
          </div>
        ))}

        {/* Empty Slot 4 */}
        <button
          onClick={shareInviteLink}
          className="w-full bg-surface-container/40 p-space-sm rounded-xl flex items-center justify-between gap-space-sm transition-all active:scale-[0.99] hover:bg-surface-container/70 group shadow-inner border border-dashed border-outline-variant/40"
        >
          <div className="flex items-center gap-space-sm pl-2">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(232,163,60,0.15)]">
              <span className="material-symbols-outlined text-[24px]">flare</span>
            </div>
            <div className="text-left">
              <span className="font-headline-sm text-body-md text-primary font-semibold flex items-center gap-1">
                + Invite Racer
              </span>
              <p className="font-body-sm text-[12px] text-on-surface-variant">Tap to invite friends or share code</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:text-primary pr-2 transition-colors">
            person_add
          </span>
        </button>
      </div>

      {/* Room Rules Panel */}
      <div className="w-full bg-surface-container rounded-xl p-space-md shadow-lg space-y-space-sm border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
            Match Configuration
          </span>
          <span className="font-hud-code text-[11px] text-tertiary bg-surface-container-highest px-2 py-0.5 rounded font-bold">
            CIRCUIT 04
          </span>
        </div>

        {/* Hazard toggle */}
        <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between border border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">auto_awesome</span>
            <div>
              <span className="font-label-md text-label-md text-on-surface block font-semibold">
                Lantern Hazards &amp; Sparks
              </span>
              <span className="font-body-sm text-[12px] text-outline">Dynamic night fireworks obstacled laps</span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              setHazardsEnabled(!hazardsEnabled);
            }}
            className={`w-10 h-6 rounded-full relative flex items-center p-0.5 cursor-pointer transition-colors ${
              hazardsEnabled ? 'bg-primary shadow-[0_0_10px_rgba(255,193,108,0.4)]' : 'bg-surface-variant'
            }`}
          >
            <div
              className={`w-5 h-5 bg-on-primary rounded-full transition-transform shadow ${
                hazardsEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Boost toggle */}
        <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between border border-outline-variant/20">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-tertiary text-[20px]">speed</span>
            <div>
              <span className="font-label-md text-label-md text-on-surface block font-semibold">
                Festive Turbo Velocity
              </span>
              <span className="font-body-sm text-[12px] text-outline">Boost pad multiplier locked to 1.5x</span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              setTurboBoostEnabled(!turboBoostEnabled);
            }}
            className={`w-10 h-6 rounded-full relative flex items-center p-0.5 cursor-pointer transition-colors ${
              turboBoostEnabled ? 'bg-primary shadow-[0_0_10px_rgba(255,193,108,0.4)]' : 'bg-surface-variant'
            }`}
          >
            <div
              className={`w-5 h-5 bg-on-primary rounded-full transition-transform shadow ${
                turboBoostEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Squad Live Chat & Quick Reaction Deck */}
      <div className="w-full bg-surface-container rounded-xl p-space-md shadow-lg space-y-space-sm border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">forum</span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">
              Squad Comms
            </span>
          </div>
          <span className="inline-flex items-center gap-1 font-hud-metric text-[11px] text-tertiary font-bold">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span> Live
          </span>
        </div>

        {/* Chat Messages Stream */}
        <div className="space-y-space-xs max-h-36 overflow-y-auto pr-1 no-scrollbar">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="bg-surface-container-low p-2 rounded-lg text-left border border-outline-variant/10">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`font-label-sm text-[11px] font-bold ${msg.color}`}>{msg.sender}</span>
                <span className="font-hud-metric text-[10px] text-outline">{msg.time}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-snug">{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Quick Reaction Emojis */}
        <div className="pt-1">
          <div className="flex items-center justify-around bg-surface-container-lowest px-2 py-1.5 rounded-lg border border-outline-variant/20">
            {['🪔', '🚀', '🎆', '🔥', '🏆', '😎'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="text-[22px] hover:scale-125 active:scale-95 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Interactive Launch Bar */}
      <div className="pt-space-sm flex items-center gap-space-sm">
        <button
          onClick={() => {
            soundManager.playClick();
            router.push('/multiplayer');
          }}
          className="flex-1 py-3 px-space-sm bg-surface-container active:bg-surface-bright rounded-xl text-error font-label-md text-label-md flex items-center justify-center gap-1 shadow-md transition-all active:scale-95 border border-error/30"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Leave
        </button>
        <button
          onClick={triggerRaceLaunch}
          className="flex-[2] py-3.5 px-space-md bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_-4px_rgba(232,163,60,0.65)] hover:bg-primary-fixed-dim active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[24px]">flag</span>
          <span>START RACE ({squad.length}/4)</span>
        </button>
      </div>

      {/* Interactive Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl flex flex-col items-center justify-center p-margin-sm">
          <div className="relative flex flex-col items-center text-center space-y-space-md">
            <span className="material-symbols-outlined text-primary text-[64px] animate-bounce">rocket_launch</span>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold uppercase tracking-tight">
              Race Ignition
            </h3>
            <div className="font-hud-timer text-display-hero text-primary font-extrabold drop-shadow-[0_0_30px_rgba(255,193,108,0.9)]">
              {countdown === 0 ? 'GO! 🎆' : countdown}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant font-medium">
              Locking navigation coordinates to Skyway...
            </p>
            <button
              onClick={abortCountdown}
              className="px-5 py-2 rounded-full bg-surface-container-high text-error text-label-sm font-semibold active:scale-95 shadow-md border border-error/40"
            >
              Abort Ignition
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomLobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-primary font-hud-code">
          INITIALIZING SQUAD LOBBY... 🚀
        </div>
      }
    >
      <RoomLobbyContent />
    </Suspense>
  );
}
