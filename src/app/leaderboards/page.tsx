'use client';

import React, { useState } from 'react';
import { soundManager } from '@/lib/audio';

const GLOBAL_LEADERBOARD = [
  {
    rank: 1,
    username: 'Shanaya_X',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCV8g-rZKA0F7xKisz33-lYFnCO-HeZpIbCGFpCGhNIznjoyVW7BK9FwOzAIQmxf17ebBqCwm5U1IBc04ZYRctscfsMxiFkKMurSrsFThtiAM7MRQ1QdF_HrerhuIYmP845A33FvNwKgDYCV9TXFhaEaJiVJ2Pw39wYxdSHGaC3H8mrzlF9IhoNIy4S8Hiu8w-nvDpy1ogwsensPA7TL_-H8hvGaWguKqYGierioiw',
    xp: 29850,
    wins: 48,
    badge: '👑 Grand Diya',
    color: '#ffc16c',
  },
  {
    rank: 2,
    username: 'Veer_99',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPseGJQIVDAem-y_vw8tOH2hBx7mAFkWhXVm7Kjlf7SSQ_4R-Jhy46wobluj8NsRZuefjFQm8UznxAY3qxBlTkASDp4s9pc5AaZKbb_aaeGDrw4GGTHTYRm2qislyUqVJKTqsFHwueT0ALELbGEajF3u2VhpHOXBxxXTp_QAGyflYR1MQ_ulEdpD9LMxJHK3r_6ILnMZkcyY5JjS3kNTeR_5SMhI889tdVxDpuZ0g',
    xp: 18420,
    wins: 34,
    badge: '🥈 Silver Spark',
    color: '#e5e1eb',
  },
  {
    rank: 3,
    username: 'Rohan_Ace',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAU_Nk0UsJU5aZsliiW1guUCiwMhIg_HfRLylI51ZB8wwN7swzSSv9rvPBax3x4UFBGprKfd_dakgFSuJlG6SCacseXO9dmYkZBjTCgAmKkiPLU9zK5uymuiaOfija3D65rnC1ZlXIzhVfQbz87KmBRL9aATtpBbu9Tq-eoowZHvrvivjdufKm-aPPhrl9AjFI8XmMz8TxnuSMdHfMSoCKiuS_ZThasfRLMP-E5HWo',
    xp: 14910,
    wins: 28,
    badge: '🥉 Bronze Anar',
    color: '#f26419',
  },
  {
    rank: 4,
    username: 'Priya_Pro',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuATL6hJvjH-d9ff9n-JNzouBTs4VBwAjD0T1x_UpHR_A5u8mqMnh97txQab3-evrTPLtmK2ItUu42iaLa6g_GOJFjYr7y1zX20W66FBLrHBeDL1499IkoP3zDUrVudBE4uZiAvwvRdeRjcTI-7GmH9DUekBi9JxTyaB-9S6vWlAhpYq23xqW6VVKejqi7ey6lXkEd6TWxfBZl_uUWMdcEiFK0ToCBb5X3vsoyPenJM',
    xp: 12400,
    wins: 22,
    badge: 'Elite Pilot',
  },
  {
    rank: 5,
    username: 'Aarav_Gamer',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCg31mhbZO8yZlKywmVwHjFyQ_hoHR5ZTtoXALxkRvj05RmTKm8ZEPFdTT_3g-n_iFvLjJF-WIsqXOQb9MS5crCylDgq0oiyTtdf_H35sxlmR7hCspZ0hBd7erB79xVahFCdj69aVAJXcgRI8DVLDzs5ylK_niE5vvdWeVBAij4f2heGLbEsK55ucjaWM-0lU8t6lpxXC6X0jwAOy0DPEIw4f8l_ntDIWqKIBqOR60',
    xp: 11150,
    wins: 19,
    badge: 'Flame Racer',
  },
  {
    rank: 6,
    username: 'Kabir_Speed',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBYKRgz_lN8oz0GU1GQezQE7QG3_Dq5ffPqHXa1iEPTBcP_4TRUWHOi2VCG-mnC5zhHvwIJchjc4LK5Rax9yt_RT2ifWQ7-K8cqQopgNGO9ZdxjrPtHBN5bh_UwykywgIQsSGnFJrb9okLhC_E01jiWLNH0OnEBEoxPK5BgpUUGoJi5wqurD0NqgFPO58t2BxB81Kksqq6gNCzGdiIBgyB3wI1LfFeT2ZKhyJfxD8k',
    xp: 9800,
    wins: 15,
    badge: 'Speedster',
  },
];

