'use client';

import NavBar from '@/components/Navbar';
import Providers from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { useTauri } from '@/hooks/useTauri';
import { usePlayerStore } from '@/store/player-store';
import { invoke } from '@tauri-apps/api/core';
import { JetBrains_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, type ReactNode } from 'react';
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
            className="flex flex-col h-screen font-mono bg-linear-to-br to-[#182848] from-[#030023]"
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
