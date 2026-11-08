// DIWALIverse Player Identity and Persistent Progression Engine
import { PlayerProfile, Achievement, InventoryItem } from '@/types';

const STORAGE_KEY = 'diwaliverse_player_profile';

const DEFAULT_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAdj1BnJOeIpu27ZMjRTJHTNqx8S-X8TrpcufbFpCPEiQ8yfPCGa2H8ujHRsHV0879F6XctnS1u84B_QkUlc1zKUHQekmr2a7U-ijp3ngl2Rgqo4E3zPj7gtVByeEE-lENcIL5i8UQ-1gYwOFWx2qKBi0suT8BpvQlbc0Mko8WNIoa_iG2IW_iXeZSVVPVbWIOJ6sUE-L5j4vga7oI_PUYfszekHIRlvrO3ymjkUoY', // Rohan
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg31mhbZO8yZlKywmVwHjFyQ_hoHR5ZTtoXALxkRvj05RmTKm8ZEPFdTT_3g-n_iFvLjJF-WIsqXOQb9MS5crCylDgq0oiyTtdf_H35sxlmR7hCspZ0hBd7erB79xVahFCdj69aVAJXcgRI8DVLDzs5ylK_niE5vvdWeVBAij4f2heGLbEsK55ucjaWM-0lU8t6lpxXC6X0jwAOy0DPEIw4f8l_ntDIWqKIBqOR60', // Aarav
  'https://lh3.googleusercontent.com/aida-public/AB6AXuATL6hJvjH-d9ff9n-JNzouBTs4VBwAjD0T1x_UpHR_A5u8mqMnh97txQab3-evrTPLtmK2ItUu42iaLa6g_GOJFjYr7y1zX20W66FBLrHBeDL1499IkoP3zDUrVudBE4uZiAvwvRdeRjcTI-7GmH9DUekBi9JxTyaB-9S6vWlAhpYq23xqW6VVKejqi7ey6lXkEd6TWxfBZl_uUWMdcEiFK0ToCBb5X3vsoyPenJM', // Priya
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCV8g-rZKA0F7xKisz33-lYFnCO-HeZpIbCGFpCGhNIznjoyVW7BK9FwOzAIQmxf17ebBqCwm5U1IBc04ZYRctscfsMxiFkKMurSrsFThtiAM7MRQ1QdF_HrerhuIYmP845A33FvNwKgDYCV9TXFhaEaJiVJ2Pw39wYxdSHGaC3H8mrzlF9IhoNIy4S8Hiu8w-nvDpy1ogwsensPA7TL_-H8hvGaWguKqYGierioiw', // Shanaya
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBYKRgz_lN8oz0GU1GQezQE7QG3_Dq5ffPqHXa1iEPTBcP_4TRUWHOi2VCG-mnC5zhHvwIJchjc4LK5Rax9yt_RT2ifWQ7-K8cqQopgNGO9ZdxjrPtHBN5bh_UwykywgIQsSGnFJrb9okLhC_E01jiWLNH0OnEBEoxPK5BgpUUGoJi5wqurD0NqgFPO58t2BxB81Kksqq6gNCzGdiIBgyB3wI1LfFeT2ZKhyJfxD8k', // Kabir
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_race',
    title: 'Festival Ignition',
    description: 'Complete your first Rocket Rush race',
    icon: 'rocket_launch',
    coinReward: 200,
    xpReward: 150,
  },
  {
    id: 'diya_lighter',
    title: 'Light of Ayodhya',
    description: 'Light 50 diyas across all festival games',
    icon: 'local_fire_department',
    coinReward: 300,
    xpReward: 250,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'firework_master',
    title: 'Celestial Pyrotechnic',
    description: 'Launch 25 fireworks in the Fireworks Playground',
    icon: 'flare',
    coinReward: 250,
    xpReward: 200,
    progress: 0,
    maxProgress: 25,
  },
  {
    id: 'cracker_champ',
    title: 'Thunder Striker',
    description: 'Score a 10x combo in Cracker Clash',
    icon: 'bolt',
    coinReward: 400,
    xpReward: 350,
  },
  {
    id: 'rangoli_artist',
    title: 'Mandala Sovereign',
    description: 'Create and submit a Rangoli masterpiece',
    icon: 'draw',
    coinReward: 350,
    xpReward: 300,
  },
];

