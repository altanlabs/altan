import { m } from 'framer-motion';
import React, { memo } from 'react';

import CreateAnything from '../../dashboard/components/CreateAnything';

const V2LandingHero = ({ handleVoice }) => {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <m.div
        className="flex flex-col items-center text-center w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero Title */}
        <m.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-gray-900 dark:text-white">Build without </span>
          <span
            className="relative inline-block bg-clip-text text-transparent animate-gradient-x"
            style={{
              backgroundImage: 'linear-gradient(90deg, #83FCB7, #00E5FF, #A0C1FF, #639CF2)',
              backgroundSize: '200% 200%',
            }}
          >
            limits
          </span>
        </m.h1>

        {/* Subtitle */}
        <m.p
          className="text-base sm:text-lg md:text-xl text-foreground/70 mb-8 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Your AI team to build and run anything you imagine
        </m.p>

        {/* Command Input */}
        <div className="w-full max-w-3xl">
          <CreateAnything handleVoice={handleVoice} />
        </div>

        {/* Hint Text */}
        <m.p
          className="mt-4 text-sm text-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Start building with AI agents in seconds · No credit card required
        </m.p>
      </m.div>
    </div>
  );
};

export default memo(V2LandingHero);

