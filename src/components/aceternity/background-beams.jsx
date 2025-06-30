import React, { useEffect, useRef } from 'react';

import { cn } from '@lib/utils';

const BackgroundBeams = ({ className }) => {
  const beamRef = useRef(null);

  useEffect(() => {
    if (!beamRef.current) return;

    const updateMousePosition = (ev) => {
      if (!beamRef.current) return;
      const { clientX, clientY } = ev;
      beamRef.current.style.setProperty('--x', `${clientX}px`);
      beamRef.current.style.setProperty('--y', `${clientY}px`);
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <div
      ref={beamRef}
      className={cn('absolute inset-0 overflow-hidden', className)}
    >
      <div className="relative h-full w-full">
        {/* Beam container */}
        <div className="absolute inset-0 z-0">
          {/* Beams */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rotate-45 bg-gradient-to-r from-violet-500/40 to-purple-500/40 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rotate-12 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-3xl" />

          {/* Moving beam */}
          <div
            className="absolute opacity-50 from-blue-500 to-violet-500 [--x:0px] [--y:0px] h-32 w-32 rounded-full bg-gradient-to-br blur-3xl"
            style={{
              transform: 'translate(calc(var(--x) - 50%), calc(var(--y) - 50%))',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* Noise texture */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20" />
      </div>
    </div>
  );
};

export { BackgroundBeams };
