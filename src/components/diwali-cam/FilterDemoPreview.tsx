'use client';

import React, { useRef, useEffect, useState } from 'react';
import { DiwaliGestureType } from '@/types/diwali-cam';
import { ParticleEngine } from '@/lib/diwali-cam/particleEngine';
import { soundManager } from '@/lib/audio';

interface FilterDemoPreviewProps {
  initialEffect?: DiwaliGestureType;
  showControls?: boolean;
}

export default function FilterDemoPreview({
  initialEffect = 'fireworks',
  showControls = true,
}: FilterDemoPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<DiwaliGestureType>(initialEffect);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new ParticleEngine();
    engineRef.current = engine;

    let time = 0;
    const manualEffects = new Set<DiwaliGestureType>([selectedEffect]);

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Draw background: live webcam or stylized festive stage
      if (isCameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        ctx.restore();
      } else {
        // Festive gradient room
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#1c1b22');
        bgGrad.addColorStop(1, '#0e0d14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Subtle ambient Diwali lights
        for (let i = 0; i < 5; i++) {
          const lx = (w * (i + 1)) / 6;
          const ly = 24 + Math.sin(time * 2 + i) * 3;
          ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 193, 108, 0.4)' : 'rgba(0, 225, 239, 0.3)';
          ctx.beginPath();
          ctx.arc(lx, ly, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Stylized user silhouette/avatar in center
        ctx.save();
        ctx.fillStyle = '#2a2931';
        ctx.beginPath();
        // Head
        ctx.arc(w / 2, h / 2 - 25, 45, 0, Math.PI * 2);
        ctx.fill();
        // Shoulders
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2 + 70, 85, 55, 0, 0, Math.PI);
        ctx.fill();
        ctx.restore();
      }

      // Automatically trigger periodic bursts for the selected demo filter
      if (Math.floor(time * 30) % 45 === 0) {
        if (selectedEffect === 'fireworks') {
          engine.triggerFireworks(
            w * 0.5 + (Math.random() - 0.5) * 80,
            h * 0.45 + (Math.random() - 0.5) * 60,
            1,
            false
          );
        } else if (selectedEffect === 'sparkler') {
          engine.triggerSparkler(w * 0.5, h * 0.6, 1.2);
        } else if (selectedEffect === 'finale') {
          engine.triggerMegaFinale(w, h, 0.8, false);
        }
      }

      if (selectedEffect === 'sparkler') {
        engine.triggerSparkler(w * 0.5 + Math.sin(time * 3) * 20, h * 0.55, 1);
      } else if (selectedEffect === 'rocket') {
        engine.updateRocketOrbit(w * 0.5, h * 0.45, 1, false);
      } else if (selectedEffect === 'diya') {
        engine.updateDiya(w * 0.5, h * 0.6, false);
      }

      manualEffects.clear();
      manualEffects.add(selectedEffect);

      engine.render(ctx, w, h, [selectedEffect], manualEffects, 1.0);
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      engine.clear();
    };
  }, [selectedEffect, isCameraActive]);

  // Toggle live camera preview
  const toggleLiveCamera = async () => {
    soundManager.playClick();
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      if (!videoRef.current) {
        videoRef.current = document.createElement('video');
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
      }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('Camera access required for live test.');
      setIsCameraActive(false);
    }
  };

  return (
    <div className="flex flex-col w-full rounded-2xl bg-surface-container overflow-hidden border border-outline-variant/40 shadow-2xl">
      {/* Visual Canvas Container */}
      <div className="relative aspect-video w-full bg-surface-container-lowest overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-cover"
        />

        {/* Live Filter Indicator Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container/90 backdrop-blur-md border border-primary/30 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span className="font-hud-code text-[11px] font-bold text-primary uppercase">
            AR PREVIEW: {selectedEffect}
          </span>
        </div>

        {/* Live Camera Toggle Button */}
        <button
          onClick={toggleLiveCamera}
          className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-hud-code font-bold flex items-center gap-1.5 transition-all shadow-md ${
            isCameraActive
              ? 'bg-secondary text-on-secondary shadow-ignition'
              : 'bg-surface-container/90 text-on-surface hover:text-primary border border-outline-variant/40'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isCameraActive ? 'videocam_off' : 'videocam'}
          </span>
          <span>{isCameraActive ? 'Stop Live Cam' : 'Test My Camera'}</span>
        </button>

        {cameraError && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-mono">
            {cameraError}
          </div>
        )}
      </div>

      {/* Filter Selector Tabs */}
      {showControls && (
        <div className="p-3 bg-surface-container-high/60 border-t border-outline-variant/30 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {(
            [
              { type: 'fireworks', label: 'Fireworks', icon: 'flare', gesture: '✋' },
              { type: 'rocket', label: 'Rocket Orbit', icon: 'rocket_launch', gesture: '✌️' },
              { type: 'sparkler', label: 'Sparkler', icon: 'auto_awesome', gesture: '🤏' },
              { type: 'diya', label: 'Floating Diya', icon: 'lightbulb', gesture: '☝️' },
              { type: 'finale', label: 'Mega Finale', icon: 'celebration', gesture: '🙌' },
            ] as const
          ).map((item) => (
            <button
              key={item.type}
              onClick={() => {
                soundManager.playClick();
                setSelectedEffect(item.type);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedEffect === item.type
                  ? 'bg-primary text-on-primary shadow-diya scale-105'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
              }`}
            >
              <span>{item.gesture}</span>
              <span className="font-hud-code">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

