import React, { memo } from 'react';

/**
 * Shimmer effect component for unapproved plans
 * Creates a subtle animated highlight to draw attention
 */
const Shimmer: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
      <div className="shimmer-animation absolute inset-0 -translate-x-full">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-neutral-300/20 dark:via-neutral-700/20 to-transparent" />
      </div>
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        .shimmer-animation {
          animation: shimmer 3s infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default memo(Shimmer);

