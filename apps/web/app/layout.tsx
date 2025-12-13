'use client';

import NavBar from '@/components/Navbar';
import Providers from '@/components/providers';
import { usePlayerStore } from '@/store/player-store';
import { invoke } from '@tauri-apps/api/core';
import { JetBrains_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import './globals.css';

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { toggleFullScreen, fullScreen, clearPlayer } = usePlayerStore();
  const pathname = usePathname();
  useEffect(() => {
    invoke('close_splashscreen');
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'f' || event.key === 'F') {
        toggleFullScreen(!fullScreen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fullScreen]);

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
            <Suspense>{children}</Suspense>
          </div>
        </body>
      </Providers>
    </html>
  );
}
