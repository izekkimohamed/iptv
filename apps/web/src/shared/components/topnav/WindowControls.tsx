'use client';

import { invoke } from '@tauri-apps/api/core';
import { Minus, X } from 'lucide-react';

async function quitApp() {
  await invoke('quit_app');
}

async function minimizeApp() {
  await invoke('minimize_app');
}

export function WindowControls() {
  return (
    <div className="mr-2 hidden items-center gap-1.5 lg:flex">
      <button
        onClick={minimizeApp}
        className="group flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-yellow-500/10 transition-all duration-150 hover:bg-yellow-500"
        aria-label="Minimize app"
      >
        <Minus className="h-3 w-3 text-yellow-500 transition-colors group-hover:text-black" />
      </button>
      <button
        onClick={quitApp}
        className="group flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-rose-500/10 transition-all duration-150 hover:bg-rose-500"
        aria-label="Close app"
      >
        <X className="h-3 w-3 text-rose-500 transition-colors group-hover:text-white" />
      </button>
    </div>
  );
}
