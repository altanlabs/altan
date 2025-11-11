import { m } from 'framer-motion';

import { cn } from '@lib/utils';

const AltanAnimatedSvg = ({ size = 145, ratio = 84 / 72, className, pathClassName }) => {
  const width = size;
  const height = size / ratio;

  return (
    <m.svg
      width={width}
      height={height}
      viewBox="0 0 84 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        filter: 'blur(10px)',
        scale: 0.5,
        transition: {
          duration: 3,
          ease: 'easeOut',
        },
      }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className={cn('relative', className)}
    >
      <m.path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M83.5643 71.9914L42 0L0.435791 71.9914C9.40753 67.1723 24.6747 64 42 64C59.3253 64 74.5925 67.1723 83.5643 71.9914Z"
        className={cn(
          'fill-black/60 dark:fill-white/40 hover:fill-black dark:hover:fill-white group-hover:fill-black dark:group-hover:fill-white',
          pathClassName,
        )}
      />
    </m.svg>
  );
};

export default AltanAnimatedSvg;
