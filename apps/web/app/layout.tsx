'use client';

import './globals.css';

import { invoke } from '@tauri-apps/api/core';
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { type ReactNode, Suspense, useEffect } from 'react';

import Providers from '@/components/providers';
import Sidebar from '@/components/Sidebar';
import { Toaster } from '@/components/ui/sonner';
import { useTauri } from '@/hooks/useTauri';
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

  return (
    <html lang="en">
      <Providers>
        <body
          className={`${outfit.variable} ${inter.variable} ${jetBrainsMono.variable} font-mono antialiased`}
        >
          <div className="relative flex h-screen w-full overflow-hidden bg-background text-foreground">
            {/* Background Gradient */}
            <div className="pointer-events-none fixed inset-0 z-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_oklch(0.2_0.05_260_/_0.15)_0%,_transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_oklch(0.2_0.05_260_/_0.15)_0%,_transparent_50%)]" />
            </div>

            <Sidebar />


            <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
              <main className="flex-1 overflow-hidden">
                <Suspense>{children}</Suspense>
              </main>
            </div>
          </div>
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}

