import { Globe } from 'lucide-react';

export function SettingsHeader() {
  return (
    <header className="flex flex-col gap-2 border-b border-white/5 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Streams<span className="text-primary">.</span>
        </h1>
        <p className="flex items-center gap-2 text-sm font-medium text-neutral-400">
          <Globe className="h-4 w-4 text-primary" />
          Global Content Delivery Network
        </p>
      </div>
    </header>
  );
}
