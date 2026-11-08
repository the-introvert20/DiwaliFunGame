'use client';

import React, { useState, useEffect } from 'react';
import { soundManager } from '@/lib/audio';
import { getPlayerProfile, savePlayerProfile } from '@/lib/storage';
import { PlayerProfile } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAdj1BnJOeIpu27ZMjRTJHTNqx8S-X8TrpcufbFpCPEiQ8yfPCGa2H8ujHRsHV0879F6XctnS1u84B_QkUlc1zKUHQekmr2a7U-ijp3ngl2Rgqo4E3zPj7gtVByeEE-lENcIL5i8UQ-1gYwOFWx2qKBi0suT8BpvQlbc0Mko8WNIoa_iG2IW_iXeZSVVPVbWIOJ6sUE-L5j4vga7oI_PUYfszekHIRlvrO3ymjkUoY', // Rohan
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg31mhbZO8yZlKywmVwHjFyQ_hoHR5ZTtoXALxkRvj05RmTKm8ZEPFdTT_3g-n_iFvLjJF-WIsqXOQb9MS5crCylDgq0oiyTtdf_H35sxlmR7hCspZ0hBd7erB79xVahFCdj69aVAJXcgRI8DVLDzs5ylK_niE5vvdWeVBAij4f2heGLbEsK55ucjaWM-0lU8t6lpxXC6X0jwAOy0DPEIw4f8l_ntDIWqKIBqOR60', // Aarav
  'https://lh3.googleusercontent.com/aida-public/AB6AXuATL6hJvjH-d9ff9n-JNzouBTs4VBwAjD0T1x_UpHR_A5u8mqMnh97txQab3-evrTPLtmK2ItUu42iaLa6g_GOJFjYr7y1zX20W66FBLrHBeDL1499IkoP3zDUrVudBE4uZiAvwvRdeRjcTI-7GmH9DUekBi9JxTyaB-9S6vWlAhpYq23xqW6VVKejqi7ey6lXkEd6TWxfBZl_uUWMdcEiFK0ToCBb5X3vsoyPenJM', // Priya
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCV8g-rZKA0F7xKisz33-lYFnCO-HeZpIbCGFpCGhNIznjoyVW7BK9FwOzAIQmxf17ebBqCwm5U1IBc04ZYRctscfsMxiFkKMurSrsFThtiAM7MRQ1QdF_HrerhuIYmP845A33FvNwKgDYCV9TXFhaEaJiVJ2Pw39wYxdSHGaC3H8mrzlF9IhoNIy4S8Hiu8w-nvDpy1ogwsensPA7TL_-H8hvGaWguKqYGierioiw', // Shanaya
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBYKRgz_lN8oz0GU1GQezQE7QG3_Dq5ffPqHXa1iEPTBcP_4TRUWHOi2VCG-mnC5zhHvwIJchjc4LK5Rax9yt_RT2ifWQ7-K8cqQopgNGO9ZdxjrPtHBN5bh_UwykywgIQsSGnFJrb9okLhC_E01jiWLNH0OnEBEoxPK5BgpUUGoJi5wqurD0NqgFPO58t2BxB81Kksqq6gNCzGdiIBgyB3wI1LfFeT2ZKhyJfxD8k', // Kabir
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    const p = getPlayerProfile();
    setProfile(p);
    setUsernameInput(p.username);
  }, []);

  const handleSaveUsername = () => {
    if (!profile || !usernameInput.trim()) return;
    soundManager.playClick();
    const updated = {
      ...profile,
      username: usernameInput.trim(),
    };
    savePlayerProfile(updated);
    setProfile(updated);
    setIsEditing(false);
  };

  const handleSelectAvatar = (url: string) => {
    if (!profile) return;
    soundManager.playClick();
    const updated = {
      ...profile,
      avatar: url,
    };
    savePlayerProfile(updated);
    setProfile(updated);
  };

  const handleLinkAccount = async () => {
    soundManager.playClick();
    if (!authEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setAuthNotice(
        `Guest progress saved locally! To enable cloud authentication, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.`
      );
      return;
    }

    try {
      setAuthNotice('Sending magic link to email...');
      const { error } = await supabase.auth.signInWithOtp({
        email: authEmail,
      });
      if (error) throw error;
      setAuthNotice(`Magic sign-in link dispatched to ${authEmail}!`);
    } catch (err: any) {
      setAuthNotice(`Auth status: ${err.message || 'Could not connect to Supabase'}`);
    }
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-xl mx-auto pb-12 select-none">
      {/* Profile Header Card */}
      <div className="rounded-2xl bg-surface-container p-5 shadow-xl border border-outline-variant/30 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative mb-3">
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary shadow-lg"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-mint rounded-full ring-2 ring-surface"></span>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 mb-1">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="bg-surface-container-high px-3 py-1 rounded-lg text-primary font-bold text-center border border-primary/50 focus:outline-none"
              maxLength={16}
            />
            <button
              onClick={handleSaveUsername}
              className="px-3 py-1 bg-primary text-on-primary rounded-lg font-bold text-[12px]"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">{profile.username}</h2>
            <button
              onClick={() => setIsEditing(true)}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-hud-code text-[11px] font-bold">
            LEVEL {profile.level}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-hud-code text-[11px] font-extrabold">
            🪙 {profile.coins.toLocaleString()} COINS
          </span>
        </div>

        {/* Level XP Progress Meter */}
        <div className="w-full mt-4 space-y-1">
          <div className="flex justify-between font-hud-code text-[11px] text-on-surface-variant">
            <span>Experience to Level {profile.level + 1}</span>
            <span className="text-tertiary font-bold">
              {profile.xp}/{profile.xpToNextLevel} XP
            </span>
          </div>
          <div className="w-full bg-surface-container-lowest h-2.5 rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
            <div
              className="h-full rounded-full bg-tertiary"
              style={{ width: `${(profile.xp / profile.xpToNextLevel) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Choose Avatar */}
      <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 space-y-2">
        <span className="font-label-md font-bold text-on-surface block">Choose Festive Avatar</span>
        <div className="flex items-center justify-between">
          {AVATARS.map((url, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAvatar(url)}
              className={`rounded-full p-0.5 transition-transform active:scale-95 ${
                profile.avatar === url ? 'ring-3 ring-primary scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`Avatar ${idx}`} className="w-11 h-11 rounded-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Match Statistics */}
      <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 space-y-3">
        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Arcade Career Stats</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
            <span className="font-hud-code text-[10px] text-outline uppercase block font-semibold">Rocket Wins</span>
            <span className="font-hud-metric text-[16px] text-primary font-bold">
              {profile.stats.rocketRushWins}
            </span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
            <span className="font-hud-code text-[10px] text-outline uppercase block font-semibold">Fireworks</span>
            <span className="font-hud-metric text-[16px] text-tertiary font-bold">
              {profile.stats.fireworksCrafted}
            </span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
            <span className="font-hud-code text-[10px] text-outline uppercase block font-semibold">Diyas Lit</span>
            <span className="font-hud-metric text-[16px] text-secondary font-bold">
              {profile.stats.diyasLit}
            </span>
          </div>
        </div>
      </div>

      {/* Supabase Safe Account Linking */}
      <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">cloud_sync</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Link Account (Save to Cloud)</h3>
        </div>
        <p className="font-body-sm text-[12px] text-on-surface-variant">
          Connect your email to retain guest progression, unlocked skins, and trophies across multiple devices.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            placeholder="pilot@diwaliverse.gg"
            className="flex-1 bg-surface-container-lowest px-3 py-2 rounded-lg text-[13px] text-on-surface placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleLinkAccount}
            className="h-10 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold text-[13px]"
          >
            Link
          </button>
        </div>

        {authNotice && (
          <p className="font-body-sm text-[11px] text-tertiary bg-surface-container-high p-2 rounded-lg border border-tertiary/20">
            {authNotice}
          </p>
        )}
      </div>
    </div>
  );
}

