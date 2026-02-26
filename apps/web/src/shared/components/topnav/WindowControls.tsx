'use client';

import { Minus, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

async function quitApp() {
  await invoke('quit_app');
}

async function minimizeApp() {
  await invoke('minimize_app');
}

export function WindowControls() {
  return (
    <div className="mr-2 hidden items-center gap-2 lg:flex">
      <button
        onClick={quitApp}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600"
        aria-label="Close app"
      >
        <X className="h-3 w-3 text-white" />
      </button>
      <button
        onClick={minimizeApp}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 transition-colors hover:bg-yellow-600"
        aria-label="Minimize app"
      >
        <Minus className="h-3 w-3 text-white" />
      </button>
    </div>
  );
}
