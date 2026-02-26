'use client';

import './globals.css';

import { invoke } from '@tauri-apps/api/core';
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { type ReactNode, Suspense, useEffect } from 'react';

import ErrorBoundary from '@/shared/components/common/ErrorBoundary';
import Providers from '@/shared/components/providers';
import TopNav from '@/shared/components/TopNav';
import { Toaster } from '@/shared/components/ui/sonner';
import { useTauri } from '@/shared/hooks/useTauri';
import { usePlayerStore } from '@repo/store';

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable)
        return;

      if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        window.history.forward();
      } else if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        window.history.back();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <html lang="en">
      <Providers>
        <body
          className={`${outfit.variable} ${inter.variable} ${jetBrainsMono.variable} font-mono antialiased`}
        >
          <TopNav />
          <div className="bg-background text-foreground flex h-screen flex-col pt-16">
            <main className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <Suspense>{children}</Suspense>
              </ErrorBoundary>
            </main>
          </div>
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
