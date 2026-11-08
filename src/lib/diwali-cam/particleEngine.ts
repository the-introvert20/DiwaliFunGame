// DIWALI CAM — Gesture-Based Festive AR Particle Engine
// Renders Fireworks, Orbiting Rocket, Sparkler, Floating Diya, and Mega Finale onto Canvas

import { DiwaliGestureType } from '@/types/diwali-cam';
import { soundManager } from '@/lib/audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  decay: number;
  trail?: { x: number; y: number }[];
  gravity?: number;
  flicker?: boolean;
}

interface Confetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
}

const FESTIVE_PALETTE = [
  '#ffc16c', // Royal Gold
  '#f6bd60', // Marigold
  '#00e1ef', // Neon Cyan
  '#f26419', // Deep Saffron / Orange
  '#d62246', // Festive Magenta
  '#ffdbcd', // Warm Glow
  '#ffffff', // Spark White
];

export class ParticleEngine {
  private particles: Particle[] = [];
  private confettis: Confetti[] = [];
  private rocketAngle: number = 0;
  private diyaFlameTime: number = 0;
  private soundCooldowns: Map<string, number> = new Map();

  // Floating diya target position for smooth lerp
  private diyaTarget: { x: number; y: number } | null = null;
  private diyaCurrent: { x: number; y: number } | null = null;

  // Orbit center target
  private orbitCenterTarget: { x: number; y: number } | null = null;
  private orbitCenterCurrent: { x: number; y: number } | null = null;

  // Sound triggering helper with rate limit
  private playEffectSound(effect: DiwaliGestureType, soundEnabled: boolean) {
    if (!soundEnabled) return;
    const now = Date.now();
    const last = this.soundCooldowns.get(effect) || 0;

    if (effect === 'fireworks' && now - last > 600) {
      soundManager.playFireworkBurst();
      this.soundCooldowns.set(effect, now);
    } else if (effect === 'rocket' && now - last > 900) {
      soundManager.playRocketLaunch();
      this.soundCooldowns.set(effect, now);
    } else if (effect === 'finale' && now - last > 1200) {
      soundManager.playFireworkBurst();
      setTimeout(() => soundManager.playFireworkBurst(), 350);
      this.soundCooldowns.set(effect, now);
    } else if (effect === 'diya' && now - last > 2000) {
      soundManager.playCoin();
      this.soundCooldowns.set(effect, now);
    }
  }

