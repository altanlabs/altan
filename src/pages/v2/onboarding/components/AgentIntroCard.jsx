import { m } from 'framer-motion';
import React, { memo } from 'react';

const AgentIntroCard = ({ name, icon, message, delay = 0 }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-3xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{name}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </m.div>
  );
};

export default memo(AgentIntroCard);
