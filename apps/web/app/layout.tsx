"use client";

import NavBar from "@/components/Navbar";
import Providers from "@/components/providers";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Suspense, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlayerStore } from "@/store/player-store";
import { usePathname } from "next/navigation";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { toggleFullScreen, fullScreen, clearPlayer } = usePlayerStore();
  const pathname = usePathname();
  useEffect(() => {
    invoke("close_splashscreen");
  }, []);

  useEffect(() => {
    //add F key eventListner Golbaly to toggle full screen
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "f" || event.key === "F") {
        toggleFullScreen(!fullScreen);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [fullScreen]);

  useEffect(() => {
    return () => {
      if (pathname !== "/channels") {
        clearPlayer();
      }
    };
  }, [pathname, clearPlayer]);

  return (
    <html lang='en'>
      <Providers>
        <body className={`${jetBrainsMono.className} font-mono antialiased`}>
          {/* linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); */}
          <div className='flex flex-col h-screen font-mono bg-gradient-to-b from-slate-900 to-slate-950'>
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
