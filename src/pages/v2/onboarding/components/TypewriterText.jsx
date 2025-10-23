import { m } from 'framer-motion';
import React, { useState, useEffect, memo } from 'react';

const TypewriterText = ({ text, speed = 50, delay = 0, onComplete, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Start typing after initial delay
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        setTimeout(onComplete, 100);
      }
    }
  }, [currentIndex, text, speed, onComplete, isComplete, hasStarted]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <m.span
          className="inline-block w-0.5 h-5 bg-current ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
};

export default memo(TypewriterText);

