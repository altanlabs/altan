import React from 'react';
import { Play } from 'lucide-react';
import { m } from 'framer-motion';

export const StatusBadge = ({ base, isPaused, metrics, onClick }) => {
  const containerBase =
    'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm self-start transition-all';
  const interactive = base ? 'cursor-pointer hover:shadow-lg' : 'opacity-50 cursor-not-allowed';
  const activeStyles =
    'bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 ring-1 ring-emerald-500/10';
  const pausedStyles =
    'bg-gradient-to-b from-red-500/10 to-red-500/5 border border-red-500/20 ring-1 ring-red-500/10';

  return (
    <m.div
      whileHover={base ? { scale: 1.05 } : {}}
      whileTap={base ? { scale: 0.98 } : {}}
      onClick={base ? onClick : undefined}
      className={`${containerBase} ${interactive} ${isPaused ? pausedStyles : activeStyles}`}
    >
      {isPaused ? (
        <Play
          size={16}
          className="text-red-500 flex-shrink-0"
        />
      ) : (
        <div className="relative w-2.5 h-2.5 flex-shrink-0">
          <div
            className={`absolute inset-0 rounded-full bg-emerald-500 ${base ? 'animate-pulse' : ''}`}
          />
          {base && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span
          className={`text-sm font-semibold ${isPaused ? 'text-red-500' : 'text-emerald-500'}`}
        >
          {isPaused ? 'Paused' : 'Active'}
        </span>
      </div>
    </m.div>
  );
};