export const INITIAL_SHOP_ITEMS: InventoryItem[] = [
  {
    id: 'skin_saffron_comet',
    name: 'Saffron Comet',
    category: 'rocket_skin',
    rarity: 'rare',
    icon: 'rocket_launch',
    priceCoins: 500,
    unlocked: true,
  },
  {
    id: 'skin_electric_chakra',
    name: 'Electric Chakra',
    category: 'rocket_skin',
    rarity: 'epic',
    icon: 'bolt',
    priceCoins: 1200,
    unlocked: false,
  },
  {
    id: 'skin_golden_diya',
    name: 'Golden Diya Cruiser',
    category: 'rocket_skin',
    rarity: 'legendary',
    icon: 'military_tech',
    priceCoins: 2500,
    unlocked: false,
  },
  {
    id: 'trail_marigold_spark',
    name: 'Marigold Sparkler Trail',
    category: 'sparkler_trail',
    rarity: 'rare',
    icon: 'flare',
    priceCoins: 600,
    unlocked: true,
  },
  {
    id: 'trail_neon_cyan',
    name: 'Cyan Lightning Trail',
    category: 'sparkler_trail',
    rarity: 'epic',
    icon: 'auto_awesome',
    priceCoins: 1500,
    unlocked: false,
  },
];

export function generateGuestProfile(): PlayerProfile {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: guestId,
    isGuest: true,
    username: `Racer_${randomSuffix}`,
    avatar: randomAvatar,
    level: 1,
    xp: 0,
    xpToNextLevel: 500,
    coins: 1000, // Welcome festive gift
    selectedSkin: 'skin_saffron_comet',
    createdAt: new Date().toISOString(),
    stats: {
      matchesPlayed: 0,
      matchesWon: 0,
      rocketRushWins: 0,
      fireworksCrafted: 0,
      crackerClashStreak: 0,
      rangoliStars: 0,
      diyasLit: 0,
    },
    achievements: [],
    inventory: ['skin_saffron_comet', 'trail_marigold_spark'],
  };
}

export function getPlayerProfile(): PlayerProfile {
  if (typeof window === 'undefined') {
    return generateGuestProfile();
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure required properties exist
      if (!parsed.stats) parsed.stats = generateGuestProfile().stats;
      if (!parsed.inventory) parsed.inventory = ['skin_saffron_comet'];
      if (!parsed.achievements) parsed.achievements = [];
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse player profile from localStorage', err);
  }

  const newProfile = generateGuestProfile();
  savePlayerProfile(newProfile);
  return newProfile;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save player profile', err);
  }
}

export function addPlayerProgress(
  xpGained: number,
  coinsGained: number,
  statUpdates?: Partial<PlayerProfile['stats']>
): { profile: PlayerProfile; leveledUp: boolean } {
  const profile = getPlayerProfile();
  let leveledUp = false;

  profile.xp += xpGained;
  profile.coins += coinsGained;

  // Level calculation: Each level needs level * 500 XP
  while (profile.xp >= profile.xpToNextLevel) {
    profile.xp -= profile.xpToNextLevel;
    profile.level += 1;
    profile.xpToNextLevel = profile.level * 500;
    profile.coins += 250; // Level-up bonus
    leveledUp = true;
  }

  if (statUpdates) {
    profile.stats = {
      ...profile.stats,
      ...statUpdates,
    };
  }

  savePlayerProfile(profile);
  return { profile, leveledUp };
}

export function unlockAchievement(achievementId: string): { unlocked: boolean; achievement?: Achievement } {
  const profile = getPlayerProfile();
  if (profile.achievements.includes(achievementId)) {
    return { unlocked: false };
  }

  const achievement = INITIAL_ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return { unlocked: false };

  profile.achievements.push(achievementId);
  profile.coins += achievement.coinReward;
  profile.xp += achievement.xpReward;
  savePlayerProfile(profile);

  return { unlocked: true, achievement };
}

