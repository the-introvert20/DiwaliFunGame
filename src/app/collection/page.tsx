'use client';

import React, { useState, useEffect } from 'react';
import { soundManager } from '@/lib/audio';
import { getPlayerProfile, savePlayerProfile, INITIAL_ACHIEVEMENTS, INITIAL_SHOP_ITEMS } from '@/lib/storage';
import { PlayerProfile, InventoryItem, Achievement } from '@/types';

export default function CollectionPage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'skins' | 'achievements'>('skins');
  const [shopItems, setShopItems] = useState<InventoryItem[]>(INITIAL_SHOP_ITEMS);

  useEffect(() => {
    const p = getPlayerProfile();
    setProfile(p);

    // Mark owned items from profile inventory
    setShopItems((prev) =>
      prev.map((item) => ({
        ...item,
        unlocked: p.inventory.includes(item.id),
      }))
    );
  }, []);

  const handleBuy = (item: InventoryItem) => {
    if (!profile) return;
    if (profile.coins < item.priceCoins) {
      alert('Not enough coins! Win matches in Rocket Rush or complete quests.');
      return;
    }

    soundManager.playCoin();
    const updated = {
      ...profile,
      coins: profile.coins - item.priceCoins,
      inventory: [...profile.inventory, item.id],
    };
    savePlayerProfile(updated);
    setProfile(updated);
    setShopItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, unlocked: true } : i))
    );
  };

  const handleEquip = (itemId: string) => {
    if (!profile) return;
    soundManager.playClick();
    const updated = {
      ...profile,
      selectedSkin: itemId,
    };
    savePlayerProfile(updated);
    setProfile(updated);
  };

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-4xl mx-auto pb-12 select-none">
      <div className="flex items-center justify-between pt-space-xs">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold uppercase">
            FESTIVAL ARMORY
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Equip custom rocket skins, festive trails, and claim achievement rewards.
          </p>
        </div>
        <div className="bg-surface-container px-3.5 py-1.5 rounded-full border border-primary/30 flex items-center gap-1.5 shadow-sm">
          <span>🪙</span>
          <span className="font-hud-metric text-[14px] text-primary font-bold">
            {profile?.coins.toLocaleString() || '1,000'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl border border-outline-variant/30">
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('skins');
          }}
          className={`flex-1 py-2 rounded-lg font-label-md text-label-md font-bold uppercase transition-all ${
            activeTab === 'skins'
              ? 'bg-primary-container text-on-primary-container shadow'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Skins &amp; Trails
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            setActiveTab('achievements');
          }}
          className={`flex-1 py-2 rounded-lg font-label-md text-label-md font-bold uppercase transition-all ${
            activeTab === 'achievements'
              ? 'bg-primary-container text-on-primary-container shadow'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Achievements ({profile?.achievements.length || 0})
        </button>
      </div>

      {/* Skins Grid */}
      {activeTab === 'skins' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shopItems.map((item) => {
            const isEquipped = profile?.selectedSkin === item.id;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-surface-container flex flex-col justify-between gap-3 border transition-all ${
                  isEquipped ? 'border-primary shadow-[0_0_16px_rgba(232,163,60,0.25)]' : 'border-outline-variant/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary text-[24px]">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </span>
                    <div>
                      <h4 className="font-headline-sm text-[16px] text-on-surface font-bold">{item.name}</h4>
                      <span className="font-hud-code text-[10px] text-tertiary uppercase font-semibold">
                        {item.rarity} · {item.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {isEquipped && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-hud-code text-[10px] font-extrabold">
                      EQUIPPED
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <span className="font-hud-metric text-[14px] text-primary font-bold">
                    {item.unlocked ? 'OWNED' : `🪙 ${item.priceCoins}`}
                  </span>
                  {item.unlocked ? (
                    <button
                      onClick={() => handleEquip(item.id)}
                      disabled={isEquipped}
                      className="h-9 px-4 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm font-bold border border-outline-variant/40 disabled:opacity-40"
                    >
                      {isEquipped ? 'Active' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm font-bold shadow-md active:scale-95 transition-transform"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Achievements List */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          {INITIAL_ACHIEVEMENTS.map((ach) => {
            const isCompleted = profile?.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-xl bg-surface-container flex items-center justify-between border ${
                  isCompleted ? 'border-tertiary/40' : 'border-outline-variant/20 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-[22px] ${
                      isCompleted ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container-high text-outline'
                    }`}
                  >
                    <span className="material-symbols-outlined">{ach.icon}</span>
                  </span>
                  <div>
                    <h4 className="font-label-md font-bold text-on-surface">{ach.title}</h4>
                    <p className="font-body-sm text-[12px] text-on-surface-variant">{ach.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-hud-code text-[11px] text-primary font-bold block">
                    +{ach.coinReward} 🪙
                  </span>
                  <span className="font-hud-code text-[10px] text-tertiary font-semibold">
                    {isCompleted ? 'UNLOCKED ✅' : `+${ach.xpReward} XP`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

