import { useEffect } from 'react';
import { m, stagger, useAnimate } from 'framer-motion';
import { cn } from '../../../lib/utils';

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(' ');
  useEffect(() => {
    animate(
      'span',
      {
        opacity: 1,
        filter: filter ? 'blur(0px)' : 'none',
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      },
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <m.div
        ref={scope}
        className="inline"
      >
        {wordsArray.map((word, idx) => {
          return (
            <m.span
              key={word + idx}
              className="opacity-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent"
              style={{
                filter: filter ? 'blur(10px)' : 'none',
                display: 'inline-block',
                marginRight: '0.25em',
              }}
            >
              {word}
            </m.span>
          );
        })}
      </m.div>
    );
  };

  return <div className={cn('', className)}>{renderWords()}</div>;
};
