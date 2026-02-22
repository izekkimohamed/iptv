import React, { forwardRef } from 'react';

const ProgressBar = forwardRef<
  HTMLDivElement,
  {
    duration: number;
    bufferedEnd: number;
    currentTime: number;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  }
>(({ duration, bufferedEnd, currentTime, onClick }, ref) => {
  return (
    <div className="flex-1">
      <div
        ref={ref}
        onClick={onClick}
        style={{
          height: 4,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          cursor: 'pointer',
          position: 'relative',
          transition: 'height 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.height = '6px')}
        onMouseLeave={(e) => (e.currentTarget.style.height = '4px')}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${duration ? (bufferedEnd / duration) * 100 : 0}%`,
            background: 'rgba(255,255,255,0.35)',
            borderRadius: 2,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            background: '#e50914',
            borderRadius: 2,
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${duration ? (currentTime / duration) * 100 : 0}%`,
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#e50914',
            boxShadow: '0 0 4px rgba(229,9,20,0.8)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
});

export default ProgressBar;
