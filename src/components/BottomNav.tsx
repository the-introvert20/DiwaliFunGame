'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { soundManager } from '@/lib/audio';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: 'sports_esports' },
  { label: 'Arcade', href: '/games', icon: 'rocket_launch' },
  { label: 'Rooms', href: '/multiplayer', icon: 'groups' },
  { label: 'Leaderboard', href: '/leaderboards', icon: 'emoji_events' },
  { label: 'Celebrate', href: '/festival', icon: 'flare' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-4px_24px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-around h-16 px-space-xs max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => soundManager.playClick()}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] h-full gap-0.5 transition-all ${
                isActive
                  ? 'text-primary font-bold drop-shadow-[0_0_12px_rgba(255,193,108,0.65)] scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[11px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

