import { m } from 'framer-motion';
import React, { memo } from 'react';

import EnhancedCommandInput from '../../components/EnhancedCommandInput';

const Scene4_DirectInput = () => {
  // EnhancedCommandInput → CreateAnything already handles:
  // - Unauthenticated user flow
  // - Redirecting to signup
  // - Creating project with idea
  // We just need to present it cleanly

  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center w-full max-w-3xl">
        {/* Instruction */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Tell me about your idea
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Describe what you want to build, and I'll help you make it real
          </p>
        </m.div>

        {/* Command Input */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-3xl"
        >
          <EnhancedCommandInput handleVoice={() => {}} />
        </m.div>

        {/* Hint */}
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-sm text-gray-500 dark:text-gray-500"
        >
          Press Enter to continue · Examples: "A CRM for my sales team" or "An analytics
          dashboard"
        </m.p>
      </div>
    </div>
  );
};

export default memo(Scene4_DirectInput);