  // Spawn Open Palm Fireworks
  public triggerFireworks(x: number, y: number, intensity: number = 1, soundEnabled: boolean = true) {
    this.playEffectSound('fireworks', soundEnabled);
    const count = Math.floor(45 * intensity);
    const baseColor = FESTIVE_PALETTE[Math.floor(Math.random() * FESTIVE_PALETTE.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = (2.5 + Math.random() * 5.5) * intensity;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? baseColor : FESTIVE_PALETTE[Math.floor(Math.random() * FESTIVE_PALETTE.length)],
        size: (2.5 + Math.random() * 3.5) * intensity,
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 25,
        decay: 0.02 + Math.random() * 0.015,
        gravity: 0.08,
        trail: [],
      });
    }
  }

  // Continuous Sparkler Effect at pinch coordinates
  public triggerSparkler(x: number, y: number, intensity: number = 1) {
    const count = Math.floor(6 * intensity);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 6) * intensity;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.4 ? '#ffddb5' : Math.random() > 0.5 ? '#ffc16c' : '#ffffff',
        size: (1.5 + Math.random() * 2.5) * intensity,
        alpha: 1,
        life: 0,
        maxLife: 12 + Math.random() * 10,
        decay: 0.07 + Math.random() * 0.03,
        gravity: 0.12,
        flicker: true,
        trail: [{ x, y }],
      });
    }
  }

  // Update Orbit Center for Rocket
  public updateRocketOrbit(centerX: number, centerY: number, intensity: number = 1, soundEnabled: boolean = true) {
    this.playEffectSound('rocket', soundEnabled);
    this.orbitCenterTarget = { x: centerX, y: centerY };
  }

  // Update Diya target position
  public updateDiya(x: number, y: number, soundEnabled: boolean = true) {
    this.playEffectSound('diya', soundEnabled);
    this.diyaTarget = { x, y };
  }

  // Spawn Grand Mega Finale
  public triggerMegaFinale(canvasWidth: number, canvasHeight: number, intensity: number = 1, soundEnabled: boolean = true) {
    this.playEffectSound('finale', soundEnabled);

    // Multi-burst barrage across top canvas
    const burstCount = Math.floor(4 * intensity);
    for (let b = 0; b < burstCount; b++) {
      const bx = (canvasWidth * (0.2 + 0.6 * (b / Math.max(1, burstCount - 1)))) + (Math.random() - 0.5) * 60;
      const by = (canvasHeight * (0.15 + Math.random() * 0.25));
      this.triggerFireworks(bx, by, intensity * 1.2, false);
    }

    // Confetti shower
    const confettiCount = Math.floor(50 * intensity);
    for (let c = 0; c < confettiCount; c++) {
      this.confettis.push({
        x: Math.random() * canvasWidth,
        y: -10 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        color: FESTIVE_PALETTE[Math.floor(Math.random() * FESTIVE_PALETTE.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        alpha: 1,
      });
    }
  }

  // Render Loop
  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    activeGestures: DiwaliGestureType[],
    manualEffects: Set<DiwaliGestureType>,
    intensity: number = 1
  ) {
    this.diyaFlameTime += 0.08;

    // 1. Render Active Floating Diya if detected or active
    const showDiya = activeGestures.includes('diya') || manualEffects.has('diya');
    if (showDiya && (this.diyaTarget || manualEffects.has('diya'))) {
      if (!this.diyaTarget && manualEffects.has('diya')) {
        this.diyaTarget = { x: width * 0.5, y: height * 0.65 };
      }
      if (this.diyaTarget) {
        if (!this.diyaCurrent) {
          this.diyaCurrent = { ...this.diyaTarget };
        } else {
          // Smooth spring lerp
          this.diyaCurrent.x += (this.diyaTarget.x - this.diyaCurrent.x) * 0.2;
          this.diyaCurrent.y += (this.diyaTarget.y - this.diyaCurrent.y) * 0.2;
        }

        const bob = Math.sin(this.diyaFlameTime * 2) * 4;
        this.drawFloatingDiya(ctx, this.diyaCurrent.x, this.diyaCurrent.y + bob, intensity);

        // Spawn tiny rising embers from flame
        if (Math.random() > 0.4) {
          this.particles.push({
            x: this.diyaCurrent.x + (Math.random() - 0.5) * 8,
            y: this.diyaCurrent.y - 18 + bob,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -1.2 - Math.random() * 1.5,
            color: Math.random() > 0.3 ? '#ffc16c' : '#f26419',
            size: 2 + Math.random() * 2,
            alpha: 0.9,
            life: 0,
            maxLife: 20,
            decay: 0.05,
          });
        }
      }
    } else {
      this.diyaTarget = null;
      this.diyaCurrent = null;
    }

    // 2. Render Orbiting Rocket if peace sign detected or manual active
    const showRocket = activeGestures.includes('rocket') || manualEffects.has('rocket');
    if (showRocket) {
      if (!this.orbitCenterTarget && manualEffects.has('rocket')) {
        this.orbitCenterTarget = { x: width * 0.5, y: height * 0.45 };
      }
      if (this.orbitCenterTarget) {
        if (!this.orbitCenterCurrent) {
          this.orbitCenterCurrent = { ...this.orbitCenterTarget };
        } else {
          this.orbitCenterCurrent.x += (this.orbitCenterTarget.x - this.orbitCenterCurrent.x) * 0.15;
          this.orbitCenterCurrent.y += (this.orbitCenterTarget.y - this.orbitCenterCurrent.y) * 0.15;
        }

        this.rocketAngle += 0.065;
        const radiusX = 110 * intensity;
        const radiusY = 60 * intensity;
        const rx = this.orbitCenterCurrent.x + Math.cos(this.rocketAngle) * radiusX;
        const ry = this.orbitCenterCurrent.y + Math.sin(this.rocketAngle) * radiusY;

        // Tangent velocity angle
        const vx = -Math.sin(this.rocketAngle) * radiusX;
        const vy = Math.cos(this.rocketAngle) * radiusY;
        const tangentAngle = Math.atan2(vy, vx);

        this.drawRocket(ctx, rx, ry, tangentAngle, intensity);

        // Exhaust trail
        for (let i = 0; i < 3; i++) {
          const exhaustAngle = tangentAngle + Math.PI + (Math.random() - 0.5) * 0.4;
          const speed = 2 + Math.random() * 3;
          this.particles.push({
            x: rx - Math.cos(tangentAngle) * 16,
            y: ry - Math.sin(tangentAngle) * 16,
            vx: Math.cos(exhaustAngle) * speed,
            vy: Math.sin(exhaustAngle) * speed,
            color: Math.random() > 0.4 ? '#f26419' : '#ffc16c',
            size: (2.5 + Math.random() * 3) * intensity,
            alpha: 1,
            life: 0,
            maxLife: 18,
            decay: 0.06,
          });
        }
      }
    } else {
      this.orbitCenterTarget = null;
      this.orbitCenterCurrent = null;
    }

    // 3. Render Particles with additive glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update physics
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;
      p.life++;

      if (p.trail) {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.shift();
      }

      if (p.alpha <= 0 || p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      const drawAlpha = p.flicker && Math.random() > 0.3 ? p.alpha * 0.6 : p.alpha;
      ctx.globalAlpha = Math.max(0, Math.min(1, drawAlpha));

      // Draw particle trail if present
      if (p.trail && p.trail.length > 1) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let t = 1; t < p.trail.length; t++) {
          ctx.lineTo(p.trail[t].x, p.trail[t].y);
        }
        ctx.stroke();
      }

      // Draw particle glow
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * (1 - p.life / p.maxLife)), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 4. Render Confetti
    if (this.confettis.length > 0) {
      ctx.save();
      for (let i = this.confettis.length - 1; i >= 0; i--) {
        const c = this.confettis[i];
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;
        if (c.y > height + 20) {
          this.confettis.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        ctx.restore();
      }
      ctx.restore();
    }
  }

  // Draw Traditional Terracotta Diya with Flickering Flame & Radiant Glow
  private drawFloatingDiya(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number = 1) {
    ctx.save();
    const s = 1.1 * scale;

    // 1. Radiant Diya Aura
    const radialGlow = ctx.createRadialGradient(x, y - 10 * s, 4 * s, x, y - 10 * s, 65 * s);
    radialGlow.addColorStop(0, 'rgba(255, 193, 108, 0.65)');
    radialGlow.addColorStop(0.35, 'rgba(242, 100, 25, 0.35)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.beginPath();
    ctx.arc(x, y - 10 * s, 65 * s, 0, Math.PI * 2);
    ctx.fill();

    // 2. Terracotta Base
    ctx.save();
    ctx.fillStyle = '#8d3b1b'; // Baked clay terracotta
    ctx.beginPath();
    ctx.ellipse(x, y + 4 * s, 26 * s, 12 * s, 0, 0, Math.PI);
    ctx.fill();

    // Diya rim & inner oil pool
    ctx.fillStyle = '#e8a33c'; // Golden oil shimmer
    ctx.beginPath();
    ctx.ellipse(x, y + 2 * s, 24 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffc16c';
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
    ctx.restore();

    // 3. Flickering Flame
    const flicker = Math.sin(this.diyaFlameTime * 15) * (1.5 * s) + Math.cos(this.diyaFlameTime * 8) * (1 * s);
    const flameHeight = (28 + Math.sin(this.diyaFlameTime * 12) * 3) * s;

    // Outer flame (vibrant saffron)
    ctx.fillStyle = '#f26419';
    ctx.beginPath();
    ctx.moveTo(x - 8 * s, y);
    ctx.bezierCurveTo(x - 10 * s, y - 12 * s, x + flicker, y - flameHeight * 0.7, x + flicker, y - flameHeight);
    ctx.bezierCurveTo(x + flicker, y - flameHeight * 0.7, x + 10 * s, y - 12 * s, x + 8 * s, y);
    ctx.closePath();
    ctx.fill();

    // Inner flame (bright gold/white core)
    ctx.fillStyle = '#fffae6';
    ctx.beginPath();
    ctx.moveTo(x - 4 * s, y);
    ctx.bezierCurveTo(x - 5 * s, y - 8 * s, x + flicker * 0.5, y - flameHeight * 0.6, x + flicker * 0.5, y - flameHeight * 0.8);
    ctx.bezierCurveTo(x + flicker * 0.5, y - flameHeight * 0.6, x + 5 * s, y - 8 * s, x + 4 * s, y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw Stylized Diwali Rocket Sprite with Thrust Flame
  private drawRocket(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const s = 0.9 * scale;

    // Rocket Body
    ctx.fillStyle = '#d62246'; // Magenta/Red cylinder body
    ctx.fillRect(-12 * s, -5 * s, 20 * s, 10 * s);

    // Decorative Gold Band
    ctx.fillStyle = '#ffc16c';
    ctx.fillRect(-3 * s, -5 * s, 4 * s, 10 * s);

    // Conical Nose Cone
    ctx.fillStyle = '#ffb956';
    ctx.beginPath();
    ctx.moveTo(8 * s, -6 * s);
    ctx.lineTo(18 * s, 0);
    ctx.lineTo(8 * s, 6 * s);
    ctx.closePath();
    ctx.fill();

    // Tail Fins
    ctx.fillStyle = '#f26419';
    ctx.beginPath();
    ctx.moveTo(-12 * s, -5 * s);
    ctx.lineTo(-18 * s, -10 * s);
    ctx.lineTo(-9 * s, -5 * s);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-12 * s, 5 * s);
    ctx.lineTo(-18 * s, 10 * s);
    ctx.lineTo(-9 * s, 5 * s);
    ctx.closePath();
    ctx.fill();

    // Booster Exhaust Flame
    const flameLen = (12 + Math.random() * 8) * s;
    ctx.fillStyle = '#fffae6';
    ctx.beginPath();
    ctx.moveTo(-12 * s, -3 * s);
    ctx.lineTo(-12 * s - flameLen, 0);
    ctx.lineTo(-12 * s, 3 * s);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  public clear() {
    this.particles = [];
    this.confettis = [];
  }
}
