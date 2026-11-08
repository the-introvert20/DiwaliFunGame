'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { soundManager } from '@/lib/audio';
import { getPlayerProfile } from '@/lib/storage';

function generateFestiveRoomCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `DIWALI-${num}`;
}

export default function CreatePartyPage() {
  const router = useRouter();
  const [partyName, setPartyName] = useState('Diwali Dhamaka Party');
  const [hostName, setHostName] = useState('Festive Host');
  const [roomCode, setRoomCode] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const profile = getPlayerProfile();
    if (profile && profile.username) {
      setHostName(profile.username);
    }
    setRoomCode(generateFestiveRoomCode());

    // Request preview permissions
    let mounted = true;
    async function initPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: true,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
      } catch (err: any) {
        if (mounted) {
          setPermissionError('Camera or microphone permission was denied. You can still create and enter the party.');
        }
      }
    }

    initPreview();

    return () => {
      mounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleStartParty = () => {
    soundManager.playClick();
    soundManager.playRocketLaunch();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    const cleanCode = roomCode || generateFestiveRoomCode();
    const query = new URLSearchParams({
      name: hostName || 'Festive Host',
      role: 'host',
      party: partyName || 'Diwali Party',
      cam: cameraEnabled ? '1' : '0',
      mic: micEnabled ? '1' : '0',
    });

    router.push(`/diwali-cam/party/${cleanCode}?${query.toString()}`);
  };

  const toggleCamera = () => {
    soundManager.playClick();
    const next = !cameraEnabled;
    setCameraEnabled(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = next));
    }
  };

  const toggleMic = () => {
    soundManager.playClick();
    const next = !micEnabled;
    setMicEnabled(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
    }
  };

  return (
    <div className="flex flex-col w-full pb-12 select-none max-w-xl mx-auto px-margin-sm">
      {/* Navigation breadcrumb */}
      <div className="flex items-center gap-2 py-4">
        <Link
          href="/diwali-cam"
          onClick={() => soundManager.playClick()}
          className="text-on-surface-variant hover:text-primary flex items-center gap-1 text-xs font-hud-code"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>DIWALI CAM</span>
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="text-primary text-xs font-hud-code font-bold">CREATE PARTY</span>
      </div>

      <div className="bg-surface-container rounded-2xl border border-primary/30 p-5 shadow-2xl space-y-5">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold text-primary uppercase">
            Create Diwali Party Room
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure your video room details and check your camera before going live.
          </p>
        </div>

        {/* Live Camera Preview Box */}
        <div className="relative aspect-video w-full rounded-xl bg-surface-container-lowest overflow-hidden border border-outline-variant/50">
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              !cameraEnabled ? 'hidden' : ''
            }`}
          />

          {!cameraEnabled && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">videocam_off</span>
              <span className="text-xs font-mono">Camera is Turned Off</span>
            </div>
          )}

          {/* Quick controls on preview */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-md border border-outline-variant/40 shadow-lg">
            <button
              type="button"
              onClick={toggleCamera}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                cameraEnabled
                  ? 'bg-surface-container text-primary border border-primary/40'
                  : 'bg-error-container text-on-error-container'
              }`}
              title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {cameraEnabled ? 'videocam' : 'videocam_off'}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleMic}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                micEnabled
                  ? 'bg-surface-container text-primary border border-primary/40'
                  : 'bg-error-container text-on-error-container'
              }`}
              title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {micEnabled ? 'mic' : 'mic_off'}
              </span>
            </button>
          </div>

          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container/90 text-[10px] font-hud-code text-primary font-bold border border-primary/30">
            HOST PREVIEW
          </div>
        </div>

        {permissionError && (
          <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-mono">
            {permissionError}
          </div>
        )}

        {/* Party Details Form */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-hud-code text-on-surface-variant uppercase mb-1">
              Party Title
            </label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g. Diwali Dhamaka 2026"
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-hud-code text-on-surface-variant uppercase mb-1">
                Your Host Name
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Host Name"
                className="w-full bg-surface-container-high border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-hud-code text-on-surface-variant uppercase">
                  Room Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setRoomCode(generateFestiveRoomCode());
                  }}
                  className="text-[10px] text-tertiary hover:underline font-mono"
                >
                  Regenerate
                </button>
              </div>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="DIWALI-XXXX"
                className="w-full bg-surface-container-high border border-primary/40 rounded-xl px-3.5 py-2.5 text-sm font-hud-code font-bold text-primary focus:outline-none focus:border-primary tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartParty}
          className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-hud-code text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-diya hover:bg-primary-fixed transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">celebration</span>
          <span>Start Diwali Party</span>
        </button>
      </div>
    </div>
  );
}
