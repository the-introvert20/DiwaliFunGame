'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/audio';

export default function MultiplayerPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Modes');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectingNotice, setConnectingNotice] = useState<string | null>(null);

  const filterChips = [
    'All Modes',
    '🚀 Racing',
    '⚡ Reflex',
    '🎨 Creative',
    '🏮 Co-Op',
    '🏆 Tournaments',
  ];

  const handleJoinWithCode = () => {
    soundManager.playClick();
    const cleanCode = roomCode.trim().toUpperCase();
    if (cleanCode.length < 4) {
      alert('Please enter a valid room code (e.g. DK-8821 or DW-8492)');
      return;
    }
    setConnectingNotice(`CONNECTING TO ROOM ${cleanCode}...`);
    setTimeout(() => {
      setConnectingNotice(null);
      router.push(`/multiplayer/room/${cleanCode}`);
    }, 1000);
  };

  const handleCreateRoom = (gameId: string = 'rocket-rush') => {
    soundManager.playClick();
    soundManager.playChime();
    const generatedPin = `DW-${Math.floor(1000 + Math.random() * 9000)}`;
    setConnectingNotice(`GENERATING SQUAD LOBBY ${generatedPin}...`);
    setTimeout(() => {
      setConnectingNotice(null);
      router.push(`/multiplayer/room/${generatedPin}?game=${gameId}&host=true`);
    }, 900);
  };

  const handleQuickMatch = () => {
    soundManager.playClick();
    soundManager.playRocketLaunch();
    setConnectingNotice('AUTO-PAIRING LOW-LATENCY SQUAD...');
    setTimeout(() => {
      setConnectingNotice(null);
      router.push('/multiplayer/room/DW-8492');
    }, 1200);
  };

  const handleRefresh = () => {
    soundManager.playClick();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-lg max-w-4xl mx-auto pb-12 select-none">
      {/* Notice Banner */}
      {connectingNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-primary-container text-on-primary-container font-hud-code text-[12px] font-bold shadow-2xl flex items-center gap-2 animate-bounce border border-primary">
          <span className="w-2 h-2 rounded-full bg-surface animate-ping"></span>
          <span>{connectingNotice}</span>
        </div>
      )}

      {/* Sub-Header & Live Pulse Intro */}
      <section className="flex flex-col gap-1 pt-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container shadow-md">
              <span className="material-symbols-outlined text-[18px]">swords</span>
            </span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold">
              MULTIPLAYER ARCADE
            </h2>
          </div>
          <span className="bg-surface-container-high text-primary px-3 py-1 rounded-full font-hud-code text-[11px] font-bold shadow-sm flex items-center gap-1.5 border border-primary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            GLOBAL LOBBY
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Create customs, challenge rivals, or join active squads in the celebration arena.
        </p>
      </section>

      {/* 1. Top Action Hub (2x2 Tactile Arcade Cards) */}
      <section className="grid grid-cols-2 gap-space-sm">
        {/* Quick Match (Saffron Glow Feature Card) */}
        <button
          onClick={handleQuickMatch}
          className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-primary-container via-secondary-container to-surface-container-high text-left shadow-lg overflow-hidden transition-transform active:scale-[0.98] min-h-[128px] border border-primary/40"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/25 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center justify-between w-full">
            <span className="w-10 h-10 rounded-lg bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[24px]">bolt</span>
            </span>
            <span className="font-hud-code text-[10px] uppercase font-bold text-on-primary bg-primary px-2 py-0.5 rounded-full shadow-sm">
              INSTANT
            </span>
          </div>
          <div className="mt-2">
            <span className="block font-headline-sm text-[17px] font-bold text-on-surface leading-tight">
              Quick Match
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Auto-pairing queue
            </span>
          </div>
        </button>

        {/* Create Private Room */}
        <button
          onClick={() => handleCreateRoom('rocket-rush')}
          className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-left shadow-md transition-transform active:scale-[0.98] min-h-[128px] border border-outline-variant/40"
        >
          <div className="flex items-center justify-between w-full">
            <span className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary shadow-inner">
              <span className="material-symbols-outlined text-[22px]">vpn_key</span>
            </span>
            <span className="font-label-sm text-[10px] text-tertiary font-bold bg-surface-container-lowest px-2 py-0.5 rounded-full border border-tertiary/20">
              PIN LOCK
            </span>
          </div>
          <div className="mt-2">
            <span className="block font-headline-sm text-[17px] font-bold text-on-surface leading-tight">
              Custom Room
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">Host private party</span>
          </div>
        </button>

        {/* Join With Code */}
        <div className="col-span-2 p-3.5 rounded-xl bg-surface-container flex flex-col gap-2.5 shadow-md border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">pin</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">Join with Room Code</span>
            </div>
            <span className="font-hud-code text-[11px] text-on-surface-variant">6-CHAR ID</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface-container-lowest rounded-lg px-3 py-2 flex items-center shadow-inner border border-outline-variant/30">
              <input
                className="w-full bg-transparent font-hud-code text-hud-metric uppercase text-primary placeholder:text-outline focus:outline-none tracking-widest"
                maxLength={8}
                placeholder="e.g. DK-8821 or DW-8492"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinWithCode()}
              />
            </div>
            <button
              onClick={handleJoinWithCode}
              className="h-11 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center"
            >
              JOIN
            </button>
          </div>
        </div>

        {/* Browse Public Rooms trigger chip */}
        <div className="col-span-2 flex items-center justify-between bg-surface-container-high/60 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[20px]">travel_explore</span>
            <span className="font-label-sm text-label-sm text-on-surface">Filter: Low Latency (&lt;25ms)</span>
          </div>
          <span className="font-label-sm text-[12px] text-primary font-bold flex items-center gap-0.5">
            Auto-Selected Server <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </span>
        </div>
      </section>

      {/* 2. Telemetry Stats Bar */}
      <section className="bg-surface-container-lowest/90 backdrop-blur-md p-3 rounded-xl shadow-inner border border-outline-variant/30">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col">
            <span className="font-hud-metric text-[14px] text-primary font-bold leading-tight">1,280</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase mt-0.5">Rooms</span>
          </div>
          <div className="flex flex-col">
            <span className="font-hud-metric text-[14px] text-tertiary font-bold leading-tight">14.8K</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase mt-0.5">Players</span>
          </div>
          <div className="flex flex-col">
            <span className="font-hud-metric text-[14px] text-secondary font-bold leading-tight">42</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase mt-0.5">Tourneys</span>
          </div>
          <div className="flex flex-col">
            <span className="font-hud-metric text-[14px] text-tertiary-fixed font-bold leading-tight">18ms</span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase mt-0.5">Avg Ping</span>
          </div>
        </div>
      </section>

      {/* 3. Filter Tabs (Horizontal Scrollable Pills) */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => {
              soundManager.playClick();
              setSelectedFilter(chip);
            }}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all ${
              selectedFilter === chip
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold border border-outline-variant/20'
            }`}
          >
            {chip}
          </button>
        ))}
      </section>

      {/* 4. Rich Game Cards List (Featured Arenas) */}
      <section className="space-y-space-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Featured Arenas</h3>
          <span className="font-hud-code text-[11px] text-tertiary">SYNCED WITH CLOUD</span>
        </div>

        {/* Card 1: Rocket Rush */}
        <div className="relative rounded-2xl bg-surface-container overflow-hidden shadow-xl flex flex-col group border border-outline-variant/30">
          <div className="relative h-44 w-full overflow-hidden">
            <img
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk4uoEhsaY8-e7Y1hJppsjrnHJeN0RMlPffnvZz7mP062zinqROG0p2AHCsAB9Mpb1ym55RQQMZLBBpObxH0pu4Myh0b7q-eWLb6pA5cWzdgOfoSg2njrb07T2qFNdQlzHmlwbD9fQtKro38ciYOEeCox5JgbNy_3WdMTQTeitmybNtUB47saR8chpcgltii9cow-EDfY8xqhlB6Gg2zwNATrZM7hRDWSgIPW3t70"
              alt="Rocket Rush"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/40 to-transparent"></div>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-secondary/30">
              <span className="material-symbols-outlined text-secondary-container text-[16px]">speed</span>
              <span className="font-hud-code text-[11px] font-bold text-secondary">RACING</span>
            </div>
            <div className="absolute top-3 right-3 bg-surface-container-high/90 backdrop-blur-md px-2 py-0.5 rounded font-hud-metric text-[12px] text-primary font-bold">
              420 ACTIVE
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3 -mt-2 relative">
            <div>
              <h4 className="font-headline-md text-headline-md text-primary font-extrabold tracking-tight">
                Rocket Rush
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                High-speed sky racing through neon lantern constellations.
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-label-sm text-[12px] text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">group</span> 2-8P
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-high font-hud-code text-[10px] text-primary">
                  MED DIFF
                </span>
              </div>
              <Link
                href="/games/rocket-rush"
                onClick={() => soundManager.playClick()}
                className="h-11 px-5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(232,163,60,0.35)] flex items-center gap-1.5"
              >
                <span>Play Match</span>
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Fireworks Playground */}
        <div className="rounded-xl bg-surface-container overflow-hidden shadow-lg flex flex-col border border-outline-variant/30">
          <div className="relative h-32 w-full overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTq-wPUSia46FxR4uy-2LkYOQGCOtQJeDITH8wn_NMGd1NaHejGGZdk2-cBScmhdQbzXRfv2KJ-SHhKKXngp6V5cWxse9jLQlftDudT9F7q4z-zGyRczpevxvFybzaAiFsTWWIMIDVq_WtAYv43z4n85YLuu4kdKWxinQAjzPfe80DN-BRtpTKWNNRi_gpUklLWgDdrrCFpypZlU0fzuyS1LIOjBaNNKV5-pspOPU"
              alt="Fireworks"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
            <div className="absolute top-2.5 left-2.5 bg-surface-container-lowest/80 backdrop-blur-md px-2 py-0.5 rounded-full font-hud-code text-[10px] text-tertiary font-bold">
              SANDBOX CO-OP
            </div>
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-surface-container-lowest/80 px-2 py-0.5 rounded text-[11px] font-hud-metric text-on-surface">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> OPEN
            </div>
          </div>
          <div className="p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Fireworks Playground</h4>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  Synchronized squad sky pyrotechnics
                </span>
              </div>
              <span className="font-hud-code text-[11px] text-on-surface-variant">1-12 Players</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="px-2 py-0.5 rounded bg-surface-container-high font-hud-code text-[10px] text-tertiary">
                CASUAL
              </span>
              <Link
                href="/games/fireworks"
                onClick={() => soundManager.playClick()}
                className="h-11 px-4 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-tertiary font-label-md text-label-md font-bold transition-transform active:scale-95 flex items-center gap-1 border border-tertiary/20"
              >
                <span>Enter Sky</span>
                <span className="material-symbols-outlined text-[16px]">flare</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Cracker Clash */}
        <div className="rounded-xl bg-surface-container overflow-hidden shadow-lg flex flex-col border border-outline-variant/30">
          <div className="relative h-32 w-full overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA91NzZVUBBHW8FjPssaCf2Oz2NAVpIJz1WANv5_Uy15tZRvszn0QJ3sgXMJemBlASmMjPcm4ENk4UduNJIaWKuCWmM4jMPHxe8bXqf34Pl0dQ1f3YxqssZlTwnw002c3EUPFAP0RkBAbaO7UJx4xE45lawj31Z9tsCXbeRkbey_DKY7wb_m9EiEC2Co_YwyFoLisf0k6vjOPLgNd9e_a4rpY7zkzw2TCpo8ADeEoM"
              alt="Cracker Clash"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent"></div>
            <div className="absolute top-2.5 left-2.5 bg-secondary-container px-2 py-0.5 rounded-full font-hud-code text-[10px] text-on-secondary-container font-bold">
              FAST QUEUE
            </div>
          </div>
          <div className="p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Cracker Clash</h4>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  60-second reflex tap war (1v1 or 4P FFA)
                </span>
              </div>
              <span className="font-hud-code text-[11px] text-secondary">HARD</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-label-sm text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary-container">timer</span> Instant
                Pairing
              </span>
              <Link
                href="/games/cracker-clash"
                onClick={() => soundManager.playClick()}
                className="h-11 px-4 rounded-lg bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container font-label-md text-label-md font-bold transition-transform active:scale-95 flex items-center gap-1 shadow-[0_0_16px_rgba(242,100,25,0.3)]"
              >
                <span>Quick Clash</span>
                <span className="material-symbols-outlined text-[16px]">sports_kabaddi</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Active Public Rooms (Live Feed Strip) */}
      <section className="space-y-space-sm pb-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">cell_tower</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Active Public Rooms</h3>
          </div>
          <button
            onClick={handleRefresh}
            aria-label="Refresh public lobbies"
            className="p-2 text-on-surface-variant hover:text-primary transition-colors flex items-center"
          >
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
          </button>
        </div>

        <div className="space-y-2">
          {/* Public Room 1 */}
          <div className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-between gap-2 shadow-sm transition-colors border border-outline-variant/30">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-hud-code text-[12px] text-primary font-bold">#DK-8821</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  Delhi Rockets Club
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1 font-hud-code text-[11px] text-on-surface-variant">
                <span>Rocket Rush</span>
                <span className="text-outline">·</span>
                <span className="text-tertiary font-semibold">3/4 Players</span>
                <span className="text-outline">·</span>
                <span className="text-tertiary-fixed flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 14ms
                </span>
              </div>
            </div>
            <Link
              href="/multiplayer/room/DK-8821?game=rocket-rush"
              onClick={() => soundManager.playClick()}
              className="h-11 min-w-[56px] px-3.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-transform active:scale-95 flex items-center justify-center"
            >
              Join
            </Link>
          </div>

          {/* Public Room 2 */}
          <div className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-between gap-2 shadow-sm transition-colors border border-outline-variant/30">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-hud-code text-[12px] text-secondary font-bold">#FW-4091</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  Diwali Chill Vibes
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1 font-hud-code text-[11px] text-on-surface-variant">
                <span>Fireworks</span>
                <span className="text-outline">·</span>
                <span className="text-tertiary font-semibold">7/12 Players</span>
                <span className="text-outline">·</span>
                <span className="text-tertiary-fixed flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 22ms
                </span>
              </div>
            </div>
            <Link
              href="/games/fireworks"
              onClick={() => soundManager.playClick()}
              className="h-11 min-w-[56px] px-3.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-tertiary font-label-md text-label-md font-bold transition-transform active:scale-95 flex items-center justify-center border border-tertiary/20"
            >
              Join
            </Link>
          </div>

          {/* Public Room 3 */}
          <div className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-between gap-2 shadow-sm transition-colors border border-outline-variant/30">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-hud-code text-[12px] text-tertiary font-bold">#RG-1102</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  Rangoli Masters
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1 font-hud-code text-[11px] text-on-surface-variant">
                <span>Rangoli Battle</span>
                <span className="text-outline">·</span>
                <span className="text-tertiary font-semibold">4/6 Players</span>
                <span className="text-outline">·</span>
                <span className="text-tertiary-fixed flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 19ms
                </span>
              </div>
            </div>
            <Link
              href="/games/rangoli"
              onClick={() => soundManager.playClick()}
              className="h-11 min-w-[56px] px-3.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-tertiary font-label-md text-label-md font-bold transition-transform active:scale-95 flex items-center justify-center border border-tertiary/20"
            >
              Join
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

