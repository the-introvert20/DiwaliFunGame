'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { soundManager } from '@/lib/audio';
import { addPlayerProgress, unlockAchievement, getPlayerProfile } from '@/lib/storage';
import { multiplayer } from '@/lib/multiplayer';

interface Racer {
  id: string;
  name: string;
  x: number; // 0 to 1
  y: number; // track progress
  speed: number;
  rank: number;
  isPlayer: boolean;
  color: string;
  boostActive: boolean;
  shieldActive: boolean;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'lantern' | 'boost_pad' | 'diya_gate';
}

function RocketRushContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room') || 'LOCAL';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [speed, setSpeed] = useState(380);
  const [boostCharge, setBoostCharge] = useState(85);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isShielded, setIsShielded] = useState(false);
  const [shieldTimeLeft, setShieldTimeLeft] = useState(0);
  const [turboAlert, setTurboAlert] = useState<string | null>(null);
  const [lap, setLap] = useState(1);
  const [raceTimeMs, setRaceTimeMs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<{ rank: number; coins: number; xp: number } | null>(null);

  // Racers state
  const racersRef = useRef<Racer[]>([
    {
      id: 'player',
      name: 'Rohan (You)',
      x: 0.5,
      y: 0,
      speed: 380,
      rank: 1,
      isPlayer: true,
      color: '#ffc16c',
      boostActive: false,
      shieldActive: false,
    },
    {
      id: 'aarav',
      name: 'Aarav',
      x: 0.25,
      y: 0,
      speed: 375,
      rank: 2,
      isPlayer: false,
      color: '#00e1ef',
      boostActive: false,
      shieldActive: false,
    },
    {
      id: 'priya',
      name: 'Priya',
      x: 0.75,
      y: 0,
      speed: 370,
      rank: 3,
      isPlayer: false,
      color: '#f26419',
      boostActive: false,
      shieldActive: false,
    },
    {
      id: 'kabir',
      name: 'Kabir',
      x: 0.4,
      y: 0,
      speed: 365,
      rank: 4,
      isPlayer: false,
      color: '#f6bd60',
      boostActive: false,
      shieldActive: false,
    },
  ]);

  const obstaclesRef = useRef<Obstacle[]>([]);

  // Particle systems
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; color: string; alpha: number; size: number }>>([]);

  // Generate track obstacles
  useEffect(() => {
    const generated: Obstacle[] = [];
    const types: ('lantern' | 'boost_pad' | 'diya_gate')[] = ['lantern', 'boost_pad', 'diya_gate'];
    for (let i = 0; i < 60; i++) {
      generated.push({
        id: i,
        x: 0.15 + Math.random() * 0.7,
        y: (i + 1) * 120,
        type: types[i % 3],
      });
    }
    obstaclesRef.current = generated;

    // Load custom profile username if available
    const prof = getPlayerProfile();
    if (prof) {
      racersRef.current[0].name = `${prof.username} (You)`;
    }

    // Try joining colyseus room if available
    try {
      multiplayer.joinOrCreateRoom('rocket_rush', {
        roomId,
        username: prof.username,
        avatar: prof.avatar,
      }).then((room) => {
        room.onMessage('race_started', () => {
          soundManager.playCountdownGo();
        });
      }).catch(() => {
        // Fallback to local authoritative simulation
      });
    } catch (e) {
      // Offline fallback
    }

    return () => {
      multiplayer.leaveCurrentRoom();
    };
  }, [roomId]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        steer(-0.06);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        steer(0.06);
      } else if (e.key === ' ' || e.key === 'Shift') {
        triggerBoost();
      } else if (e.key === 's' || e.key === 'S') {
        triggerShield();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boostCharge, isShielded]);

  // Steering function
  const steer = (delta: number) => {
    const player = racersRef.current.find((r) => r.isPlayer);
    if (!player || raceFinished) return;
    player.x = Math.max(0.08, Math.min(0.92, player.x + delta));
  };

  // Boost trigger
  const triggerBoost = () => {
    if (boostCharge < 15 || raceFinished) return;
    soundManager.playBoost();
    setIsBoosting(true);
    setTurboAlert('CHAKRA TURBO ACTIVATED! +50 KM/H');
    setTimeout(() => setTurboAlert(null), 1800);

    const player = racersRef.current.find((r) => r.isPlayer);
    if (player) {
      player.boostActive = true;
      player.speed = Math.min(560, player.speed + 60);
      setSpeed(player.speed);
    }
  };

  // Shield trigger
  const triggerShield = () => {
    if (isShielded || raceFinished) return;
    soundManager.playChime();
    setIsShielded(true);
    setShieldTimeLeft(7.4);

    const player = racersRef.current.find((r) => r.isPlayer);
    if (player) player.shieldActive = true;

    const timer = setInterval(() => {
      setShieldTimeLeft((prev) => {
        if (prev <= 0.2) {
          clearInterval(timer);
          setIsShielded(false);
          if (player) player.shieldActive = false;
          return 0;
        }
        return Number((prev - 0.2).toFixed(1));
      });
    }, 200);
  };

  // Main Game Animation & Physics Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const trackLength = 4000;
    const maxLaps = 3;

    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (!isPaused && !raceFinished) {
        setRaceTimeMs((prev) => prev + dt * 1000);

        // Update racers
        racersRef.current.forEach((racer) => {
          if (racer.isPlayer) {
            // Player boost consumption
            if (isBoosting) {
              setBoostCharge((prev) => {
                const next = Math.max(0, prev - 25 * dt);
                if (next <= 0) {
                  setIsBoosting(false);
                  racer.boostActive = false;
                }
                return next;
              });
              racer.speed = Math.min(560, racer.speed + 80 * dt);
            } else {
              if (racer.speed > 380) {
                racer.speed = Math.max(380, racer.speed - 60 * dt);
              }
              setBoostCharge((prev) => Math.min(100, prev + 12 * dt));
            }
            setSpeed(Math.round(racer.speed));
          } else {
            // AI behavior
            racer.x += (Math.sin(currentTime * 0.002 + racer.id.charCodeAt(0)) * 0.08 - 0.04) * dt;
            racer.x = Math.max(0.1, Math.min(0.9, racer.x));
            racer.speed = 360 + Math.sin(currentTime * 0.003 + racer.id.charCodeAt(0)) * 25;
          }

          // Advance progress
          racer.y += (racer.speed / 3.6) * dt * 2.5;

          // Check obstacle collisions for player
          if (racer.isPlayer) {
            obstaclesRef.current.forEach((obs) => {
              const dy = Math.abs(racer.y - obs.y);
              const dx = Math.abs(racer.x - obs.x);
              if (dy < 20 && dx < 0.12) {
                if (obs.type === 'boost_pad') {
                  racer.speed = 520;
                  setBoostCharge((prev) => Math.min(100, prev + 25));
                  soundManager.playBoost();
                } else if (obs.type === 'lantern') {
                  if (!isShielded) {
                    racer.speed = Math.max(180, racer.speed - 120);
                    soundManager.playClick();
                  }
                } else if (obs.type === 'diya_gate') {
                  setBoostCharge((prev) => Math.min(100, prev + 15));
                  soundManager.playChime();
                }
                // move obstacle ahead
                obs.y += trackLength;
              }
            });

            // Lap update
            const currentLap = Math.floor(racer.y / trackLength) + 1;
            if (currentLap > lap) {
              setLap(currentLap);
              soundManager.playChime();
            }

            // Finish check
            if (currentLap > maxLaps && !raceFinished) {
              setRaceFinished(true);
              soundManager.playVictory();
              const earnedCoins = 350;
              const earnedXp = 250;
              addPlayerProgress(earnedXp, earnedCoins, { rocketRushWins: 1 });
              unlockAchievement('first_race');
              setWinnerInfo({ rank: 1, coins: earnedCoins, xp: earnedXp });
            }
          }
        });

        // Update live rankings
        const sorted = [...racersRef.current].sort((a, b) => b.y - a.y);
        sorted.forEach((r, idx) => {
          r.rank = idx + 1;
        });
      }

      // Render Canvas Scene
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const w = canvas.width;
          const h = canvas.height;
          const player = racersRef.current.find((r) => r.isPlayer);
          const py = player ? player.y : 0;

          // Starfield & glowing Diwali sky lanterns
          ctx.fillStyle = '#0a0910';
          ctx.fillRect(0, 0, w, h);

          // Perspective Track Lines (Chandni Chowk Skyway)
          const horizonY = h * 0.28;
          ctx.strokeStyle = '#292631';
          ctx.lineWidth = 2;

          // Road borders
          ctx.beginPath();
          ctx.moveTo(w * 0.45, horizonY);
          ctx.lineTo(w * 0.05, h);
          ctx.moveTo(w * 0.55, horizonY);
          ctx.lineTo(w * 0.95, h);
          ctx.stroke();

          // Lane dividers
          ctx.strokeStyle = 'rgba(232, 163, 60, 0.25)';
          ctx.setLineDash([15, 20]);
          ctx.lineDashOffset = -py * 0.5;

          ctx.beginPath();
          ctx.moveTo(w * 0.48, horizonY);
          ctx.lineTo(w * 0.35, h);
          ctx.moveTo(w * 0.52, horizonY);
          ctx.lineTo(w * 0.65, h);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw Obstacles in 2.5D perspective
          obstaclesRef.current.forEach((obs) => {
            const relY = obs.y - py;
            if (relY > 0 && relY < 300) {
              const pScale = 1 - relY / 300;
              const screenY = horizonY + (h - horizonY) * (1 - relY / 300);
              const trackWidth = w * (0.1 + 0.8 * (1 - relY / 300));
              const screenX = w * 0.5 + (obs.x - 0.5) * trackWidth;

              if (obs.type === 'boost_pad') {
                ctx.fillStyle = '#00e1ef';
                ctx.shadowColor = '#00e1ef';
                ctx.shadowBlur = 12 * pScale;
                ctx.beginPath();
                ctx.ellipse(screenX, screenY, 18 * pScale, 8 * pScale, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
              } else if (obs.type === 'lantern') {
                ctx.fillStyle = '#f26419';
                ctx.shadowColor = '#f26419';
                ctx.shadowBlur = 10 * pScale;
                ctx.beginPath();
                ctx.arc(screenX, screenY - 10 * pScale, 10 * pScale, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
              } else if (obs.type === 'diya_gate') {
                ctx.fillStyle = '#ffc16c';
                ctx.shadowColor = '#ffc16c';
                ctx.shadowBlur = 14 * pScale;
                ctx.beginPath();
                ctx.arc(screenX, screenY - 8 * pScale, 8 * pScale, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            }
          });

          // Draw Racers
          racersRef.current.forEach((racer) => {
            if (racer.isPlayer) {
              // Player rocket rendered near bottom center
              const px = w * 0.1 + racer.x * w * 0.8;
              const pyPos = h * 0.82;

              // Jet Flame & Sparks
              ctx.fillStyle = isBoosting ? '#00e1ef' : '#f26419';
              ctx.shadowColor = isBoosting ? '#00e1ef' : '#f26419';
              ctx.shadowBlur = 20;
              ctx.beginPath();
              ctx.moveTo(px - 8, pyPos + 18);
              ctx.lineTo(px + 8, pyPos + 18);
              ctx.lineTo(px, pyPos + 38 + Math.random() * 12);
              ctx.closePath();
              ctx.fill();
              ctx.shadowBlur = 0;

              // Shield Halo
              if (isShielded) {
                ctx.strokeStyle = '#00e1ef';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#00e1ef';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(px, pyPos + 5, 34, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
              }

              // Rocket Chassis
              ctx.fillStyle = racer.color;
              ctx.beginPath();
              ctx.moveTo(px, pyPos - 22);
              ctx.lineTo(px - 14, pyPos + 16);
              ctx.lineTo(px, pyPos + 10);
              ctx.lineTo(px + 14, pyPos + 16);
              ctx.closePath();
              ctx.fill();

              // Nosecone highlight
              ctx.fillStyle = '#fff';
              ctx.beginPath();
              ctx.arc(px, pyPos - 8, 4, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Other racers
              const relY = racer.y - py;
              if (relY > -80 && relY < 300) {
                const pScale = Math.max(0.2, 1 - relY / 300);
                const screenY = horizonY + (h - horizonY) * (1 - relY / 300);
                const trackWidth = w * (0.1 + 0.8 * (1 - relY / 300));
                const screenX = w * 0.5 + (racer.x - 0.5) * trackWidth;

                ctx.fillStyle = racer.color;
                ctx.beginPath();
                ctx.arc(screenX, screenY, 10 * pScale, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isBoosting, isShielded, lap, raceFinished]);

  // Format race timer
  const formatTimer = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  };

  const playerRacer = racersRef.current.find((r) => r.isPlayer);

  return (
    <div className="flex flex-col w-full relative select-none overflow-hidden max-w-xl mx-auto pb-6">
      {/* MATCH TELEMETRY HUD BAR (Top Floating) */}
      <div className="px-gutter-sm pt-space-xs z-30 flex flex-col gap-space-xs w-full">
        <div className="flex items-center justify-between gap-space-sm bg-surface-container/90 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-lg border border-outline-variant/30">
          {/* Player Position & Lap */}
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-1 bg-primary px-space-sm py-0.5 rounded-lg shadow-[0_0_16px_rgba(232,163,60,0.5)]">
              <span
                className="material-symbols-outlined text-[16px] text-on-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                emoji_events
              </span>
              <span className="font-headline-sm text-label-md text-on-primary uppercase tracking-wider font-extrabold">
                {playerRacer?.rank || 1}st
                <span className="text-[10px] text-on-primary/70">/4</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-hud-code text-[10px] text-on-surface-variant uppercase tracking-widest leading-none font-semibold">
                Lap
              </span>
              <span className="font-hud-metric text-hud-metric text-on-surface font-bold leading-tight">
                0{Math.min(3, lap)}
                <span className="text-on-surface-variant text-[12px]">/03</span>
              </span>
            </div>
          </div>

          {/* Live Race Timer HUD */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 px-space-md py-1 rounded-full shadow-inner border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
              <span className="font-hud-timer-mobile text-hud-timer-mobile text-primary tracking-tighter">
                {formatTimer(raceTimeMs)}
              </span>
            </div>
          </div>

          {/* Session Actions (Sound & Pause) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.playClick();
                soundManager.toggleMute();
              }}
              aria-label="Toggle Sound"
              className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary active:scale-95 transition-transform border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsPaused(!isPaused);
              }}
              aria-label="Pause Game"
              className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary active:scale-95 transition-transform border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[20px]">{isPaused ? 'play_arrow' : 'pause'}</span>
            </button>
          </div>
        </div>

        {/* Live Dynamic Match Leaderboard Pill */}
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1">
          {racersRef.current.map((r, i) => (
            <div
              key={r.id}
              className={`flex items-center gap-1.5 px-space-sm py-1 rounded-full flex-shrink-0 border ${
                r.isPlayer
                  ? 'bg-primary-container/20 border-primary/40'
                  : 'bg-surface-container border-outline-variant/30'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: r.color, boxShadow: `0 0 8px ${r.color}` }}
              ></span>
              <span className={`font-hud-code text-[11px] font-bold ${r.isPlayer ? 'text-primary' : 'text-on-surface'}`}>
                {r.rank}. {r.name}
              </span>
              <span className="font-hud-code text-[10px] text-on-surface-variant">
                {r.isPlayer ? formatTimer(raceTimeMs) : `+${(i * 0.45).toFixed(2)}s`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN 3D RACING VIEWPORT CONTAINER */}
      <div className="relative w-full px-gutter-sm mt-space-xs">
        <div className="relative w-full aspect-[4/5] max-h-[440px] rounded-2xl overflow-hidden shadow-2xl bg-surface-container-lowest flex flex-col justify-between p-space-md border border-outline-variant/40">
          {/* HTML5 Game Canvas */}
          <canvas ref={canvasRef} width={400} height={440} className="absolute inset-0 w-full h-full object-cover" />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-surface-dim/40 pointer-events-none"></div>

          {/* Center Action Event Banner */}
          {turboAlert && (
            <div className="relative z-10 flex justify-center w-full animate-bounce">
              <div className="flex items-center gap-space-xs bg-surface-container-high/90 backdrop-blur-md px-space-md py-1.5 rounded-full shadow-[0_0_24px_rgba(0,225,239,0.4)] border border-tertiary">
                <span className="material-symbols-outlined text-tertiary text-[18px]">bolt</span>
                <span className="font-hud-code text-[12px] text-tertiary uppercase tracking-wider font-bold">
                  {turboAlert}
                </span>
              </div>
            </div>
          )}

          {/* Mid-HUD Telemetry (Speedometer & Boost Gauge) */}
          <div className="relative z-10 flex items-end justify-between gap-space-sm w-full mt-auto">
            {/* Speed Cluster */}
            <div className="flex flex-col bg-surface-container-lowest/80 backdrop-blur-md px-space-md py-space-sm rounded-xl shadow-lg border border-outline-variant/30">
              <div className="flex items-baseline gap-1">
                <span className="font-hud-timer-mobile text-hud-timer-mobile text-primary tracking-tighter leading-none font-bold">
                  {speed}
                </span>
                <span className="font-hud-code text-[11px] text-on-surface-variant font-bold">KM/H</span>
              </div>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-2 rounded-sm ${speed > 300 + i * 40 ? 'bg-primary' : 'bg-surface-variant'}`}
                  ></span>
                ))}
                <span className={`h-1.5 w-2 rounded-sm ${speed > 500 ? 'bg-secondary-container' : 'bg-surface-variant'}`}></span>
                <span className={`h-1.5 w-2 rounded-sm ${speed > 540 ? 'bg-tertiary' : 'bg-surface-variant'}`}></span>
              </div>
            </div>

            {/* Shield Indicator */}
            {isShielded && (
              <div className="flex items-center gap-space-xs bg-surface-container-high/90 backdrop-blur-md px-space-sm py-1.5 rounded-lg shadow-md border border-secondary">
                <span className="material-symbols-outlined text-secondary text-[18px]">shield</span>
                <div className="flex flex-col">
                  <span className="font-hud-code text-[9px] text-on-surface-variant uppercase font-semibold">
                    DIYA SHIELD
                  </span>
                  <span className="font-hud-code text-[12px] text-secondary font-bold leading-none">
                    ACTIVE: {shieldTimeLeft}s
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOOST OVERCHARGE GAUGE STRIP */}
      <div className="px-gutter-sm mt-space-xs w-full z-20">
        <div className="bg-surface-container-low p-space-xs rounded-xl shadow-md flex flex-col gap-1 border border-outline-variant/20">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-tertiary text-[14px]">local_fire_department</span>
              <span className="font-hud-code text-[11px] text-tertiary font-bold tracking-wider uppercase">
                Boost Drive
              </span>
            </div>
            <span className="font-hud-code text-[11px] text-primary font-bold">{Math.round(boostCharge)}% CHARGED</span>
          </div>
          <div className="w-full bg-surface-container-lowest h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary-container via-primary to-tertiary shadow-[0_0_12px_rgba(0,225,239,0.8)] transition-all duration-300"
              style={{ width: `${boostCharge}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ERGONOMIC MOBILE DOCK CONTROLS (Bottom Touch HUD 44px+) */}
      <div className="px-gutter-sm mt-space-sm w-full z-30">
        <div className="grid grid-cols-2 gap-space-md w-full items-stretch">
          {/* Left Thumb: Steering */}
          <div className="flex flex-col gap-space-xs bg-surface-container-low/90 backdrop-blur-md p-space-sm rounded-2xl shadow-xl border border-outline-variant/30">
            <div className="flex items-center justify-between px-1">
              <span className="font-hud-code text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                FLIGHT STEERING
              </span>
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">swap_horiz</span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs h-16">
              <button
                onClick={() => steer(-0.1)}
                aria-label="Steer Left"
                className="h-full min-h-[48px] rounded-xl bg-surface-container-high active:bg-primary-container active:scale-95 text-on-surface hover:text-primary transition-all flex flex-col items-center justify-center gap-0.5 shadow-md border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[24px]">keyboard_arrow_left</span>
                <span className="font-hud-code text-[10px] uppercase font-bold tracking-widest leading-none">LEFT</span>
              </button>
              <button
                onClick={() => steer(0.1)}
                aria-label="Steer Right"
                className="h-full min-h-[48px] rounded-xl bg-surface-container-high active:bg-primary-container active:scale-95 text-on-surface hover:text-primary transition-all flex flex-col items-center justify-center gap-0.5 shadow-md border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[24px]">keyboard_arrow_right</span>
                <span className="font-hud-code text-[10px] uppercase font-bold tracking-widest leading-none">
                  RIGHT
                </span>
              </button>
            </div>
          </div>

          {/* Right Thumb: Powers */}
          <div className="flex flex-col gap-space-xs bg-surface-container-low/90 backdrop-blur-md p-space-sm rounded-2xl shadow-xl border border-outline-variant/30">
            <div className="flex items-center justify-between px-1">
              <span className="font-hud-code text-[10px] text-primary tracking-wider uppercase font-bold">
                SPECIAL ABILITY
              </span>
              <span className="font-hud-code text-[10px] text-tertiary font-bold">LVL 3</span>
            </div>
            <div className="grid grid-cols-2 gap-space-xs h-16">
              <button
                onClick={triggerShield}
                disabled={isShielded}
                aria-label="Use Diya Shield"
                className="h-full min-h-[48px] rounded-xl bg-surface-container-high active:bg-secondary-container active:scale-95 text-on-surface hover:text-secondary transition-all flex flex-col items-center justify-center gap-0.5 shadow-md border border-outline-variant/30 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-secondary text-[22px]">shield</span>
                <span className="font-hud-code text-[10px] uppercase font-bold tracking-wider leading-none">SHIELD</span>
              </button>
              <button
                onClick={triggerBoost}
                disabled={boostCharge < 15}
                aria-label="Activate Rocket Boost"
                className="h-full min-h-[48px] rounded-xl bg-primary active:scale-95 text-on-primary font-bold transition-all flex flex-col items-center justify-center gap-0.5 shadow-[0_0_24px_rgba(232,163,60,0.5)] disabled:opacity-50"
              >
                <span
                  className="material-symbols-outlined text-on-primary text-[22px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  rocket_launch
                </span>
                <span className="font-hud-code text-[10px] uppercase font-extrabold tracking-wider leading-none text-on-primary">
                  BOOST
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STAT TICKER FOOTER */}
      <div className="px-gutter-sm mt-space-sm w-full">
        <div className="flex items-center justify-between bg-surface-container-lowest/60 px-space-md py-space-xs rounded-xl shadow-inner border border-outline-variant/20">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-tertiary">wifi_tethering</span>
            <span className="font-hud-code text-[11px] text-on-surface-variant font-semibold">
              PING: <span className="text-tertiary font-bold">18ms</span> (MUMBAI CLUSTER)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">toll</span>
            <span className="font-hud-code text-[11px] text-primary font-bold">+120 DIWALI COINS</span>
          </div>
        </div>
      </div>

      {/* Race Finished Victory Modal */}
      {winnerInfo && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl flex flex-col items-center justify-center p-margin-sm">
          <div className="relative rounded-2xl bg-surface-container-high p-6 flex flex-col items-center text-center space-y-4 max-w-sm w-full shadow-2xl border border-primary/50">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-[0_0_24px_rgba(232,163,60,0.6)]">
              <span className="material-symbols-outlined text-[36px]">emoji_events</span>
            </div>
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-extrabold">VICTORY!</h2>
              <p className="font-body-md text-on-surface-variant">You finished 1st in Rocket Rush!</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-surface-container p-3 rounded-xl border border-primary/30">
                <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">Reward</span>
                <p className="font-hud-metric text-[16px] text-primary font-bold">+{winnerInfo.coins} 🪙</p>
              </div>
              <div className="bg-surface-container p-3 rounded-xl border border-tertiary/30">
                <span className="font-label-sm text-[11px] text-outline uppercase font-semibold">EXP</span>
                <p className="font-hud-metric text-[16px] text-tertiary font-bold">+{winnerInfo.xp} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full pt-2">
              <Link
                href="/games"
                onClick={() => soundManager.playClick()}
                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface font-label-md font-bold text-center border border-outline-variant/40"
              >
                Arcade
              </Link>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setWinnerInfo(null);
                  setRaceFinished(false);
                  setLap(1);
                  setRaceTimeMs(0);
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-lg"
              >
                Race Again 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RocketRushPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-primary font-hud-code">
          INITIALIZING CHANDNI CHOWK SKYWAY... 🚀
        </div>
      }
    >
      <RocketRushContent />
    </Suspense>
  );
}
