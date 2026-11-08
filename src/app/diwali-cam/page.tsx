'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { soundManager } from '@/lib/audio';
import FilterDemoPreview from '@/components/diwali-cam/FilterDemoPreview';

const GESTURE_GUIDES = [
  {
    gesture: '✋ Open Palm',
    title: 'Fireworks Explosion',
    effect: 'fireworks',
    desc: 'Flash an open palm toward the camera to detonate vibrant fireworks with glowing sparks.',
    tag: 'BURST EFFECT',
    color: 'border-amber-500/40 text-primary',
  },
  {
    gesture: '✌️ Peace Sign',
    title: 'Rocket Orbit',
    effect: 'rocket',
    desc: 'Hold up a peace sign to launch a miniature Diwali rocket that orbits around you with fiery exhaust.',
    tag: 'ORBITAL AR',
    color: 'border-orange-500/40 text-secondary',
  },
  {
    gesture: '🤏 Pinch',
    title: 'Sparkler Sizzle',
    effect: 'sparkler',
    desc: 'Pinch your thumb and index finger together to emit crackling golden phuljhadi sparks at your fingertips.',
    tag: 'SPARKLER',
    color: 'border-yellow-400/40 text-marigold',
  },
  {
    gesture: '☝️ Index Finger',
    title: 'Floating Diya',
    effect: 'diya',
    desc: 'Point your index finger upward to gently balance a glowing, sacred earthen diya hovering in the air.',
    tag: 'SACRED FLAME',
    color: 'border-amber-400/40 text-primary-fixed',
  },
  {
    gesture: '🙌 Both Hands',
    title: 'Mega Finale',
    effect: 'finale',
    desc: 'Raise both hands simultaneously to illuminate your room with a grand Diwali finale and festive confetti.',
    tag: 'GRAND FINALE',
    color: 'border-cyan-400/40 text-tertiary',
  },
];

export default function DiwaliCamLandingPage() {
  const router = useRouter();
  const [quickRoomCode, setQuickRoomCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    const cleanCode = quickRoomCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage('Please enter a room code');
      return;
    }
    router.push(`/diwali-cam/join?code=${encodeURIComponent(cleanCode)}`);
  };

  return (
    <div className="flex flex-col w-full pb-12 select-none max-w-4xl mx-auto px-margin-sm">
      {/* Top Festive Badge */}
      <div className="flex items-center justify-center pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/90 border border-primary/30 shadow-diya">
          <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            videocam
          </span>
          <span className="font-hud-code text-[11px] tracking-widest text-primary font-bold uppercase">
            NEW FEATURE: DIWALI CAM LIVE
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <section className="text-center py-6 space-y-3">
        <h1 className="font-outfit text-3xl sm:text-5xl font-extrabold text-primary tracking-tight uppercase leading-tight drop-shadow-[0_2px_20px_rgba(232,163,60,0.4)]">
          Light Up Your Face.<br />Celebrate Together.
        </h1>
        <p className="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Join your friends on live video, use magical Diwali AR filters, and turn your gestures into fireworks, rockets, and diyas.
        </p>
      </section>

      {/* Primary Party Action Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
        {/* Create Party Card */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-surface-container via-surface-container to-surface-container-high border border-primary/30 shadow-2xl relative overflow-hidden group hover:border-primary transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none"></div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary mb-3 border border-primary/30">
              <span className="material-symbols-outlined text-[28px]">add_to_queue</span>
            </div>
            <h2 className="font-headline-sm text-xl font-bold text-on-surface">Create a Party</h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Start a new video room, invite up to 8 family members or friends, and host your interactive Diwali celebration.
            </p>
          </div>
          <Link
            href="/diwali-cam/create"
            onClick={() => soundManager.playClick()}
            className="mt-5 w-full py-3 rounded-xl bg-primary text-on-primary font-hud-code text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-diya hover:bg-primary-fixed transition-all active:scale-95"
          >
            <span>Create Party Room</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        {/* Join Party Card with Quick Room Code Input */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl relative overflow-hidden group hover:border-tertiary/60 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all pointer-events-none"></div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary mb-3 border border-tertiary/30">
              <span className="material-symbols-outlined text-[28px]">group_add</span>
            </div>
            <h2 className="font-headline-sm text-xl font-bold text-on-surface">Join a Party</h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Have a room code from a friend? Enter your code below to instantly jump into their video celebration.
            </p>
          </div>

          <form onSubmit={handleQuickJoin} className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ENTER ROOM CODE (e.g. DIWALI-8821)"
                value={quickRoomCode}
                onChange={(e) => {
                  setQuickRoomCode(e.target.value.toUpperCase());
                  setErrorMessage(null);
                }}
                className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-3.5 py-2.5 text-xs font-hud-code font-bold tracking-wider text-primary placeholder:text-on-surface-variant/40 focus:outline-none focus:border-tertiary"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-tertiary text-on-tertiary font-hud-code text-xs font-bold uppercase tracking-wider hover:bg-tertiary-fixed transition-all active:scale-95 shadow-cyber flex items-center gap-1"
              >
                <span>Join</span>
              </button>
            </div>
            {errorMessage && (
              <span className="text-[11px] text-error font-mono">{errorMessage}</span>
            )}
          </form>
        </div>
      </section>

      {/* Interactive AR Camera Filter Preview Demonstration */}
      <section className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
            <h2 className="font-headline-sm text-lg font-bold text-primary">Live AR Filter Demonstration</h2>
          </div>
          <span className="text-xs text-on-surface-variant font-hud-code">Interactive Demo</span>
        </div>

        <FilterDemoPreview />
      </section>

      {/* Gesture Controls Guide */}
      <section className="py-6 space-y-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[22px]">front_hand</span>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface">Gesture-Powered Magic</h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Hold your hands up to your camera. Browser-based AI analyzes your gestures in real time with zero server lag.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GESTURE_GUIDES.map((g) => (
            <div
              key={g.title}
              className={`p-4 rounded-xl bg-surface-container border ${g.color} flex flex-col justify-between hover:bg-surface-container-high/60 transition-colors`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{g.gesture.split(' ')[0]}</span>
                  <span className="text-[10px] font-hud-code font-bold px-2 py-0.5 rounded-full bg-surface-container-highest">
                    {g.tag}
                  </span>
                </div>
                <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-1">
                  {g.gesture.split(' ').slice(1).join(' ')} — {g.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {g.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Broadcast Card */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📡</span>
                <span className="text-[10px] font-hud-code font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  FULL BROADCAST
                </span>
              </div>
              <h3 className="font-headline-sm text-sm font-bold text-primary mb-1">
                Visible to Everyone
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your processed canvas stream with fireworks, rockets, and diyas is broadcast directly to everyone in your party room over WebRTC!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Permissions Promise */}
      <section className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3 mt-2">
        <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-on-surface">100% Privacy Focused</span>
          <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
            Video never records or saves your feed. Hand tracking is computed 100% locally in your browser. All camera and microphone tracks immediately turn off when you exit the party.
          </p>
        </div>
      </section>
    </div>
  );
}
