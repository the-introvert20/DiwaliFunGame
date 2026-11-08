'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { soundManager } from '@/lib/audio';
import { addPlayerProgress, unlockAchievement } from '@/lib/storage';

export default function DiyaDashPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [fuel, setFuel] = useState(100); // Diya oil/wick fuel

  const playerRef = useRef({
    y: 0,
    vy: 0,
    isJumping: false,
    fuel: 100,
  });

  const objectsRef = useRef<Array<{ x: number; y: number; type: 'ghee' | 'wind_gust'; collected?: boolean }>>([]);

  const jump = () => {
    if (!isPlaying || playerRef.current.isJumping) return;
    soundManager.playChime();
    playerRef.current.vy = -14;
    playerRef.current.isJumping = true;
  };

  const startGame = () => {
    soundManager.playCountdownGo();
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setFuel(100);
    playerRef.current = { y: 0, vy: 0, isJumping: false, fuel: 100 };
    objectsRef.current = [];
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let spawnTimer = 0;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const groundY = canvas.height * 0.75;
      const player = playerRef.current;

      // Update player physics
      player.vy += 0.8; // gravity
      player.y += player.vy;

      if (player.y >= 0) {
        player.y = 0;
        player.vy = 0;
        player.isJumping = false;
      }

      // Fuel decay
      player.fuel = Math.max(0, player.fuel - 0.08);
      setFuel(Math.round(player.fuel));

      if (player.fuel <= 0) {
        setIsPlaying(false);
        setGameOver(true);
        soundManager.playDefeat();
        addPlayerProgress(50, 100, { diyasLit: Math.floor(score / 50) });
        return;
      }

      setScore((s) => s + 1);

      // Spawn objects
      spawnTimer++;
      if (spawnTimer > 70) {
        spawnTimer = 0;
        const type = Math.random() > 0.4 ? 'ghee' : 'wind_gust';
        objectsRef.current.push({
          x: canvas.width,
          y: type === 'ghee' ? groundY - 50 - Math.random() * 40 : groundY - 20,
          type,
        });
      }

      // Update & Render Objects
      ctx.fillStyle = '#131319';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground Line
      ctx.strokeStyle = '#e8a33c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // Render & check collisions
      for (let i = objectsRef.current.length - 1; i >= 0; i--) {
        const obj = objectsRef.current[i];
        obj.x -= 5;

        // Collision with player (player is at x = 70, y = groundY + player.y)
        const playerX = 70;
        const playerY = groundY + player.y - 20;

        const dist = Math.hypot(obj.x - playerX, obj.y - playerY);
        if (dist < 32 && !obj.collected) {
          obj.collected = true;
          if (obj.type === 'ghee') {
            soundManager.playCoin();
            player.fuel = Math.min(100, player.fuel + 25);
            setScore((s) => s + 50);
          } else if (obj.type === 'wind_gust') {
            soundManager.playClick();
            player.fuel = Math.max(0, player.fuel - 20);
          }
        }

        if (obj.x < -30) {
          objectsRef.current.splice(i, 1);
          continue;
        }

        if (!obj.collected) {
          if (obj.type === 'ghee') {
            ctx.fillStyle = '#ffc16c';
            ctx.shadowColor = '#ffc16c';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#00e1ef';
            ctx.shadowColor = '#00e1ef';
            ctx.shadowBlur = 8;
            ctx.fillRect(obj.x - 8, obj.y - 15, 16, 25);
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw Diya Player
      const px = 70;
      const py = groundY + player.y - 12;

      // Diya Base
      ctx.fillStyle = '#e8a33c';
      ctx.beginPath();
      ctx.ellipse(px, py, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flame
      ctx.fillStyle = '#f26419';
      ctx.shadowColor = '#ffc16c';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(px - 6, py - 4);
      ctx.lineTo(px + 6, py - 4);
      ctx.lineTo(px, py - 24 - Math.random() * 6);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, score]);

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-xl mx-auto pb-10 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase">Diya Dash</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Keep the eternal diya flame burning</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-hud-code text-[11px] text-on-surface-variant font-semibold">Distance</span>
          <span className="font-hud-metric text-[18px] text-primary font-bold">{score}m</span>
        </div>
      </div>

      {/* Fuel Gauge */}
      <div className="bg-surface-container p-2.5 rounded-xl border border-outline-variant/30 flex flex-col gap-1">
        <div className="flex justify-between items-center text-[11px] font-hud-code">
          <span className="text-secondary font-bold">Wick Fuel / Ghee</span>
          <span className="text-primary font-bold">{fuel}%</span>
        </div>
        <div className="w-full bg-surface-container-lowest h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              fuel > 40 ? 'bg-primary' : 'bg-secondary-container animate-pulse'
            }`}
            style={{ width: `${fuel}%` }}
          ></div>
        </div>
      </div>

      {/* Runner Viewport */}
      <div
        onClick={jump}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/40 bg-surface cursor-pointer"
      >
        <canvas ref={canvasRef} width={400} height={300} className="w-full h-full object-cover" />

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/80 backdrop-blur-sm p-6 text-center">
            <span className="material-symbols-outlined text-primary text-[48px] animate-bounce">
              local_fire_department
            </span>
            <h3 className="font-headline-lg text-primary font-extrabold">ETERNAL DIYA SPRINT</h3>
            <p className="font-body-sm text-on-surface-variant max-w-xs">
              Tap anywhere or hit Space to jump. Collect golden oil pots to replenish flame!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="mt-2 py-3 px-8 rounded-xl bg-primary text-on-primary font-headline-sm font-bold shadow-lg"
            >
              RUN SPRINT
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/90 backdrop-blur-md p-6 text-center">
            <span className="material-symbols-outlined text-secondary text-[48px]">mode_heat</span>
            <h3 className="font-headline-lg text-on-surface font-extrabold">WICK EXTINGUISHED</h3>
            <p className="font-hud-metric text-[20px] text-primary font-bold">Distance: {score}m</p>
            <div className="flex items-center gap-3 mt-3 w-full max-w-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-md"
              >
                Sprint Again
              </button>
              <Link
                href="/games"
                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-label-md font-bold text-center border border-outline-variant/30"
              >
                Arcade
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={jump}
          className="w-full py-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary font-headline-sm font-bold border border-outline-variant/40 active:scale-95 transition-transform"
        >
          TAP TO JUMP 🪔
        </button>
      </div>
    </div>
  );
}

