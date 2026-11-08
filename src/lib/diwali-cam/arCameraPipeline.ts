// DIWALI CAM — Real-time AR Camera Processing Pipeline
// Raw Camera -> MediaPipe Hand Tracking -> Gesture Detection -> Canvas Rendering -> Processed Stream

import { DiwaliGestureType, ARFilterSettings, DetectedGesture } from '@/types/diwali-cam';
import { GestureDetector } from './gestureDetector';
import { ParticleEngine } from './particleEngine';

export class ARCameraPipeline {
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private rawMediaStream: MediaStream | null = null;
  private processedStream: MediaStream | null = null;

  private gestureDetector: GestureDetector;
  private particleEngine: ParticleEngine;
  private handLandmarker: any = null;
  private isLandmarkerLoading: boolean = false;
  private landmarkerReady: boolean = false;

  private animationFrameId: number | null = null;
  private lastVideoTime: number = -1;

  public settings: ARFilterSettings = {
    gestureControlEnabled: true,
    arEffectsEnabled: true,
    intensity: 1.0,
    soundEnabled: true,
    activeManualEffects: new Set<DiwaliGestureType>(),
  };

  private activeGestures: DiwaliGestureType[] = [];
  public onGestureDetected?: (gestures: DetectedGesture[]) => void;
  public onStatusChange?: (status: string) => void;

  constructor() {
    this.gestureDetector = new GestureDetector();
    this.particleEngine = new ParticleEngine();
  }

