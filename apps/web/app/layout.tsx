'use client';

import './globals.css';

import { invoke } from '@tauri-apps/api/core';
import { JetBrains_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { type ReactNode, Suspense, useEffect } from 'react';

import NavBar from '@/components/Navbar';
import Providers from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { useTauri } from '@/hooks/useTauri';
import { usePlayerStore } from '@/store/player-store';

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
            className="flex h-screen flex-col bg-linear-to-br from-[#030023] to-[#182848] font-mono"
            style={
              {
                // backgroundImage: 'radial-gradient(circle at center top, #182848 0%, #030023 100%)',
                // backgroundImage: 'linear-gradient(90deg, #182848 0%, #030023 100%)',
              }
            }
          >
            <div>
              <NavBar />
            </div>
            <Suspense>{children}</Suspense>
          </div>
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
