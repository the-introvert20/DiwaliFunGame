# 🪔 DIWALIverse — Complete Real-Time Multiplayer Diwali Arcade

> **The Premier Festive Cyber-Arcade Platform for Diwali.**  
> Built from approved Google Stitch UI designs into a high-performance, real-time multiplayer gaming portal.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Colyseus](https://img.shields.io/badge/Colyseus-0.18-orange)](https://colyseus.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)

---

## 🌟 Highlights & Architecture

DIWALIverse brings the light, sound, and camaraderie of Diwali to the web with zero-compromise real-time multiplayer, responsive tactile touch controls, and cyber-festive aesthetics.

- **Visual Source of Truth**: Faithfully implemented from Google Stitch designs (`#131319` Deep Midnight, `#e8a33c` Saffron Gold, `#00e1ef` Electric Cyan, `#f26419` Sunset Orange).
- **Server-Authoritative Real-Time Multiplayer**: Built with **Colyseus 0.18** + WebSockets, running dedicated game rooms with state synchronization, input rate limiting, collision resolution, and reconnect handling.
- **Instant Guest Identity & Cloud Progression**: Immediate play as a guest (`Deepak#4819`) with local XP/coin persistence, seamlessly upgradable to Supabase Auth without losing progress.
- **Universal Audio Engine**: Zero-asset latency Web Audio API procedural synthesizer + Howler.js for rocket whooshes, firework explosions, countdown beeps, boost turbos, and festive raga ambient drones.
- **Mobile-First Touch & Desktop Controls**: Responsive HUDs with 44px+ touch targets, virtual steering & boost pedals for mobile racers, plus full keyboard (WASD / Arrows / Space) support.

---

## 🎮 The Arcade Games

| Route | Game Mode | Capacity | Description |
|---|---|---|---|
| `/games/rocket-rush` | **Rocket Rush** | 2–8 Players | High-speed Diwali skyway rocket racing with steering lerp, boost pads, floating lanterns, diya gates, live ranking, and lap timers. |
| `/games/fireworks` | **Fireworks Showdown** | Up to 6 Players | Synchronized night sky fireworks playground with Anar fountains, Chakri spinners, Sky Rockets, multi-burst mortars, and audience applause. |
| `/games/cracker-clash` | **Cracker Clash** | 2–4 Players | 60-second twitch-reaction reflex game with rapid target popping, combo multipliers (up to 3x), and festive particle bursts. |
| `/games/rangoli` | **Rangoli Battle** | 2–6 Players | Mandala art canvas with 4-fold and 8-fold radial symmetry, neon pigments, stroke width controls, and community submissions. |
| `/games/home-decorator` | **Co-op Diwali House**| 2–4 Players | Interactive courtyard decorator with movable brass diyas, hanging akash kandils, marigold garlands, and ambient light toggles. |
| `/games/diya-dash` | **Diya Dash** | 2–8 Players | Rooftop obstacle runner where you jump across Varanasi terraces collecting mustard oil & ghee lamps to keep the flame alive. |

---

## 🗺️ Application Routes

All routes are fully implemented and navigable:

- `/` — **Home Arcade**: Live marquee ticker, hero quick play CTA, active squad carousel, tournament countdown, 6-card game grid, daily quests, and champion podium.
- `/games` — **Arcade Hub**: Full catalog of all 6 games with filter tabs, player count tags, and instant single/multiplayer launching.
- `/multiplayer` — **Multiplayer Matchmaker**: Quick Match, PIN room code joiner, telemetry stats bar, and live public room lobby browser.
- `/multiplayer/room/[roomId]` — **Private Squad Lobby**: 4-player squad roster, host controls, ready-check toggles, room PIN copy/share, live squad comms chat, and launch ignition.
- `/tournaments` — **Maha Diwali Cup**: Tournament browser, interactive knockout bracket visualizer (Quarterfinals, Semifinals, Finals), prize pool breakdown, and bracket registration.
- `/leaderboards` — **Global Standings**: Global, Weekly, and Friends leaderboards with top-3 podium and light-rail rankings.
- `/collection` — **Festive Armory**: Rocket skin customizer (Saffron Comet, Surya Chariot, Royal Peacock), sparkler trails, coins shop, and achievement tracker.
- `/profile` — **Player Profile**: Guest username editor, avatar selector, player level & XP bar, match history, and Supabase cloud account linking.
- `/festival` — **Festival Corner**: Community global diya lighting counter, festive ambient raga player, and customizable Diwali greeting card generator.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, Server & Client Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Stitch tokens (`saffron`, `diwali-gold`, `midnight`, `diwali-cyan`, `rangoli-pink`)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) & [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Graphics**: HTML5 2D/3D Canvas with particle systems
- **Audio**: Web Audio API procedural synthesis + [Howler.js](https://howlerjs.com/)

### Multiplayer Game Server
- **Server**: [Colyseus 0.18](https://colyseus.io/)
- **Transport**: `@colyseus/ws-transport` (WebSockets)
- **State Serialization**: `@colyseus/schema`
- **HTTP Layer**: Express.js with CORS and JSON endpoints

### Backend & Database
- **Database**: [Supabase](https://supabase.com/) PostgreSQL with Row-Level Security (RLS)
- **Auth**: Supabase Auth (Email / Password / OAuth)
- **Schema**: Full SQL migrations in `supabase/schema.sql` (`profiles`, `friendships`, `match_history`, `match_players`, `leaderboard_entries`, `achievements`, `player_inventory`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Installation
Clone the repository and install dependencies for both the frontend and game server:

```bash
# Install frontend dependencies
npm install

# Install game server dependencies
cd server
npm install
cd ..
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Optional Supabase integration (Guest mode functions fully without these)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Colyseus Game Server URL (defaults to ws://localhost:2567 if omitted)
NEXT_PUBLIC_GAME_SERVER_URL=ws://localhost:2567
```

### 3. Running Locally

You can run both the game server and the frontend concurrently:

```bash
# Terminal 1: Run Colyseus Game Server (port 2567)
npm run server

# Terminal 2: Run Next.js Frontend (port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Automated test suites verify game logic, XP reward engine, room code generation, physics simulation, and server health:

```bash
npm test
```

Test coverage includes:
- **Level & XP progression math**: Verification of level milestones and overflow carry.
- **Room Code format**: Validates `DW-XXXX` room PIN formatting and uniqueness.
- **Rocket Rush collision simulation**: Server-side bounding box collision detection and boost math.
- **Cracker Clash multipliers**: Rapid-tap combo streaks and multiplier caps.
- **Server Health**: Express and Colyseus WebSocket lifecycle and API endpoints.

---

## 🗄️ Supabase Setup (Optional Cloud Storage)

To connect Supabase:
1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the entire contents of `supabase/schema.sql`.
4. Copy your project URL and anon public key to `.env.local`.

---

## 🚢 Deployment

### 1. Frontend (Vercel)
- Push code to GitHub/GitLab.
- Import repository into [Vercel](https://vercel.com).
- Set Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GAME_SERVER_URL`).
- Deploy!

### 2. Multiplayer Server (Railway / Render / Fly.io)
The `server/` directory is completely standalone and independently deployable:
- Root directory for deployment: `server`
- Build command: `npm run build`
- Start command: `node dist/index.js`
- Exposed Port: `2567` (or `PORT` environment variable)

---

## 📄 License
MIT © 2026 DIWALIverse Arcade Team. Made with festive joy for Diwali.

