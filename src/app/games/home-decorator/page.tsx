'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { soundManager } from '@/lib/audio';
import { addPlayerProgress } from '@/lib/storage';

interface PlacedItem {
  id: string;
  type: string;
  x: number;
  y: number;
  icon: string;
  color: string;
}

const DECOR_ITEMS = [
  { id: 'diya', name: 'Clay Diya', icon: '🪔', color: '#ffc16c' },
  { id: 'marigold', name: 'Marigold Garland', icon: '🌼', color: '#f6bd60' },
  { id: 'lantern', name: 'Kandil Lantern', icon: '🏮', color: '#f26419' },
  { id: 'candle', name: 'Floating Lotus', icon: '🪷', color: '#00e1ef' },
  { id: 'lights', name: 'Fairy Lights', icon: '✨', color: '#ffffff' },
];

export default function HomeDecoratorPage() {
  const [selectedItem, setSelectedItem] = useState(DECOR_ITEMS[0]);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([
    { id: '1', type: 'diya', x: 25, y: 70, icon: '🪔', color: '#ffc16c' },
    { id: '2', type: 'diya', x: 75, y: 70, icon: '🪔', color: '#ffc16c' },
    { id: '3', type: 'lantern', x: 50, y: 25, icon: '🏮', color: '#f26419' },
  ]);
  const [saveNotice, setSaveNotice] = useState(false);

  const handlePlace = (e: React.MouseEvent<HTMLDivElement>) => {
    soundManager.playChime();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newItem: PlacedItem = {
      id: Math.random().toString(),
      type: selectedItem.id,
      x,
      y,
      icon: selectedItem.icon,
      color: selectedItem.color,
    };

    setPlacedItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    setPlacedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const saveCourtyard = () => {
    soundManager.playVictory();
    setSaveNotice(true);
    addPlayerProgress(150, 200, { diyasLit: placedItems.length });
    setTimeout(() => setSaveNotice(false), 2500);
  };

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-xl mx-auto pb-10 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold uppercase">
            Co-op Diwali Haveli
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Decorate the ancestral courtyard with friends
          </p>
        </div>
        <div className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full border border-primary/30">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>
          <span className="font-hud-code text-[11px] text-mint font-bold">COURTYARD #07</span>
        </div>
      </div>

      {/* Courtyard Interactive Scene */}
      <div
        onClick={handlePlace}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/40 bg-surface-container-lowest cursor-pointer"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 60%, rgba(232, 163, 60, 0.25) 0%, rgba(19, 19, 25, 0.95) 75%)",
        }}
      >
        {/* Heritage Arch Background Graphic */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <span className="material-symbols-outlined text-[140px] text-primary">temple_hindu</span>
        </div>

        {/* Placed Items */}
        {placedItems.map((item) => (
          <div
            key={item.id}
            onClick={(e) => handleRemoveItem(item.id, e)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <span
              className="text-[28px] drop-shadow-[0_0_12px_rgba(232,163,60,0.8)]"
              style={{ color: item.color }}
            >
              {item.icon}
            </span>
            <span className="hidden group-hover:block absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] bg-surface-container px-1 rounded text-error">
              ✕
            </span>
          </div>
        ))}

        <div className="absolute bottom-2 left-3 right-3 text-center pointer-events-none">
          <span className="font-hud-code text-[10px] text-on-surface-variant bg-surface/80 px-3 py-1 rounded-full backdrop-blur-sm">
            Tap courtyard to place {selectedItem.name} · Tap placed item to remove
          </span>
        </div>
      </div>

      {/* Item Palette */}
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {DECOR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedItem(item);
              }}
              className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                selectedItem.id === item.id
                  ? 'bg-primary-container text-on-primary-container border-primary shadow-lg'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface'
              }`}
            >
              <span className="text-[22px]">{item.icon}</span>
              <span className="font-label-sm text-[9px] font-bold truncate max-w-full">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              setPlacedItems([]);
            }}
            className="flex-1 py-3 rounded-xl bg-surface-container text-error font-label-md font-bold border border-outline-variant/30"
          >
            Reset
          </button>
          <button
            onClick={saveCourtyard}
            className="flex-[2] py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm font-bold shadow-md active:scale-95 transition-transform"
          >
            {saveNotice ? 'SAVED TO CLOUD! ✨' : 'Save Haveli Decor 🪔'}
          </button>
        </div>
      </div>
    </div>
  );
}

