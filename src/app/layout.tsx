import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'DIWALIverse — Multiplayer Arcade Platform',
  description:
    'Real-time multiplayer Diwali arcade platform featuring Rocket Rush, Fireworks Playground, Cracker Clash, Rangoli Battle, and Co-op Diwali House.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#131319',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container antialiased">
        <Header />
        <main className="flex-1 flex flex-col relative w-full pt-16 pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

