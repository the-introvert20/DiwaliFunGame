'use client';

import React, { useState } from 'react';
import { soundManager } from '@/lib/audio';
import { addPlayerProgress } from '@/lib/storage';

export default function FestivalPage() {
  const [diyasLit, setDiyasLit] = useState(148520);
  const [hasLitUserDiya, setHasLitUserDiya] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(soundManager.isMusicActive());
  const [greetingCopied, setGreetingCopied] = useState(false);

  const [wishes, setWishes] = useState([
    { name: 'Shanaya_X', text: 'Happy Diwali everyone! See you on Chandni Chowk Skyway! 🚀✨', time: '5m ago' },
    { name: 'Aarav_Gamer', text: 'Shubh Deepavali! May your rockets always have turbo boost! 🪔🎆', time: '12m ago' },
    { name: 'Priya_Pro', text: 'Wishing all squads endless light and victory! 🪔❤️', time: '20m ago' },
  ]);
  const [newWish, setNewWish] = useState('');

  const lightDiya = () => {
    soundManager.playChime();
    setHasLitUserDiya(true);
    setDiyasLit((prev) => prev + 1);
    addPlayerProgress(50, 100, { diyasLit: 1 });
  };

  const toggleFestiveMusic = () => {
    soundManager.enableAudio();
    if (soundManager.isMusicActive()) {
      soundManager.stopFestiveMusic();
      setIsMusicPlaying(false);
    } else {
      soundManager.startFestiveMusic();
      setIsMusicPlaying(true);
    }
  };

  const handlePostWish = () => {
    if (!newWish.trim()) return;
    soundManager.playChime();
    setWishes((prev) => [
      { name: 'You', text: newWish.trim(), time: 'Just now' },
      ...prev,
    ]);
    setNewWish('');
  };

  const copyGreeting = () => {
    soundManager.playClick();
    const text = 'Shubh Deepavali! May your festival be filled with joy, radiant light, and high-speed victory in DIWALIverse! 🪔🎆🚀';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setGreetingCopied(true);
    setTimeout(() => setGreetingCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-xl mx-auto pb-12 select-none">
      <div className="flex flex-col gap-1 pt-space-xs">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-extrabold uppercase">
          FESTIVAL CORNER 🪔
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Light sacred diyas, listen to festive ragas, and share joyous greetings with friends.
        </p>
      </div>

      {/* Virtual Global Diya */}
      <div className="rounded-2xl bg-surface-container p-6 shadow-2xl border border-primary/40 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative mb-4 cursor-pointer" onClick={lightDiya}>
          {/* Diya Flame */}
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
              hasLitUserDiya
                ? 'shadow-[0_0_50px_rgba(232,163,60,0.85)] scale-110'
                : 'shadow-[0_0_20px_rgba(232,163,60,0.3)]'
            }`}
          >
            <span className="text-[72px] drop-shadow-[0_0_24px_rgba(232,163,60,0.9)] animate-pulse">🪔</span>
          </div>
        </div>

        <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
          {hasLitUserDiya ? 'YOUR DIYA IS SHINING BRIGHT!' : 'TAP TO LIGHT YOUR DIYA'}
        </h3>
        <p className="font-hud-metric text-[16px] text-primary font-bold mt-1">
          {diyasLit.toLocaleString()} Global Diyas Burning
        </p>

        <button
          onClick={lightDiya}
          className="mt-4 px-6 py-3 rounded-xl bg-primary text-on-primary font-headline-sm font-bold shadow-lg active:scale-95 transition-transform"
        >
          {hasLitUserDiya ? 'Add Sacred Oil / Ghee ✨' : 'Light Virtual Diya 🪔'}
        </button>
      </div>

      {/* Festive Music Box */}
      <div className="rounded-xl bg-surface-container p-4 border border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">music_note</span>
          </span>
          <div>
            <h4 className="font-label-md font-bold text-on-surface">Festive Raga Ambient Drone</h4>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Pentatonic festive harmonics</span>
          </div>
        </div>
        <button
          onClick={toggleFestiveMusic}
          className={`px-4 py-2 rounded-lg font-label-md font-bold transition-all active:scale-95 ${
            isMusicPlaying ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-high text-on-surface'
          }`}
        >
          {isMusicPlaying ? 'Pause Music 🎵' : 'Play Music 🎶'}
        </button>
      </div>

      {/* Festive Greeting Card Generator */}
      <div className="rounded-xl bg-surface-container p-4 border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">forward_to_inbox</span>
            Share Festive Blessing
          </span>
          <button
            onClick={copyGreeting}
            className="text-[12px] font-label-sm font-bold text-primary hover:underline"
          >
            {greetingCopied ? 'Copied! ✨' : 'Copy Message'}
          </button>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/20 italic text-[13px] text-on-surface leading-relaxed">
          &quot;Shubh Deepavali! May your festival be filled with joy, radiant light, and high-speed victory in DIWALIverse! 🪔🎆🚀&quot;
        </div>
      </div>

      {/* Community Wishes Wall */}
      <div className="rounded-xl bg-surface-container p-4 border border-outline-variant/30 space-y-3">
        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Community Wishes Wall</h4>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePostWish()}
            placeholder="Write your Diwali blessing..."
            className="flex-1 bg-surface-container-lowest px-3 py-2 rounded-lg text-[13px] text-on-surface placeholder:text-outline border border-outline-variant/30 focus:outline-none"
            maxLength={100}
          />
          <button
            onClick={handlePostWish}
            className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg text-[13px] active:scale-95 transition-transform"
          >
            Post
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
          {wishes.map((w, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/10 text-left">
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-bold text-primary">{w.name}</span>
                <span className="text-outline">{w.time}</span>
              </div>
              <p className="text-[12px] text-on-surface">{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