  // Initialize camera and start video stream
  public async startCamera(canvas: HTMLCanvasElement): Promise<{
    processedStream: MediaStream;
    rawAudioTrack: MediaStreamTrack | null;
  }> {
    this.canvasEl = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });

    // 1. Create hidden video element to receive camera feed
    if (!this.videoEl) {
      this.videoEl = document.createElement('video');
      this.videoEl.autoplay = true;
      this.videoEl.muted = true;
      this.videoEl.playsInline = true;
      this.videoEl.style.display = 'none';
      document.body.appendChild(this.videoEl);
    }

    // 2. Request camera & mic with graceful constraints
    this.onStatusChange?.('Requesting camera & microphone access...');
    try {
      this.rawMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } catch (err) {
      // Retry video-only if mic blocked
      this.rawMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
    }

    this.videoEl.srcObject = this.rawMediaStream;
    await new Promise<void>((resolve) => {
      if (!this.videoEl) return resolve();
      this.videoEl.onloadedmetadata = () => {
        this.videoEl!.play();
        resolve();
      };
    });

    // Match canvas dimensions to video
    const vw = this.videoEl.videoWidth || 1280;
    const vh = this.videoEl.videoHeight || 720;
    this.canvasEl.width = vw;
    this.canvasEl.height = vh;

    // 3. Initialize MediaPipe HandLandmarker in background
    this.initMediaPipe();

    // 4. Start Canvas Render Loop
    this.startRenderLoop();

    // 5. Capture processed stream from Canvas
    const canvasStream = (this.canvasEl as any).captureStream(30);
    this.processedStream = canvasStream;

    const audioTrack = this.rawMediaStream.getAudioTracks()[0] || null;

    this.onStatusChange?.('Camera and AR pipeline active');
    return {
      processedStream: this.processedStream!,
      rawAudioTrack: audioTrack,
    };
  }

  // Initialize MediaPipe HandLandmarker
  private async initMediaPipe() {
    if (this.isLandmarkerLoading || this.handLandmarker) return;
    this.isLandmarkerLoading = true;
    this.onStatusChange?.('Loading AI Hand Tracker...');

    try {
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.landmarkerReady = true;
      this.onStatusChange?.('Hand tracking ready! Try gesturing ✋ ✌️ 🤏 🙌 ☝️');
    } catch (err) {
      console.warn('MediaPipe HandLandmarker could not be loaded; manual AR filters remain fully active.', err);
      this.landmarkerReady = false;
      this.onStatusChange?.('Manual AR filters active');
    } finally {
      this.isLandmarkerLoading = false;
    }
  }

  // Canvas processing loop
  private startRenderLoop() {
    const loop = () => {
      if (!this.canvasEl || !this.ctx || !this.videoEl) return;

      const width = this.canvasEl.width;
      const height = this.canvasEl.height;

      // Draw mirrored video frame (selfie view)
      this.ctx.save();
      this.ctx.translate(width, 0);
      this.ctx.scale(-1, 1);
      if (this.videoEl.readyState >= 2) {
        this.ctx.drawImage(this.videoEl, 0, 0, width, height);
      } else {
        // Fallback backdrop
        this.ctx.fillStyle = '#131319';
        this.ctx.fillRect(0, 0, width, height);
      }
      this.ctx.restore();

      // Hand tracking & gesture detection
      const currentActiveGestures: DiwaliGestureType[] = [];

      if (
        this.settings.gestureControlEnabled &&
        this.landmarkerReady &&
        this.handLandmarker &&
        this.videoEl.readyState >= 2
      ) {
        const currentTime = this.videoEl.currentTime;
        if (currentTime !== this.lastVideoTime) {
          this.lastVideoTime = currentTime;
          try {
            const results = this.handLandmarker.detectForVideo(this.videoEl, performance.now());
            if (results && results.landmarks && results.landmarks.length > 0) {
              const detected = this.gestureDetector.detectGestures(results.landmarks);

              detected.forEach((g) => {
                currentActiveGestures.push(g.type);

                // Note: Flip X coordinate to match horizontally mirrored canvas
                const canvasX = (1 - g.position.x) * width;
                const canvasY = g.position.y * height;

                if (this.settings.arEffectsEnabled) {
                  if (g.type === 'fireworks') {
                    this.particleEngine.triggerFireworks(
                      canvasX,
                      canvasY,
                      this.settings.intensity,
                      this.settings.soundEnabled
                    );
                  } else if (g.type === 'sparkler') {
                    this.particleEngine.triggerSparkler(canvasX, canvasY, this.settings.intensity);
                  } else if (g.type === 'rocket') {
                    this.particleEngine.updateRocketOrbit(
                      canvasX,
                      canvasY,
                      this.settings.intensity,
                      this.settings.soundEnabled
                    );
                  } else if (g.type === 'diya') {
                    this.particleEngine.updateDiya(canvasX, canvasY, this.settings.soundEnabled);
                  } else if (g.type === 'finale') {
                    this.particleEngine.triggerMegaFinale(
                      width,
                      height,
                      this.settings.intensity,
                      this.settings.soundEnabled
                    );
                  }
                }
              });

              if (this.onGestureDetected && detected.length > 0) {
                this.onGestureDetected(detected);
              }
            }
          } catch (e) {
            // Hand tracking frame skip
          }
        }
      }

      this.activeGestures = currentActiveGestures;

      // Handle any active manual effects
      if (this.settings.arEffectsEnabled) {
        if (this.settings.activeManualEffects.has('fireworks')) {
          this.particleEngine.triggerFireworks(
            width * 0.5 + (Math.random() - 0.5) * 80,
            height * 0.45 + (Math.random() - 0.5) * 80,
            this.settings.intensity,
            this.settings.soundEnabled
          );
        }
        if (this.settings.activeManualEffects.has('sparkler')) {
          this.particleEngine.triggerSparkler(width * 0.5, height * 0.6, this.settings.intensity);
        }
        if (this.settings.activeManualEffects.has('finale')) {
          this.particleEngine.triggerMegaFinale(
            width,
            height,
            this.settings.intensity,
            this.settings.soundEnabled
          );
        }
      }

      // Render Particle Engine overlays onto the canvas
      if (this.settings.arEffectsEnabled) {
        this.particleEngine.render(
          this.ctx,
          width,
          height,
          this.activeGestures,
          this.settings.activeManualEffects,
          this.settings.intensity
        );
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  // Manually trigger an effect (e.g. from filter control panel)
  public triggerManualEffect(effect: DiwaliGestureType) {
    if (!this.canvasEl) return;
    const w = this.canvasEl.width;
    const h = this.canvasEl.height;

    if (effect === 'fireworks') {
      this.particleEngine.triggerFireworks(w * 0.5, h * 0.4, this.settings.intensity, this.settings.soundEnabled);
    } else if (effect === 'sparkler') {
      this.particleEngine.triggerSparkler(w * 0.5, h * 0.6, this.settings.intensity);
    } else if (effect === 'rocket') {
      this.particleEngine.updateRocketOrbit(w * 0.5, h * 0.5, this.settings.intensity, this.settings.soundEnabled);
      this.settings.activeManualEffects.add('rocket');
    } else if (effect === 'diya') {
      this.particleEngine.updateDiya(w * 0.5, h * 0.65, this.settings.soundEnabled);
      this.settings.activeManualEffects.add('diya');
    } else if (effect === 'finale') {
      this.particleEngine.triggerMegaFinale(w, h, this.settings.intensity, this.settings.soundEnabled);
    }
  }

  // Toggle manual persistent effect
  public toggleManualEffect(effect: DiwaliGestureType): boolean {
    if (this.settings.activeManualEffects.has(effect)) {
      this.settings.activeManualEffects.delete(effect);
      return false;
    } else {
      this.triggerManualEffect(effect);
      this.settings.activeManualEffects.add(effect);
      return true;
    }
  }

  // Toggle local camera track
  public setVideoEnabled(enabled: boolean) {
    if (this.rawMediaStream) {
      this.rawMediaStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  // Toggle local microphone track
  public setAudioEnabled(enabled: boolean) {
    if (this.rawMediaStream) {
      this.rawMediaStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  // Clean up and stop all tracks & loops
  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.rawMediaStream) {
      this.rawMediaStream.getTracks().forEach((t) => t.stop());
      this.rawMediaStream = null;
    }

    if (this.videoEl) {
      this.videoEl.srcObject = null;
      if (this.videoEl.parentNode) {
        this.videoEl.parentNode.removeChild(this.videoEl);
      }
      this.videoEl = null;
    }

    this.particleEngine.clear();
    this.activeGestures = [];
  }
}

