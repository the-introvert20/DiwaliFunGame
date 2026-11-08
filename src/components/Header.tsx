'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/audio';
import { getPlayerProfile } from '@/lib/storage';
import { PlayerProfile } from '@/types';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export default function Header({ showBack = false, title }: HeaderProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [onlineCount, setOnlineCount] = useState(14820);

  useEffect(() => {
    setProfile(getPlayerProfile());
    setIsMuted(soundManager.getMuted());

    // Gentle fluctuation for live online arcade feel
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + (Math.floor(Math.random() * 7) - 3));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    soundManager.enableAudio();
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playClick();
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-b border-outline-variant/30">
      <div className="h-16 px-margin-sm flex items-center justify-between gap-space-sm max-w-7xl mx-auto">
        <div className="flex items-center gap-space-sm min-w-0">
          {showBack && (
            <button
              onClick={() => {
                soundManager.playClick();
                router.back();
              }}
              aria-label="Go Back"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary transition-colors flex-shrink-0 active:scale-95 border border-outline-variant/40"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 min-w-0 group" onClick={() => soundManager.playClick()}>
            <img
              alt="DIWALIverse Logo"
              className="h-8 w-auto object-contain flex-shrink-0 drop-shadow-[0_0_12px_rgba(232,163,60,0.6)] group-hover:scale-105 transition-transform"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtFsIbANZWPbQsk8Z0e1Ide2lYZOJoRIvjCB7WbqQhKOGbJy9k7FVIyriCJGSb2XKAGv8GOsOuvZpw4X6HcRnsc5tqoNSaX-ZOLwN57hdrQup5uD0RC_ZGggCXFpGMKgRrcfVwKuag5RKIosF8UE8gqFkUHwolOCa8WM29QzkYdfFb3WGRIYlASs53si1h309UTQWw7Bppy_zOXMyEWet54esLZ-fE3S-Ar7Xn8aY"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-[18px] text-primary font-extrabold tracking-tight truncate leading-none">
                  DIWALI<span className="text-tertiary">verse</span>
                </span>
                {title && (
                  <span className="text-on-surface-variant text-[13px] font-semibold pl-1 hidden sm:inline">
                    / {title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                <span className="font-hud-code text-[11px] tracking-wider text-tertiary font-bold leading-none uppercase">
                  {onlineCount.toLocaleString()} ONLINE
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-space-sm flex-shrink-0">
          <Link
            href="/diwali-cam"
            onClick={() => soundManager.playClick()}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-primary/30 hover:border-primary text-xs font-hud-code font-bold text-primary hover:bg-surface-container-high transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            <span>Diwali Cam</span>
          </Link>

          <button
            aria-label="Toggle Audio SFX"
            onClick={handleToggleAudio}
            className={`w-10 h-10 rounded-full bg-surface-container flex items-center justify-center transition-all active:scale-95 border ${
              isMuted
                ? 'text-on-surface-variant border-outline-variant/30'
                : 'text-primary border-primary/40 shadow-[0_0_14px_rgba(232,163,60,0.25)]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          <Link
            href="/profile"
            onClick={() => soundManager.playClick()}
            className="flex items-center bg-surface-container-high hover:bg-surface-bright rounded-full py-1 pl-space-sm pr-1 gap-space-xs border border-outline-variant/50 transition-colors"
          >
            <div className="flex flex-col items-end leading-none">
              <span className="font-hud-code text-[11px] text-primary font-bold">
                🪙 {profile ? profile.coins.toLocaleString() : '1,000'}
              </span>
              <span className="font-label-sm text-[10px] text-tertiary font-semibold tracking-wide mt-0.5">
                LVL {profile ? profile.level : 1}
              </span>
            </div>
            <div className="relative">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shadow-[0_0_8px_rgba(232,163,60,0.4)] ring-1 ring-primary/40"
                src={
                  profile?.avatar ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAdj1BnJOeIpu27ZMjRTJHTNqx8S-X8TrpcufbFpCPEiQ8yfPCGa2H8ujHRsHV0879F6XctnS1u84B_QkUlc1zKUHQekmr2a7U-ijp3ngl2Rgqo4E3zPj7gtVByeEE-lENcIL5i8UQ-1gYwOFWx2qKBi0suT8BpvQlbc0Mko8WNIoa_iG2IW_iXeZSVVPVbWIOJ6sUE-L5j4vga7oI_PUYfszekHIRlvrO3ymjkUoY'
                }
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary-container rounded-full ring-2 ring-surface"></span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

