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
import { usePlayerStore } from '@repo/store';

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
            // style={{
            //   background: 'radial-gradient(0% 80% at 101.61% 76.99%, #2D0264 0%, #030023 100%);',
            // }}
            className="flex h-screen flex-col overflow-hidden bg-[#030023] font-mono"
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
