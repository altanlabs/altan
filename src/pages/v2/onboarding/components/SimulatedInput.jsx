import { m } from 'framer-motion';
import React, { memo } from 'react';

import { useAudio } from '../hooks/useAudio';

const SimulatedInput = ({ value, displayValue, isComplete, showPulse, audioFile = null }) => {
  // Play audio when typing starts
  useAudio(audioFile, !!audioFile, null);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        {/* Input field */}
        <div className="bg-[#1F2023] border-2 border-gray-700 rounded-2xl px-6 py-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex-1 text-white text-lg">
              {displayValue || value}
              {!isComplete && (
                <m.span
                  className="inline-block w-0.5 h-5 bg-white ml-1 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>

            {/* Send button */}
            <div className="relative">
              {showPulse && (
                <m.div
                  className="absolute inset-0 rounded-full bg-white/40 blur-lg"
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  style={{ width: '48px', height: '48px', left: '-8px', top: '-8px' }}
                />
              )}
              <m.button
                animate={showPulse ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </m.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SimulatedInput);

