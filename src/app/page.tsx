'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/audio';

export default function HomePage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'PVP' | 'CO-OP'>('ALL');
  const [countdown, setCountdown] = useState({ hours: 2, mins: 45, secs: 12 });
  const [matchmakingNotice, setMatchmakingNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerQuickMatch = (gameId: string = 'rocket-rush') => {
    soundManager.playClick();
    soundManager.playRocketLaunch();
    setMatchmakingNotice(`MATCHMAKING SQUAD FOR ${gameId.toUpperCase().replace('-', ' ')}... 🚀`);
    setTimeout(() => {
      setMatchmakingNotice(null);
      router.push(`/games/${gameId}`);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-8 select-none max-w-4xl mx-auto">
      {/* Dynamic Matchmaking Notice Notification */}
      {matchmakingNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-primary-container text-on-primary-container font-hud-code text-[12px] font-bold shadow-2xl flex items-center gap-2 animate-bounce border border-primary">
          <span className="w-2 h-2 rounded-full bg-surface animate-ping"></span>
          <span>{matchmakingNotice}</span>
        </div>
      )}

      {/* Live Festival Marquee Ticker */}
      <div className="w-full bg-secondary-container/20 px-margin-sm py-2 flex items-center justify-between overflow-hidden border-b border-secondary-container/20">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
          </span>
          <p className="font-hud-code text-[12px] text-primary truncate tracking-wider font-semibold">
            MAHA DIWALI TOURNAMENT: 50,000 COINS PRIZE POOL{' '}
            <span className="text-tertiary">· 18 MINS LEFT</span>
          </p>
        </div>
        <Link
          href="/tournaments"
          onClick={() => soundManager.playClick()}
          className="font-hud-code text-[11px] text-tertiary font-bold flex-shrink-0 px-2 py-0.5 rounded-full bg-surface-container-high hover:bg-surface-bright transition-colors"
        >
          POOL #04
        </Link>
      </div>

      {/* Cinematic Hero Section */}
      <section className="relative px-margin-sm pt-4 pb-4 overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-16 w-56 h-56 bg-secondary-container/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative w-full rounded-xl bg-surface-container p-5 overflow-hidden shadow-2xl border border-outline-variant/40">
          {/* Background Illustrated Banner */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAPdnp1Exgdm-PUfYOnGoY9Bkhdjt-PV8HW1I4HuiwpELsjWwoZMtpiOcE5Zo4K61LO8HIrdF7MXA6aXsYdEgLmEdcEQsi9hkRWcy62gfaxM73sQZbkFByiB1-o9heSBzLfhpCAVQqzoSlZqKqozEnDnQexZd6bCVIZYmMfMcZ_D2HZlPaRBqer2ti59QBVIV6zBDHk0DpT0PG2dg00LHynfLaaLQ75nJqsiz_5lFQ')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/70 to-transparent"></div>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface-container-high/90 shadow-sm border border-primary/20">
              <span
                className="material-symbols-outlined text-[16px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="font-hud-code text-[11px] tracking-widest text-primary font-bold uppercase">
                SEASON 3: FESTIVAL OF SPARK
              </span>
            </div>

            <div className="flex flex-col">
              <h1 className="font-display-hero-mobile text-display-hero-mobile tracking-tight text-primary font-extrabold uppercase leading-none drop-shadow-[0_2px_16px_rgba(232,163,60,0.45)]">
                LET THE FESTIVAL BEGIN!
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 font-medium">
                Your friends. Your games. One unforgettable Diwali night.
              </p>
            </div>

            {/* CTA Touch Cluster */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => triggerQuickMatch('rocket-rush')}
                className="flex-1 h-12 rounded-lg bg-primary-container text-on-primary-container font-headline-sm text-[16px] flex items-center justify-center gap-2 font-bold shadow-[0_0_24px_rgba(232,163,60,0.4)] active:scale-95 transition-all hover:bg-primary"
              >
                <span>PLAY NOW</span>
                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              </button>
              <button
                onClick={() => triggerQuickMatch('cracker-clash')}
                className="h-12 px-4 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 font-bold shadow-md active:scale-95 transition-transform hover:bg-surface-bright border border-outline-variant/50"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                <span>Quick Match</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Friends & Squad Status Carousel */}
      <section className="px-margin-sm py-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">
              Lobby Squad
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-hud-code text-[11px] text-tertiary">
              4 Active
            </span>
          </div>
          <Link
            href="/multiplayer"
            onClick={() => soundManager.playClick()}
            className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-0.5 active:opacity-75"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* Horizontal scroll roster */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {/* Invite Button Card */}
          <Link
            href="/multiplayer"
            onClick={() => soundManager.playClick()}
            className="flex-shrink-0 w-28 h-32 rounded-xl bg-surface-container-low flex flex-col items-center justify-center gap-2 p-2.5 shadow-sm active:scale-95 transition-transform border border-outline-variant/30 hover:border-primary/50"
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold text-center leading-tight">
              + Invite Squad
            </span>
          </Link>

          {/* Aarav */}
          <div className="flex-shrink-0 w-32 h-32 rounded-xl bg-surface-container p-2.5 flex flex-col justify-between shadow-md border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="relative">
                <img
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-secondary-container"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCg31mhbZO8yZlKywmVwHjFyQ_hoHR5ZTtoXALxkRvj05RmTKm8ZEPFdTT_3g-n_iFvLjJF-WIsqXOQb9MS5crCylDgq0oiyTtdf_H35sxlmR7hCspZ0hBd7erB79xVahFCdj69aVAJXcgRI8DVLDzs5ylK_niE5vvdWeVBAij4f2heGLbEsK55ucjaWM-0lU8t6lpxXC6X0jwAOy0DPEIw4f8l_ntDIWqKIBqOR60"
                  alt="Aarav"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary-container rounded-full ring-2 ring-surface-container"></span>
              </div>
              <span className="font-hud-code text-[10px] text-secondary font-semibold">LVL 38</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface font-bold truncate">Aarav</p>
              <p className="font-label-sm text-[11px] text-primary truncate font-medium">In Rocket Rush</p>
            </div>
          </div>

          {/* Priya */}
          <div className="flex-shrink-0 w-32 h-32 rounded-xl bg-surface-container p-2.5 flex flex-col justify-between shadow-md border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="relative">
                <img
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-tertiary"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATL6hJvjH-d9ff9n-JNzouBTs4VBwAjD0T1x_UpHR_A5u8mqMnh97txQab3-evrTPLtmK2ItUu42iaLa6g_GOJFjYr7y1zX20W66FBLrHBeDL1499IkoP3zDUrVudBE4uZiAvwvRdeRjcTI-7GmH9DUekBi9JxTyaB-9S6vWlAhpYq23xqW6VVKejqi7ey6lXkEd6TWxfBZl_uUWMdcEiFK0ToCBb5X3vsoyPenJM"
                  alt="Priya"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tertiary rounded-full ring-2 ring-surface-container"></span>
              </div>
              <span className="font-hud-code text-[10px] text-tertiary font-semibold">LVL 49</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface font-bold truncate">Priya</p>
              <p className="font-label-sm text-[11px] text-tertiary truncate font-medium">In Lobby</p>
            </div>
          </div>

          {/* Kabir */}
          <div className="flex-shrink-0 w-32 h-32 rounded-xl bg-surface-container p-2.5 flex flex-col justify-between shadow-md border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="relative">
                <img
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-primary"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYKRgz_lN8oz0GU1GQezQE7QG3_Dq5ffPqHXa1iEPTBcP_4TRUWHOi2VCG-mnC5zhHvwIJchjc4LK5Rax9yt_RT2ifWQ7-K8cqQopgNGO9ZdxjrPtHBN5bh_UwykywgIQsSGnFJrb9okLhC_E01jiWLNH0OnEBEoxPK5BgpUUGoJi5wqurD0NqgFPO58t2BxB81Kksqq6gNCzGdiIBgyB3wI1LfFeT2ZKhyJfxD8k"
                  alt="Kabir"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container"></span>
              </div>
              <span className="font-hud-code text-[10px] text-primary font-semibold">LVL 24</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface font-bold truncate">Kabir</p>
              <p className="font-label-sm text-[11px] text-primary truncate font-medium">Ready ⚡</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Event: Grand Diwali Showdown */}
      <section className="px-margin-sm py-3">
        <div className="relative rounded-xl bg-surface-container-high p-4 overflow-hidden shadow-xl border border-secondary-container/30">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[18px] text-secondary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                military_tech
              </span>
              <span className="font-hud-code text-[11px] text-secondary-container uppercase tracking-wider font-extrabold">
                LIVE TOURNAMENT
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-hud-metric text-[12px] text-primary font-bold flex items-center gap-1 border border-primary/20">
              <span>🪙</span> 100K POOL
            </span>
          </div>

          <div className="flex flex-col gap-1 mb-3">
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight leading-tight">
              GRAND DIWALI SHOWDOWN
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              6-Stage Elimination Arcade Cup · Global Stream &amp; Badges
            </p>
          </div>

          {/* Segmented Monospace Countdown Box */}
          <div className="grid grid-cols-3 gap-2 py-2 mb-3 bg-surface-container rounded-lg p-2.5 text-center border border-outline-variant/30">
            <div className="flex flex-col items-center">
              <span className="font-hud-timer-mobile text-hud-timer-mobile text-primary font-bold tracking-tight">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Hours</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-hud-timer-mobile text-hud-timer-mobile text-primary font-bold tracking-tight">
                {String(countdown.mins).padStart(2, '0')}
              </span>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Mins</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-hud-timer-mobile text-hud-timer-mobile text-tertiary font-bold tracking-tight animate-pulse">
                {String(countdown.secs).padStart(2, '0')}
              </span>
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Secs</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tournaments"
              onClick={() => {
                soundManager.playClick();
                soundManager.playChime();
              }}
              className="flex-1 h-11 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(232,163,60,0.3)] active:scale-95 transition-all hover:bg-primary"
            >
              <span className="material-symbols-outlined text-[18px]">trophy</span>
              <span>Enter Bracket (FREE)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Game Grid (Arcade Modes) */}
      <section className="px-margin-sm py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Festival Arcade</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Instant jump multiplayer games</p>
          </div>
          <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1 border border-outline-variant/30">
            {(['ALL', 'PVP', 'CO-OP'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  soundManager.playClick();
                  setFilter(mode);
                }}
                className={`px-2.5 py-1 rounded font-label-sm text-[11px] font-bold transition-colors ${
                  filter === mode
                    ? 'bg-primary-container text-on-primary-container shadow'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetric Mobile & Desktop Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: Rocket Rush (Hero Col-Span 2) */}
          {(filter === 'ALL' || filter === 'PVP') && (
            <div className="sm:col-span-2 relative rounded-xl bg-surface-container overflow-hidden shadow-lg border border-outline-variant/30 group">
              <div
                className="h-40 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDidoa5R--VzLMFJCgvp4ySoqxIbOX3pxv-rsoMavXSXvtIkO4OB_ZCGa0N8iOGpBeFi8rbXs8lguZMG0HQmJQoiH43ls9-edf5Lhj8mG2LiS9BCTUOJ0hhFmcuodqv5igyZ1IrG7D9stp80jYVKsQMUUm-zWChDCPCkC_aPnf5LA-Sjni3Fi5V_t4YO9dC26fvgK-ucl4g63pncVS6stabadAoWpCKibjq-w0FW7g')",
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent"></div>
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-hud-code text-[10px] font-extrabold">
                  HOT 🔥
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high/90 text-tertiary font-hud-code text-[10px] font-bold">
                  2-8 PLAYERS
                </span>
              </div>
              <div className="relative p-3.5 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-primary font-bold">Rocket Rush</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Real-time racing with boost pads, lantern hazards &amp; live leaderboard
                  </p>
                </div>
                <Link
                  href="/games/rocket-rush"
                  onClick={() => soundManager.playClick()}
                  className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-md active:scale-90 transition-transform flex-shrink-0 hover:bg-primary"
                >
                  <span className="material-symbols-outlined text-[24px]">play_arrow</span>
                </Link>
              </div>
            </div>
          )}

          {/* Card 2: Fireworks Playground */}
          {(filter === 'ALL' || filter === 'CO-OP') && (
            <div className="relative rounded-xl bg-surface-container overflow-hidden shadow-md flex flex-col justify-between border border-outline-variant/30">
              <div
                className="h-28 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDho8VbCgbLXBV6J3y-ZCQFn_3_qw4aRgz7Ld2fcfWvRgcL4fyLJM1RQtJbUAKqG90tPkgQ1n6D5nWcLDSCrxRNStd8JXZnNmyijyg2FQ7e7flPWFmAIs3_OGHFbl53Yes6tAyjNaZUwUfhu2LDO65WAxCHcxaKyJXltCU5u9NRjWHKHXLUSYSc8UPk_12PNkdoCoZvS7k9aQVO8-u1x0Y-EBgu1nNn9S-7QODJiE')",
                }}
              ></div>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high/90 text-primary font-hud-code text-[10px] font-bold">
                  SANDBOX ✨
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold truncate">Fireworks Lab</h4>
                  <p className="font-label-sm text-[11px] text-on-surface-variant truncate">Craft bespoke sky bursts</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-hud-code text-[10px] text-tertiary">CO-OP RELAX</span>
                  <Link
                    href="/games/fireworks"
                    onClick={() => soundManager.playClick()}
                    className="p-1 rounded bg-surface-container-high hover:bg-surface-bright text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">flare</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Cracker Clash */}
          {(filter === 'ALL' || filter === 'PVP') && (
            <div className="relative rounded-xl bg-surface-container overflow-hidden shadow-md flex flex-col justify-between border border-outline-variant/30">
              <div
                className="h-28 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAse4pe1ioC8lH_vCMMO7LpEMgU3vI8UiDWDY2Im85emMlQm96rht0Nxx1L9SI79-kCq2PBwH4q0YQ2nyMl9i4ZvR8-xHjL8uZn3VNK-ZLobMPaikflSBvT1W7hxktRlB9unKfSaSfuaETcbbC4jTO4xPt19Z3Wc8n1QgW3vsM8yS5Qh_xaz7D3zpaiz0dng44510mBMMEUd01CV-EaIkOVJ-fiHuN0OFcbD0Kwwac')",
                }}
              ></div>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/90 text-on-secondary-container font-hud-code text-[10px] font-bold">
                  1V1 BLITZ ⚡
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold truncate">Cracker Clash</h4>
                  <p className="font-label-sm text-[11px] text-on-surface-variant truncate">Fast twitch finger reaction</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-hud-code text-[10px] text-secondary">RANKED LADDER</span>
                  <Link
                    href="/games/cracker-clash"
                    onClick={() => soundManager.playClick()}
                    className="p-1 rounded bg-secondary-container text-on-secondary-container transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">sports_mma</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Rangoli Battle */}
          {(filter === 'ALL' || filter === 'PVP') && (
            <div className="relative rounded-xl bg-surface-container overflow-hidden shadow-md flex flex-col justify-between border border-outline-variant/30">
              <div
                className="h-28 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEB99GI1ySbpRKi13TRe9NDB0A62uH18wMf55cZeWwfUR5tfBwyMgiJt0yNer1KHuBUZEVjJVB61deV9YXcMaBGSMookg35d298-MmUk8LTHmZaM4bVjiZFSDthXCcoGsvzs-klA1l6WFzeC_QbaPO5wCF-7xfSY3kF3NxGqMFOEURzTiBDqYYS7CWD7__zcBJcpv-rdaTcD5iZMMFB4SuiHIp6xSY2K-8aRrRvNA')",
                }}
              ></div>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high/90 text-tertiary font-hud-code text-[10px] font-bold">
                  VOTING 🎨
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold truncate">Rangoli Battle</h4>
                  <p className="font-label-sm text-[11px] text-on-surface-variant truncate">Speed pattern geometry</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-hud-code text-[10px] text-tertiary">CREATIVE EXP</span>
                  <Link
                    href="/games/rangoli"
                    onClick={() => soundManager.playClick()}
                    className="p-1 rounded bg-surface-container-high hover:bg-surface-bright text-tertiary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">draw</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Card 5: Diya Dash */}
          {(filter === 'ALL' || filter === 'PVP') && (
            <div className="relative rounded-xl bg-surface-container overflow-hidden shadow-md flex flex-col justify-between border border-outline-variant/30">
              <div
                className="h-28 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHnV8-1CFNrETvBGkWxUqJMzLgGPcwZgdusgLS6Ekdg9PJeT5ckbE1m0WLccDH_PEY1Fm6FgBdXGtvlWpCFlkU4m5ThNYaGgVed6mC-mAXpE8MSVtkyCsp2WWmenmGC69t6Z-D5oY8u-aPGQoh6ZlJkVZ0bZqMrAq5yXllw6mI79Vyf6XfitOfEp4sL-Q4SOC-vD-LRHK_h0vLwYsSvgAxXkpHLl0CiMtv3Drv-YA')",
                }}
              ></div>
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-hud-code text-[10px] font-bold">
                  LIGHT UP 🪔
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold truncate">Diya Dash</h4>
                  <p className="font-label-sm text-[11px] text-on-surface-variant truncate">Keep the eternal wick lit</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-hud-code text-[10px] text-primary">ENDLESS RUN</span>
                  <Link
                    href="/games/diya-dash"
                    onClick={() => soundManager.playClick()}
                    className="p-1 rounded bg-surface-container-high hover:bg-surface-bright text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Card 6: Co-op Diwali Haveli */}
          {(filter === 'ALL' || filter === 'CO-OP') && (
            <div className="sm:col-span-2 relative rounded-xl bg-surface-container overflow-hidden shadow-md flex items-center justify-between p-3.5 border border-outline-variant/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    cottage
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-label-md text-label-md text-on-surface font-bold truncate">Co-op Diwali Haveli</h4>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-hud-code text-[9px] text-tertiary">
                      SOCIAL
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                    Decorate shared courtyards with friends
                  </p>
                </div>
              </div>
              <Link
                href="/games/home-decorator"
                onClick={() => soundManager.playClick()}
                className="h-9 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary font-label-sm text-label-sm font-bold flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform border border-primary/20"
              >
                Join Haveli
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Daily Festive Quests & Achievements */}
      <section className="px-margin-sm py-4">
        <div className="rounded-xl bg-surface-container p-4 shadow-xl border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                assignment_turned_in
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Festival Quests</h3>
            </div>
            <span className="font-hud-code text-[11px] text-secondary font-bold">RESETS IN 05:14:02</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {/* Quest 1 */}
            <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-[16px]">🪔</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">Light 50 Diyas</span>
                </div>
                <span className="font-hud-metric text-[12px] text-primary font-bold">🪙 +150</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: '70%' }}></div>
                </div>
                <span className="font-hud-code text-[11px] text-on-surface-variant font-semibold">35/50</span>
              </div>
            </div>

            {/* Quest 2 */}
            <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-secondary text-[16px]">🚀</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    Win 3 Rocket Rush Matches
                  </span>
                </div>
                <span className="font-hud-code text-[11px] text-tertiary font-bold">🎆 Sparkler Skin</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-tertiary-container rounded-full" style={{ width: '66%' }}></div>
                </div>
                <span className="font-hud-code text-[11px] text-on-surface-variant font-semibold">2/3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Leaderboard Podium Snapshot */}
      <section className="px-margin-sm py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">Festival Champions</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Weekly Global Honor Roll</p>
          </div>
          <Link
            href="/leaderboards"
            onClick={() => soundManager.playClick()}
            className="font-label-sm text-label-sm text-primary font-bold active:opacity-75 flex items-center gap-0.5"
          >
            <span>Full Board</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* 3-Player Visual Podium */}
        <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
          {/* Rank 2: Silver */}
          <div className="rounded-xl bg-surface-container p-3 flex flex-col items-center gap-2 text-center shadow-md border border-outline-variant/30">
            <div className="relative">
              <img
                className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-outline"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPseGJQIVDAem-y_vw8tOH2hBx7mAFkWhXVm7Kjlf7SSQ_4R-Jhy46wobluj8NsRZuefjFQm8UznxAY3qxBlTkASDp4s9pc5AaZKbb_aaeGDrw4GGTHTYRm2qislyUqVJKTqsFHwueT0ALELbGEajF3u2VhpHOXBxxXTp_QAGyflYR1MQ_ulEdpD9LMxJHK3r_6ILnMZkcyY5JjS3kNTeR_5SMhI889tdVxDpuZ0g"
                alt="Veer_99"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-variant text-on-surface font-hud-code text-[11px] font-extrabold flex items-center justify-center">
                2
              </span>
            </div>
            <div className="w-full">
              <p className="font-label-md text-label-md text-on-surface font-bold truncate">Veer_99</p>
              <p className="font-hud-metric text-[11px] text-on-surface-variant font-semibold">18,420 XP</p>
            </div>
          </div>

          {/* Rank 1: Gold Spotlight (Taller) */}
          <div className="rounded-xl bg-surface-container-high p-3.5 flex flex-col items-center gap-2 text-center shadow-[0_0_20px_rgba(232,163,60,0.25)] relative -top-2 border border-primary/40">
            <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-hud-code text-[9px] font-extrabold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">crown</span> TOP DIYA
            </div>
            <div className="relative mt-1">
              <img
                className="w-14 h-14 rounded-full object-cover shadow-[0_0_12px_rgba(232,163,60,0.6)] ring-2 ring-primary"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV8g-rZKA0F7xKisz33-lYFnCO-HeZpIbCGFpCGhNIznjoyVW7BK9FwOzAIQmxf17ebBqCwm5U1IBc04ZYRctscfsMxiFkKMurSrsFThtiAM7MRQ1QdF_HrerhuIYmP845A33FvNwKgDYCV9TXFhaEaJiVJ2Pw39wYxdSHGaC3H8mrzlF9IhoNIy4S8Hiu8w-nvDpy1ogwsensPA7TL_-H8hvGaWguKqYGierioiw"
                alt="Shanaya_X"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary font-hud-code text-[11px] font-extrabold flex items-center justify-center shadow">
                1
              </span>
            </div>
            <div className="w-full">
              <p className="font-label-md text-label-md text-primary font-bold truncate">Shanaya_X</p>
              <p className="font-hud-metric text-[12px] text-primary font-bold">29,850 XP</p>
            </div>
          </div>

          {/* Rank 3: Bronze */}
          <div className="rounded-xl bg-surface-container p-3 flex flex-col items-center gap-2 text-center shadow-md border border-outline-variant/30">
            <div className="relative">
              <img
                className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-secondary-container"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU_Nk0UsJU5aZsliiW1guUCiwMhIg_HfRLylI51ZB8wwN7swzSSv9rvPBax3x4UFBGprKfd_dakgFSuJlG6SCacseXO9dmYkZBjTCgAmKkiPLU9zK5uymuiaOfija3D65rnC1ZlXIzhVfQbz87KmBRL9aATtpBbu9Tq-eoowZHvrvivjdufKm-aPPhrl9AjFI8XmMz8TxnuSMdHfMSoCKiuS_ZThasfRLMP-E5HWo"
                alt="Rohan_Ace"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container font-hud-code text-[11px] font-extrabold flex items-center justify-center">
                3
              </span>
            </div>
            <div className="w-full">
              <p className="font-label-md text-label-md text-on-surface font-bold truncate">Rohan_Ace</p>
              <p className="font-hud-metric text-[11px] text-on-surface-variant font-semibold">14,910 XP</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

