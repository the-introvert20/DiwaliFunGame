'use client';

import React, { useRef, useEffect, useState } from 'react';
import { soundManager } from '@/lib/audio';
import { addPlayerProgress, unlockAchievement } from '@/lib/storage';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  type: string;
  exploded: boolean;
}

export default function FireworksPlaygroundPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedType, setSelectedType] = useState('sky_rocket');
  const [selectedColor, setSelectedColor] = useState('#ffc16c');
  const [launchedCount, setLaunchedCount] = useState(0);
  const [applauseCount, setApplauseCount] = useState(128);

  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const FIREWORK_TYPES = [
    { id: 'sky_rocket', name: 'Sky Rocket', icon: 'rocket_launch' },
    { id: 'anar', name: 'Golden Anar', icon: 'local_fire_department' },
    { id: 'chakri', name: 'Ground Chakri', icon: 'cyclone' },
    { id: 'multiburst', name: 'Multi-Burst', icon: 'flare' },
  ];

  const COLORS = [
    { name: 'Saffron Gold', hex: '#ffc16c' },
    { name: 'Neon Cyan', hex: '#00e1ef' },
    { name: 'Sunset Orange', hex: '#f26419' },
    { name: 'Marigold Yellow', hex: '#f6bd60' },
    { name: 'Royal Magenta', hex: '#d62246' },
  ];

  const launchFirework = (xPercent: number = 0.5, yPercent: number = 0.3) => {
    soundManager.playRocketLaunch();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = canvas.width * xPercent;
    const targetY = canvas.height * yPercent;

    rocketsRef.current.push({
      x: startX,
      y: canvas.height,
      targetY: targetY,
      vy: -12,
      color: selectedColor,
      type: selectedType,
      exploded: false,
    });

    setLaunchedCount((prev) => {
      const next = prev + 1;
      if (next % 5 === 0) {
        addPlayerProgress(50, 100, { fireworksCrafted: next });
      }
      if (next >= 25) {
        unlockAchievement('firework_master');
      }
      return next;
    });
  };

  const explode = (x: number, y: number, color: string, type: string) => {
    soundManager.playFireworkBurst();
    const count = type === 'multiburst' ? 120 : 60;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = Math.random() * 6 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        size: Math.random() * 3 + 1.5,
      });
    }
  };

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Semi-transparent clear for motion blur trail
          ctx.fillStyle = 'rgba(19, 19, 25, 0.25)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Update & Draw Rockets
          for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
            const r = rocketsRef.current[i];
            r.y += r.vy;

            // Exhaust trail
            ctx.fillStyle = '#ffc16c';
            ctx.beginPath();
            ctx.arc(r.x + (Math.random() - 0.5) * 4, r.y + 6, 2, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = r.color;
            ctx.beginPath();
            ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
            ctx.fill();

            if (r.y <= r.targetY) {
              explode(r.x, r.y, r.color, r.type);
              rocketsRef.current.splice(i, 1);
            }
          }

          // Update & Draw Particles
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08; // gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
              particlesRef.current.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col w-full relative max-w-xl mx-auto pb-10 select-none">
      {/* Viewport Canvas */}
      <div className="relative w-full aspect-[4/5] bg-surface rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30">
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            launchFirework(x, Math.max(0.15, Math.min(0.65, y)));
          }}
          className="w-full h-full object-cover cursor-crosshair"
        />

        {/* Ambient Top Overlay Header */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-surface-container/80 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/30 pointer-events-auto">
            <span className="font-hud-code text-[11px] text-primary font-bold">
              ✨ {launchedCount} SKY BURSTS
            </span>
          </div>
          <button
            onClick={() => {
              soundManager.playChime();
              setApplauseCount((prev) => prev + 1);
            }}
            className="bg-surface-container-high/90 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/30 pointer-events-auto flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <span>👏</span>
            <span className="font-hud-code text-[11px] text-tertiary font-bold">{applauseCount}</span>
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
          <p className="font-hud-code text-[11px] text-on-surface-variant bg-surface/70 backdrop-blur-sm py-1 px-3 rounded-full inline-block">
            Tap anywhere in the sky to ignite! 🎆
          </p>
        </div>
      </div>

      {/* Control Palettes */}
      <div className="mt-4 px-margin-sm space-y-3">
        {/* Firework Type Selection */}
        <div className="grid grid-cols-4 gap-2">
          {FIREWORK_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedType(type.id);
              }}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                selectedType === type.id
                  ? 'bg-primary-container text-on-primary-container border-primary shadow-lg'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{type.icon}</span>
              <span className="font-label-sm text-[10px] font-bold truncate max-w-full">{type.name}</span>
            </button>
          ))}
        </div>

        {/* Color Palette Selector */}
        <div className="flex items-center justify-around bg-surface-container p-2.5 rounded-xl border border-outline-variant/30">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => {
                soundManager.playClick();
                setSelectedColor(c.hex);
              }}
              aria-label={c.name}
              className={`w-9 h-9 rounded-full transition-all active:scale-90 ${
                selectedColor === c.hex ? 'ring-4 ring-on-surface scale-110 shadow-lg' : 'opacity-80'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Launch Button CTA */}
        <button
          onClick={() => launchFirework(0.5, 0.3)}
          className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold shadow-[0_0_24px_rgba(232,163,60,0.5)] active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[24px]">flare</span>
          <span>LAUNCH SKY BURST</span>
        </button>
      </div>
    </div>
  );
}

