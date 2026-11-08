'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { soundManager } from '@/lib/audio';
import { addPlayerProgress, unlockAchievement } from '@/lib/storage';

const PIGMENTS = [
  { name: 'Saffron Gold', hex: '#e8a33c' },
  { name: 'Electric Cyan', hex: '#00e1ef' },
  { name: 'Royal Magenta', hex: '#d62246' },
  { name: 'Marigold Yellow', hex: '#f6bd60' },
  { name: 'Sunset Orange', hex: '#f26419' },
  { name: 'Mint Green', hex: '#70b58c' },
  { name: 'Pure White', hex: '#ffffff' },
];

export default function RangoliPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState(PIGMENTS[0].hex);
  const [brushSize, setBrushSize] = useState(6);
  const [symmetry, setSymmetry] = useState<4 | 8>(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [votes, setVotes] = useState(42);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1c1b22';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw faint guide circles
        ctx.strokeStyle = 'rgba(158, 142, 124, 0.15)';
        ctx.lineWidth = 1;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        [40, 80, 120, 160].forEach((r) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        });
      }
    }
  }, []);

  const drawSymmetric = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    ctx.fillStyle = selectedColor;
    ctx.shadowColor = selectedColor;
    ctx.shadowBlur = 10;

    const angles = symmetry === 8 ? 8 : 4;
    const step = (Math.PI * 2) / angles;

    for (let i = 0; i < angles; i++) {
      const rot = i * step;
      const rx = cx + dx * Math.cos(rot) - dy * Math.sin(rot);
      const ry = cy + dx * Math.sin(rot) + dy * Math.cos(rot);

      ctx.beginPath();
      ctx.arc(rx, ry, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    setHasDrawn(true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    drawSymmetric(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    drawSymmetric(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1c1b22';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
  };

  const submitArt = () => {
    soundManager.playVictory();
    setSubmitted(true);
    addPlayerProgress(200, 300, { rangoliStars: 5 });
    unlockAchievement('rangoli_artist');
  };

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-xl mx-auto pb-10 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase">
            Rangoli Battle
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Theme: Golden Lotus Symmetry</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1 border border-outline-variant/30">
          <button
            onClick={() => setSymmetry(4)}
            className={`px-2.5 py-1 rounded font-hud-code text-[11px] font-bold ${
              symmetry === 4 ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            4-Way
          </button>
          <button
            onClick={() => setSymmetry(8)}
            className={`px-2.5 py-1 rounded font-hud-code text-[11px] font-bold ${
              symmetry === 8 ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            8-Way
          </button>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative w-full aspect-square bg-surface-container-low rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/40 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full object-contain touch-none cursor-crosshair"
        />

        {submitted && (
          <div className="absolute inset-0 bg-surface/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <span className="material-symbols-outlined text-primary text-[56px] animate-bounce">check_circle</span>
            <h3 className="font-headline-lg text-primary font-bold">RANGOLI SUBMITTED!</h3>
            <p className="font-body-md text-on-surface-variant mt-1">
              Your geometric mandala is now live for community voting.
            </p>
            <div className="flex items-center gap-2 mt-4 bg-surface-container px-4 py-2 rounded-full border border-primary/30">
              <span className="text-[20px]">⭐</span>
              <span className="font-hud-metric text-primary font-bold">{votes} Community Votes</span>
            </div>
            <div className="flex items-center gap-3 mt-5 w-full">
              <button
                onClick={() => {
                  setSubmitted(false);
                  clearCanvas();
                }}
                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-label-md font-bold"
              >
                Create Another
              </button>
              <Link
                href="/games"
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-label-md font-bold text-center"
              >
                Arcade
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pigments & Controls */}
      <div className="space-y-3">
        {/* Colors */}
        <div className="flex items-center justify-around bg-surface-container p-2.5 rounded-xl border border-outline-variant/30">
          {PIGMENTS.map((p) => (
            <button
              key={p.hex}
              onClick={() => {
                soundManager.playClick();
                setSelectedColor(p.hex);
              }}
              aria-label={p.name}
              className={`w-9 h-9 rounded-full transition-all active:scale-90 ${
                selectedColor === p.hex ? 'ring-4 ring-on-surface scale-110 shadow-lg' : 'opacity-80'
              }`}
              style={{ backgroundColor: p.hex }}
            />
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={clearCanvas}
            className="flex-1 py-3 rounded-xl bg-surface-container hover:bg-surface-bright text-error font-label-md font-bold border border-outline-variant/30"
          >
            Clear
          </button>
          <button
            onClick={submitArt}
            disabled={!hasDrawn}
            className="flex-[2] py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm font-bold shadow-md disabled:opacity-50 active:scale-95 transition-transform"
          >
            Submit for Voting ⭐
          </button>
        </div>
      </div>
    </div>
  );
}

