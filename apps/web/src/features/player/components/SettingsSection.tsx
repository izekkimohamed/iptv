import { cn } from '@/shared/lib/utils';
import { memo } from 'react';

const SettingsSection = memo(function SettingsSection({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 font-mono text-xs font-medium uppercase tracking-widest text-white/45">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onSelect(o)}
            className={cn(
              'rounded px-2.5 py-1 font-mono text-xs transition-all duration-150',
              selected === o
                ? 'border border-primary bg-primary/20 text-white'
                : 'border border-white/15 bg-transparent text-white/60 hover:border-white/25 hover:text-white'
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
});

export default SettingsSection;
