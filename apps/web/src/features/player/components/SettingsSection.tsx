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
      <div
        style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 8,
          fontFamily: 'monospace',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onSelect(o)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              border: '1px solid',
              borderColor: selected === o ? '#e50914' : 'rgba(255,255,255,0.15)',
              background: selected === o ? 'rgba(229,9,20,0.2)' : 'transparent',
              color: selected === o ? '#fff' : 'rgba(255,255,255,0.6)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'monospace',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
});

export default SettingsSection;
