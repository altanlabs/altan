import { m } from 'framer-motion';
import React, { memo, useEffect, useState } from 'react';

import { cn } from '@lib/utils';

const TextGenerateEffect = memo(({ words, className }) => {
  const [wordArray, setWordArray] = useState(words.split(''));
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count < wordArray.length) {
      const timeout = setTimeout(() => {
        setCount(count + 1);
      }, 30); // Speed of text generation

      return () => clearTimeout(timeout);
    }
  }, [count, wordArray.length]);

  return (
    <div className={cn('font-bold', className)}>
      {wordArray.map((char, i) => (
        <m.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={i <= count ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </m.span>
      ))}
    </div>
  );
});

TextGenerateEffect.displayName = 'TextGenerateEffect';

export { TextGenerateEffect };
