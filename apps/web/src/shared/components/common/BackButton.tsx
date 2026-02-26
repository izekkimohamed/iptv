'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface BackButtonProps {
  onBack: () => void;
}

export function BackButton({ onBack }: BackButtonProps) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300">
      <Button
        onClick={onBack}
        variant="ghost"
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/20 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:pr-5 active:scale-95"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Button>
    </div>
  );
}
