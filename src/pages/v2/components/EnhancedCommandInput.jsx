import React, { memo, useState, useEffect } from 'react';
import { m } from 'framer-motion';
import CreateAnything from '../../dashboard/components/CreateAnything';

const EnhancedCommandInput = ({ handleVoice, onActivityChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Listen for focus on any input/textarea in CreateAnything
    const handleFocus = () => {
      setIsFocused(true);
      if (onActivityChange) {
        onActivityChange(true);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (onActivityChange) {
        onActivityChange(false);
      }
    };

    // Use event delegation to catch focus on dynamically created inputs
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [onActivityChange]);

  return (
    <m.div
      className="relative"
      animate={{
        scale: isFocused ? 1.02 : 1,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Glow effect when focused */}
      {isFocused && (
        <m.div
          className="absolute inset-0 rounded-3xl blur-xl -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          }}
        />
      )}

      <CreateAnything handleVoice={handleVoice} />
    </m.div>
  );
};

export default memo(EnhancedCommandInput);

