'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { soundManager } from '@/lib/audio';

const GAMES = [
  {
    id: 'rocket-rush',
    title: 'Rocket Rush',
    category: 'Racing',
    players: '2-8 Players',
    duration: '2-3 Mins',
    tag: 'HOT 🔥',
    tagColor: 'bg-secondary-container text-on-secondary-container',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDidoa5R--VzLMFJCgvp4ySoqxIbOX3pxv-rsoMavXSXvtIkO4OB_ZCGa0N8iOGpBeFi8rbXs8lguZMG0HQmJQoiH43ls9-edf5Lhj8mG2LiS9BCTUOJ0hhFmcuodqv5igyZ1IrG7D9stp80jYVKsQMUUm-zWChDCPCkC_aPnf5LA-Sjni3Fi5V_t4YO9dC26fvgK-ucl4g63pncVS6stabadAoWpCKibjq-w0FW7g',
    description: 'Real-time competitive sky racing through illuminated lantern skies and neon boost pads.',
    href: '/games/rocket-rush',
    icon: 'rocket_launch',
  },
  {
    id: 'fireworks',
    title: 'Fireworks Playground',
    category: 'Sandbox Co-op',
    players: '1-12 Players',
    duration: 'Endless',
    tag: 'SANDBOX ✨',
    tagColor: 'bg-primary-container text-on-primary-container',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBDho8VbCgbLXBV6J3y-ZCQFn_3_qw4aRgz7Ld2fcfWvRgcL4fyLJM1RQtJbUAKqG90tPkgQ1n6D5nWcLDSCrxRNStd8JXZnNmyijyg2FQ7e7flPWFmAIs3_OGHFbl53Yes6tAyjNaZUwUfhu2LDO65WAxCHcxaKyJXltCU5u9NRjWHKHXLUSYSc8UPk_12PNkdoCoZvS7k9aQVO8-u1x0Y-EBgu1nNn9S-7QODJiE',
    description: 'Craft customized multi-colored pyrotechnics and launch synchronized shows with friends.',
    href: '/games/fireworks',
    icon: 'flare',
  },
  {
    id: 'cracker-clash',
    title: 'Cracker Clash',
    category: 'Reaction Reflex',
    players: '2-4 Players',
    duration: '60 Secs',
    tag: '1V1 BLITZ ⚡',
    tagColor: 'bg-secondary-container/90 text-on-secondary-container',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAse4pe1ioC8lH_vCMMO7LpEMgU3vI8UiDWDY2Im85emMlQm96rht0Nxx1L9SI79-kCq2PBwH4q0YQ2nyMl9i4ZvR8-xHjL8uZn3VNK-ZLobMPaikflSBvT1W7hxktRlB9unKfSaSfuaETcbbC4jTO4xPt19Z3Wc8n1QgW3vsM8yS5Qh_xaz7D3zpaiz0dng44510mBMMEUd01CV-EaIkOVJ-fiHuN0OFcbD0Kwwac',
    description: 'Split-second tap reaction battle: ignite target firecrackers to build massive combo streaks.',
    href: '/games/cracker-clash',
    icon: 'sports_mma',
  },
  {
    id: 'rangoli',
    title: 'Rangoli Battle',
    category: 'Creative Art',
    players: '2-6 Players',
    duration: '3 Mins',
    tag: 'VOTING 🎨',
    tagColor: 'bg-tertiary-container text-on-tertiary-container',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDEB99GI1ySbpRKi13TRe9NDB0A62uH18wMf55cZeWwfUR5tfBwyMgiJt0yNer1KHuBUZEVjJVB61deV9YXcMaBGSMookg35d298-MmUk8LTHmZaM4bVjiZFSDthXCcoGsvzs-klA1l6WFzeC_QbaPO5wCF-7xfSY3kF3NxGqMFOEURzTiBDqYYS7CWD7__zcBJcpv-rdaTcD5iZMMFB4SuiHIp6xSY2K-8aRrRvNA',
    description: 'Draw glowing geometric mandala patterns with radiant pigments and vote for the best art.',
    href: '/games/rangoli',
    icon: 'draw',
  },
  {
    id: 'home-decorator',
    title: 'Co-op Diwali Haveli',
    category: 'Social Decorator',
    players: '2-4 Players',
    duration: 'Relaxed',
    tag: 'CHILL 🪔',
    tagColor: 'bg-primary-container text-on-primary-container',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAPdnp1Exgdm-PUfYOnGoY9Bkhdjt-PV8HW1I4HuiwpELsjWwoZMtpiOcE5Zo4K61LO8HIrdF7MXA6aXsYdEgLmEdcEQsi9hkRWcy62gfaxM73sQZbkFByiB1-o9heSBzLfhpCAVQqzoSlZqKqozEnDnQexZd6bCVIZYmMfMcZ_D2HZlPaRBqer2ti59QBVIV6zBDHk0DpT0PG2dg00LHynfLaaLQ75nJqsiz_5lFQ',
    description: 'Decorate historic courtyard havelis together with diyas, marigold torans, and fairy lights.',
    href: '/games/home-decorator',
    icon: 'cottage',
  },
  {
    id: 'diya-dash',
    title: 'Diya Dash',
    category: 'Endless Sprint',
    players: '2-8 Players',
    duration: '3 Mins',
    tag: 'SPRINT 🔥',
    tagColor: 'bg-secondary-container text-on-secondary-container',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHnV8-1CFNrETvBGkWxUqJMzLgGPcwZgdusgLS6Ekdg9PJeT5ckbE1m0WLccDH_PEY1Fm6FgBdXGtvlWpCFlkU4m5ThNYaGgVed6mC-mAXpE8MSVtkyCsp2WWmenmGC69t6Z-D5oY8u-aPGQoh6ZlJkVZ0bZqMrAq5yXllw6mI79Vyf6XfitOfEp4sL-Q4SOC-vD-LRHK_h0vLwYsSvgAxXkpHLl0CiMtv3Drv-YA',
    description: 'Keep the sacred flame burning through windy rooftop alleys and collect golden ghee pots.',
    href: '/games/diya-dash',
    icon: 'local_fire_department',
  },
];

export default function GamesHubPage() {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className="flex flex-col w-full px-margin-sm space-y-space-md max-w-4xl mx-auto pb-12 select-none">
      <div className="flex flex-col gap-1 pt-space-xs">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight font-extrabold uppercase">
          DIWALI ARCADE SUITE
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          6 real-time multiplayer Diwali games with single-player mode support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className="rounded-2xl bg-surface-container overflow-hidden shadow-lg border border-outline-variant/30 flex flex-col justify-between group hover:border-primary/50 transition-colors"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/30 to-transparent"></div>
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full font-hud-code text-[10px] font-extrabold ${game.tagColor}`}>
                  {game.tag}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high/90 text-tertiary font-hud-code text-[10px] font-bold">
                  {game.players}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold group-hover:text-primary transition-colors">
                  {game.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                  {game.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                <span className="font-hud-code text-[11px] text-tertiary font-bold">{game.category}</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/multiplayer/room/${game.id}-party?game=${game.id}`}
                    onClick={() => soundManager.playClick()}
                    className="h-10 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm font-semibold flex items-center gap-1 border border-outline-variant/30 active:scale-95 transition-transform"
                  >
                    <span>Squad Lobby</span>
                  </Link>
                  <Link
                    href={game.href}
                    onClick={() => soundManager.playClick()}
                    className="h-10 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
                  >
                    <span>Play</span>
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