export default function LeaderboardsPage() {
  const [tab, setTab] = useState<'weekly' | 'global' | 'friends'>('weekly');

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-4xl mx-auto pb-12 select-none">
      <div className="flex flex-col gap-1 pt-space-xs">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold uppercase">
          FESTIVAL HONOR ROLL
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Verified match progression and weekly championship standings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl border border-outline-variant/30">
        {(['weekly', 'global', 'friends'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              soundManager.playClick();
              setTab(t);
            }}
            className={`flex-1 py-2 rounded-lg font-label-md text-label-md font-bold uppercase transition-all ${
              tab === t
                ? 'bg-primary-container text-on-primary-container shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Visual */}
      <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
        {/* Rank 2 */}
        <div className="rounded-xl bg-surface-container p-3 flex flex-col items-center gap-2 text-center shadow-md border border-outline-variant/30">
          <div className="relative">
            <img
              className="w-12 h-12 rounded-full object-cover ring-2 ring-outline"
              src={GLOBAL_LEADERBOARD[1].avatar}
              alt={GLOBAL_LEADERBOARD[1].username}
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-variant text-on-surface font-hud-code text-[11px] font-extrabold flex items-center justify-center">
              2
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface font-bold truncate">
            {GLOBAL_LEADERBOARD[1].username}
          </p>
          <span className="font-hud-metric text-[11px] text-on-surface-variant font-semibold">
            {GLOBAL_LEADERBOARD[1].xp.toLocaleString()} XP
          </span>
        </div>

        {/* Rank 1 */}
        <div className="rounded-xl bg-surface-container-high p-4 flex flex-col items-center gap-2 text-center shadow-[0_0_24px_rgba(232,163,60,0.3)] relative -top-3 border border-primary/40">
          <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-hud-code text-[9px] font-extrabold">
            👑 RANK #1
          </span>
          <div className="relative mt-1">
            <img
              className="w-16 h-16 rounded-full object-cover ring-2 ring-primary shadow-lg"
              src={GLOBAL_LEADERBOARD[0].avatar}
              alt={GLOBAL_LEADERBOARD[0].username}
            />
          </div>
          <p className="font-label-md text-label-md text-primary font-bold truncate">
            {GLOBAL_LEADERBOARD[0].username}
          </p>
          <span className="font-hud-metric text-[13px] text-primary font-bold">
            {GLOBAL_LEADERBOARD[0].xp.toLocaleString()} XP
          </span>
        </div>

        {/* Rank 3 */}
        <div className="rounded-xl bg-surface-container p-3 flex flex-col items-center gap-2 text-center shadow-md border border-outline-variant/30">
          <div className="relative">
            <img
              className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary-container"
              src={GLOBAL_LEADERBOARD[2].avatar}
              alt={GLOBAL_LEADERBOARD[2].username}
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container font-hud-code text-[11px] font-extrabold flex items-center justify-center">
              3
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface font-bold truncate">
            {GLOBAL_LEADERBOARD[2].username}
          </p>
          <span className="font-hud-metric text-[11px] text-on-surface-variant font-semibold">
            {GLOBAL_LEADERBOARD[2].xp.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Roster List */}
      <div className="space-y-2">
        {GLOBAL_LEADERBOARD.map((entry) => (
          <div
            key={entry.rank}
            className="p-3 rounded-xl bg-surface-container flex items-center justify-between border border-outline-variant/20 relative overflow-hidden"
          >
            {/* Left-edge rank light rail */}
            {entry.color && (
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
              ></div>
            )}
            <div className="flex items-center gap-3 pl-2">
              <span className="font-hud-code text-[14px] font-bold text-on-surface-variant w-6 text-center">
                #{entry.rank}
              </span>
              <img src={entry.avatar} alt={entry.username} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-label-md font-bold text-on-surface">{entry.username}</p>
                <span className="font-label-sm text-[11px] text-tertiary">{entry.badge || 'Contender'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-hud-metric text-[14px] text-primary font-bold">
                {entry.xp.toLocaleString()} XP
              </span>
              <p className="font-hud-code text-[11px] text-on-surface-variant">{entry.wins} Wins</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

