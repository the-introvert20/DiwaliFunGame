'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { soundManager } from '@/lib/audio';

const TOURNAMENTS = [
  {
    id: 'maha-cup-04',
    title: 'Maha Diwali Rocket Cup #04',
    game: 'Rocket Rush',
    prizePool: 50000,
    entryFee: 0,
    status: 'LIVE NOW',
    timeRemaining: '18 Mins Left',
    registered: 124,
    maxPlayers: 128,
    stages: '6-Stage Elimination',
    bracket: [
      { round: 1, p1: 'Shanaya_X', p2: 'Racer_4491', score1: 3, score2: 1, winner: 'Shanaya_X' },
      { round: 1, p1: 'Veer_99', p2: 'Priya_Pro', score1: 3, score2: 2, winner: 'Veer_99' },
      { round: 2, p1: 'Shanaya_X', p2: 'Veer_99', score1: 3, score2: 2, winner: 'Shanaya_X' },
    ],
  },
  {
    id: 'cracker-blitz-09',
    title: 'Mid-Night Cracker Blitz',
    game: 'Cracker Clash',
    prizePool: 25000,
    entryFee: 100,
    status: 'STARTING IN 45M',
    timeRemaining: 'Registration Open',
    registered: 48,
    maxPlayers: 64,
    stages: 'Knockout 1v1',
  },
  {
    id: 'mandala-master-02',
    title: 'Royal Rangoli Showcase',
    game: 'Rangoli Battle',
    prizePool: 30000,
    entryFee: 50,
    status: 'TOMORROW',
    timeRemaining: 'Opens 8:00 PM',
    registered: 80,
    maxPlayers: 100,
    stages: 'Community Jury',
  },
];

export default function TournamentsPage() {
  const [selectedTournament, setSelectedTournament] = useState(TOURNAMENTS[0]);
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    soundManager.playVictory();
    setRegistered(true);
  };

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-4xl mx-auto pb-12 select-none">
      <div className="flex flex-col gap-1 pt-space-xs">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold uppercase">
          TOURNAMENTS &amp; CUPS
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Compete in verified knockout brackets for coins, trophies, and exclusive skins.
        </p>
      </div>

      {/* Featured Tournament Card */}
      <div className="rounded-2xl bg-surface-container p-5 shadow-xl border border-primary/30 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-hud-code text-[11px] font-extrabold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-on-secondary-container animate-ping"></span>
            {selectedTournament.status}
          </span>
          <span className="font-hud-metric text-[14px] text-primary font-bold">
            🪙 {selectedTournament.prizePool.toLocaleString()} COINS POOL
          </span>
        </div>

        <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
          {selectedTournament.title}
        </h3>
        <p className="font-body-sm text-on-surface-variant mt-1">
          {selectedTournament.game} · {selectedTournament.stages} · {selectedTournament.timeRemaining}
        </p>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between font-hud-code text-[11px] text-on-surface-variant">
            <span>Slots Registered</span>
            <span className="text-primary font-bold">
              {selectedTournament.registered}/{selectedTournament.maxPlayers} Filled
            </span>
          </div>
          <div className="w-full bg-surface-container-lowest h-2.5 rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${(selectedTournament.registered / selectedTournament.maxPlayers) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Interactive Bracket Preview */}
        {selectedTournament.bracket && (
          <div className="mt-5 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
            <span className="font-hud-code text-[11px] text-tertiary font-bold uppercase tracking-wider block mb-2">
              Championship Knockout Bracket
            </span>
            <div className="space-y-2">
              {selectedTournament.bracket.map((match, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-container text-[12px] font-hud-code border border-outline-variant/20"
                >
                  <span className={match.winner === match.p1 ? 'text-primary font-bold' : 'text-on-surface-variant'}>
                    {match.p1} ({match.score1})
                  </span>
                  <span className="text-outline font-semibold">VS</span>
                  <span className={match.winner === match.p2 ? 'text-primary font-bold' : 'text-on-surface-variant'}>
                    ({match.score2}) {match.p2}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleRegister}
            disabled={registered}
            className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm font-bold shadow-md active:scale-95 transition-transform disabled:opacity-60"
          >
            {registered ? 'REGISTERED! SQUAD ALLOCATED 🚀' : 'Enter Tournament Bracket (FREE)'}
          </button>
          <Link
            href="/multiplayer"
            onClick={() => soundManager.playClick()}
            className="py-3.5 px-5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md font-semibold border border-outline-variant/40"
          >
            Lobbies
          </Link>
        </div>
      </div>

      {/* Other Tournaments List */}
      <div className="space-y-3">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Upcoming Festival Schedule</h3>
        {TOURNAMENTS.slice(1).map((t) => (
          <div
            key={t.id}
            onClick={() => {
              soundManager.playClick();
              setSelectedTournament(t);
            }}
            className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/30 flex items-center justify-between"
          >
            <div>
              <span className="font-hud-code text-[10px] text-tertiary font-bold">{t.status}</span>
              <h4 className="font-headline-sm text-[16px] text-on-surface font-bold mt-0.5">{t.title}</h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">{t.game}</p>
            </div>
            <div className="text-right">
              <span className="font-hud-metric text-[14px] text-primary font-bold">
                🪙 {t.prizePool.toLocaleString()}
              </span>
              <p className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
                {t.registered}/{t.maxPlayers}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

