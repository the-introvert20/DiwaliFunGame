'use client';

import React, { useState } from 'react';
import { ARFilterSettings, DiwaliGestureType } from '@/types/diwali-cam';
import { soundManager } from '@/lib/audio';

interface FilterControlPanelProps {
  settings: ARFilterSettings;
  onUpdateSettings: (newSettings: Partial<ARFilterSettings>) => void;
  onTriggerEffect: (effect: DiwaliGestureType) => void;
  activeGestures?: DiwaliGestureType[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const GESTURE_ITEMS = [
  {
    type: 'fireworks' as DiwaliGestureType,
    name: 'Fireworks',
    gesture: '✋ Open Palm',
    icon: 'flare',
    color: 'from-amber-500 to-orange-500',
    desc: 'Show an open palm to spark glowing explosive bursts',
  },
  {
    type: 'rocket' as DiwaliGestureType,
    name: 'Rocket Orbit',
    gesture: '✌️ Peace Sign',
    icon: 'rocket_launch',
    color: 'from-orange-500 to-red-500',
    desc: 'Flash peace sign to orbit a blazing Diwali rocket',
  },
  {
    type: 'sparkler' as DiwaliGestureType,
    name: 'Sparkler',
    gesture: '🤏 Pinch',
    icon: 'auto_awesome',
    color: 'from-yellow-400 to-amber-300',
    desc: 'Pinch thumb and index together for sizzling sparks',
  },
  {
    type: 'diya' as DiwaliGestureType,
    name: 'Floating Diya',
    gesture: '☝️ Index Finger',
    icon: 'lightbulb',
    color: 'from-amber-400 to-yellow-600',
    desc: 'Point index finger up to hover a flickering sacred diya',
  },
  {
    type: 'finale' as DiwaliGestureType,
    name: 'Mega Finale',
    gesture: '🙌 Both Hands',
    icon: 'celebration',
    color: 'from-cyan-400 to-pink-500',
    desc: 'Raise both hands to ignite a grand aerial Diwali finale',
  },
];

export default function FilterControlPanel({
  settings,
  onUpdateSettings,
  onTriggerEffect,
  activeGestures = [],
  isExpanded,
  onToggleExpand,
}: FilterControlPanelProps) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="flex flex-col bg-surface-container/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 bg-surface-container-high/60">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            magic_button
          </span>
          <span className="font-headline-sm text-sm font-bold text-primary tracking-wide">
            DIWALI AR FILTERS
          </span>
          {activeGestures.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-hud-code font-bold animate-pulse">
              {activeGestures[0].toUpperCase()} ACTIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowGuide(!showGuide);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-hud-code font-bold flex items-center gap-1 transition-all ${
              showGuide
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-primary border border-outline-variant/40'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">school</span>
            <span>Guide</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleExpand();
            }}
            className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/40"
            aria-label="Toggle Panel"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExpanded ? 'expand_more' : 'tune'}
            </span>
          </button>
        </div>
      </div>

      {/* Gesture Guide Accordion */}
      {showGuide && (
        <div className="p-3 bg-surface-container-lowest/80 border-b border-outline-variant/30 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-hud-code pb-1 border-b border-outline-variant/20">
            <span>GESTURE CONTROLS</span>
            <span className="text-tertiary">Real-time local AI detection</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GESTURE_ITEMS.map((item) => (
              <div
                key={item.type}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-container-high/50 border border-outline-variant/20 hover:border-primary/40 transition-colors"
              >
                <div className="text-xl flex-shrink-0 mt-0.5">{item.gesture.split(' ')[0]}</div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{item.name}</span>
                    <span className="text-[10px] text-tertiary font-hud-code">{item.gesture.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Controls Area */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Quick Manual Trigger Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-hud-code text-on-surface-variant tracking-wider uppercase">
                Tap to Trigger Effects
              </span>
              <span className="text-[10px] text-tertiary font-mono">BROADCASTED IN VIDEO</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {GESTURE_ITEMS.map((item) => {
                const isActive =
                  activeGestures.includes(item.type) || settings.activeManualEffects.has(item.type);

                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      soundManager.playClick();
                      onTriggerEffect(item.type);
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all active:scale-95 border ${
                      isActive
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(255,193,108,0.4)] scale-105'
                        : 'bg-surface-container-high/70 border-outline-variant/40 text-on-surface hover:border-primary/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] mb-1">{item.icon}</span>
                    <span className="text-[10px] font-bold leading-tight truncate text-center max-w-full">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">
                      {item.gesture.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Toggles & Intensity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-outline-variant/30">
            {/* Gesture Control Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  front_hand
                </span>
                <span className="text-xs font-semibold text-on-surface">Gesture Control</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ gestureControlEnabled: !settings.gestureControlEnabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  settings.gestureControlEnabled ? 'bg-primary' : 'bg-surface-bright'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-surface shadow-md transform transition-transform ${
                    settings.gestureControlEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* AR Effects Master Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  auto_fix_high
                </span>
                <span className="text-xs font-semibold text-on-surface">AR Effects</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ arEffectsEnabled: !settings.arEffectsEnabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  settings.arEffectsEnabled ? 'bg-primary' : 'bg-surface-bright'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-surface shadow-md transform transition-transform ${
                    settings.arEffectsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  {settings.soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
                <span className="text-xs font-semibold text-on-surface">Diwali SFX Audio</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ soundEnabled: !settings.soundEnabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  settings.soundEnabled ? 'bg-secondary' : 'bg-surface-bright'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-surface shadow-md transform transition-transform ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Effect Intensity Slider */}
            <div className="flex flex-col justify-center p-2.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-on-surface">Effect Intensity</span>
                <span className="text-[11px] font-hud-code text-primary font-bold">
                  {settings.intensity.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.intensity}
                onChange={(e) => onUpdateSettings({ intensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-surface-bright rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
