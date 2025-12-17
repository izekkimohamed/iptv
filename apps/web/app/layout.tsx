'use client';

import NavBar from '@/components/Navbar';
import Providers from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { useTauri } from '@/hooks/useTauri';
import { usePlayerStore } from '@/store/player-store';
import { invoke } from '@tauri-apps/api/core';
import { JetBrains_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import './globals.css';

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const { clearPlayer } = usePlayerStore();
  const { isDesktopApp } = useTauri();

  useEffect(() => {
    if (isDesktopApp) {
      invoke('close_splashscreen');
    }
  }, [isDesktopApp]);

  useEffect(() => {
    return () => {
      if (pathname !== '/channels') {
        clearPlayer();
      }
    };
  }, [pathname, clearPlayer]);

  return (
    <html lang="en">
      <Providers>
        <body className={`${jetBrainsMono.className} font-mono antialiased`}>
          <div
            className="flex flex-col h-screen font-mono bg-gradient-to-br from-slate-800 to-slate-900"
            style={{
              // backgroundImage:
              //   'linear-gradient(125.83deg, #392DD1 0%, #22B8CF 99.09%), linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay',
            }}
          >
            <div>
              <NavBar />
            </div>
            <>{children}</>
          </div>
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
