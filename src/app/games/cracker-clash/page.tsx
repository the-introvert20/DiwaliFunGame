'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { soundManager } from '@/lib/audio';
import { addPlayerProgress, unlockAchievement } from '@/lib/storage';

interface Target {
  id: string;
  x: number; // percentage
  y: number; // percentage
  type: 'bomb' | 'sparkler' | 'ladi' | 'golden_anar';
  points: number;
}

export default function CrackerClashPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    soundManager.playCountdownGo();
    setIsPlaying(true);
    setGameOver(false);
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTargets([]);
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Target spawner
  useEffect(() => {
    if (!isPlaying) return;
    const spawner = setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= 6) return prev; // max 6 targets simultaneously
        const types: ('bomb' | 'sparkler' | 'ladi' | 'golden_anar')[] = ['bomb', 'sparkler', 'ladi', 'golden_anar'];
        const newTarget: Target = {
          id: Math.random().toString(),
          x: 15 + Math.random() * 70,
          y: 20 + Math.random() * 60,
          type: types[Math.floor(Math.random() * types.length)],
          points: 20 + Math.floor(Math.random() * 30),
        };
        return [...prev, newTarget];
      });
    }, 600);

    return () => clearInterval(spawner);
  }, [isPlaying]);

  const hitTarget = (targetId: string, pts: number) => {
    soundManager.playFireworkBurst();
    setTargets((prev) => prev.filter((t) => t.id !== targetId));

    setCombo((prevCombo) => {
      const nextCombo = prevCombo + 1;
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
      if (nextCombo >= 10) {
        unlockAchievement('cracker_champ');
      }

      let multiplier = 1;
      if (nextCombo >= 10) multiplier = 3;
      else if (nextCombo >= 5) multiplier = 2;

      setScore((s) => s + pts * multiplier);
      return nextCombo;
    });
  };

  const handleMiss = () => {
    setCombo(0);
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    soundManager.playVictory();
    const coins = Math.floor(score / 5);
    const xp = Math.floor(score / 4);
    addPlayerProgress(xp, coins, { crackerClashStreak: maxCombo });
  };

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-xl mx-auto pb-10 select-none">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between bg-surface-container p-3.5 rounded-xl border border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">timer</span>
          </span>
          <div className="flex flex-col">
            <span className="font-hud-code text-[10px] text-on-surface-variant uppercase font-semibold">Time Remaining</span>
            <span className="font-hud-timer-mobile text-hud-timer-mobile text-primary font-bold">
              00:{String(timeLeft).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-hud-code text-[10px] text-on-surface-variant uppercase font-semibold">Streak</span>
            <span className="font-hud-code text-[14px] text-secondary font-bold">
              {combo}x {combo >= 10 ? '🔥 3x' : combo >= 5 ? '⚡ 2x' : ''}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-hud-code text-[10px] text-on-surface-variant uppercase font-semibold">Score</span>
            <span className="font-hud-metric text-hud-metric text-primary font-bold">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Play Arena */}
      <div
        onClick={handleMiss}
        className="relative w-full aspect-[4/5] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/40 cursor-pointer"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(242, 100, 25, 0.15) 0%, rgba(19, 19, 25, 0.95) 75%)",
        }}
      >
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/80 backdrop-blur-sm p-6 text-center">
            <span className="material-symbols-outlined text-secondary-container text-[48px] animate-bounce">
              sports_mma
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold uppercase">
              Cracker Clash
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-xs">
              Tap the crackers before they explode! Build streaks for 2x and 3x score multipliers.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="mt-2 py-3.5 px-8 rounded-xl bg-primary text-on-primary font-headline-sm font-bold shadow-[0_0_24px_rgba(232,163,60,0.5)] active:scale-95 transition-transform"
            >
              START CLASH (60s)
            </button>
          </div>
        )}

        {/* Dynamic Targets */}
        {isPlaying &&
          targets.map((target) => (
            <button
              key={target.id}
              onClick={(e) => {
                e.stopPropagation();
                hitTarget(target.id, target.points);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex flex-col items-center justify-center active:scale-90 transition-transform animate-pulse border-2 shadow-2xl"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                backgroundColor:
                  target.type === 'bomb'
                    ? '#d62246'
                    : target.type === 'golden_anar'
                    ? '#ffc16c'
                    : target.type === 'sparkler'
                    ? '#00e1ef'
                    : '#f26419',
                borderColor: '#ffffff',
                boxShadow: `0 0 20px ${
                  target.type === 'bomb' ? '#d62246' : '#ffc16c'
                }`,
              }}
            >
              <span className="text-[22px]">
                {target.type === 'bomb'
                  ? '💣'
                  : target.type === 'golden_anar'
                  ? '🪔'
                  : target.type === 'sparkler'
                  ? '✨'
                  : '🧨'}
              </span>
              <span className="font-hud-code text-[9px] font-extrabold text-on-primary leading-none">
                +{target.points}
              </span>
            </button>
          ))}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/90 backdrop-blur-md p-6 text-center">
            <span className="material-symbols-outlined text-primary text-[56px]">emoji_events</span>
            <h3 className="font-headline-lg text-headline-lg text-primary font-extrabold">CLASH COMPLETE!</h3>
            <p className="font-hud-metric text-[22px] text-on-surface font-bold">Final Score: {score}</p>
            <p className="font-hud-code text-[12px] text-secondary">Max Streak: {maxCombo}x</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-2">
              <div className="bg-surface-container p-2.5 rounded-xl border border-outline-variant/30">
                <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">Coins</span>
                <p className="font-hud-metric text-[15px] text-primary font-bold">+{Math.floor(score / 5)} 🪙</p>
              </div>
              <div className="bg-surface-container p-2.5 rounded-xl border border-outline-variant/30">
                <span className="font-label-sm text-[10px] text-outline uppercase font-semibold">XP</span>
                <p className="font-hud-metric text-[15px] text-tertiary font-bold">+{Math.floor(score / 4)} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full max-w-xs mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-md"
              >
                Play Again
              </button>
              <Link
                href="/games"
                onClick={() => soundManager.playClick()}
                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-label-md font-bold text-center border border-outline-variant/30"
              >
                Arcade
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

