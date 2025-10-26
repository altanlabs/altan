import { m, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, memo } from 'react';

import SphereImageGrid from '../../../../components/elevenlabs/image-sphere';
import { TextGenerateEffect } from '../../../../components/elevenlabs/ui/text-generate-effect';
import { TEAM_AGENTS } from '../mockData';

const Scene1_Welcome = ({ onPathSelect }) => {
  const [step, setStep] = useState(1);

  // Auto-advance through steps
  useEffect(() => {
    let timer;
    if (step === 1) {
      timer = setTimeout(() => setStep(2), 3500);
    } else if (step === 2) {
      timer = setTimeout(() => setStep(3), 4000);
    } else if (step === 3) {
      timer = setTimeout(() => setStep(4), 4000);
    }
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between px-6 pt-12 pb-12">
      {/* Top Content Container */}
      <div className="w-full flex-1 flex flex-col items-center">
        {step >= 1 && (
          <div className="relative w-full max-w-6xl">
            {/* 3D Agent Sphere - Absolutely positioned at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ pointerEvents: 'auto' }}>
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <SphereImageGrid
                  images={TEAM_AGENTS}
                  containerSize={Math.min(450, typeof window !== 'undefined' ? window.innerWidth - 100 : 450)}
                  sphereRadius={160}
                  autoRotate={true}
                  autoRotateSpeed={0.15}
                  dragSensitivity={0.5}
                  baseImageScale={0.16}
                />
              </m.div>
            </div>

            {/* Messages Container - Fixed position below sphere */}
            <div className="absolute left-0 right-0 w-full max-w-4xl mx-auto" style={{ top: '480px' }}>
              <AnimatePresence mode="wait">
                {/* Message 1 - No avatar */}
                {step === 1 && (
                  <m.div
                    key="msg1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                  >
                    <div className="text-5xl sm:text-6xl md:text-7xl font-bold">
                      <TextGenerateEffect
                        words="Welcome. We're Altan."
                        duration={0.5}
                      />
                    </div>
                  </m.div>
                )}

                {/* Message 2 - No avatar */}
                {step === 2 && (
                  <m.div
                    key="msg2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl text-gray-200">
                      <TextGenerateEffect
                        words="Your AI team, ready to build and run anything you imagine."
                        duration={0.4}
                      />
                    </div>
                  </m.div>
                )}

                {/* Message 3 - No avatar */}
                {step === 3 && (
                  <m.div
                    key="msg3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl text-gray-200">
                      <TextGenerateEffect
                        words="We build, automate, and solve problems - faster than humanly possible."
                        duration={0.4}
                      />
                    </div>
                  </m.div>
                )}

                {/* Question - No avatar */}
                {step === 4 && (
                  <m.div
                    key="question"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl font-medium text-white">
                      <TextGenerateEffect
                        words="Ready to see your AI team in action?"
                        duration={0.3}
                      />
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Apple-style Buttons - Always visible at bottom */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="w-full max-w-md space-y-3"
      >
        <m.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onPathSelect('demo')}
          className="w-full px-6 py-3.5 rounded-full text-base font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors duration-200"
        >
          Start the experience
        </m.button>

        <m.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onPathSelect('direct')}
          className="w-full px-6 py-3.5 rounded-full text-base font-medium border border-white/30 hover:border-white/50 text-white transition-colors duration-200 backdrop-blur-sm"
        >
          Access Dashboard
        </m.button>
      </m.div>
    </div>
  );
};

export default memo(Scene1_Welcome);
