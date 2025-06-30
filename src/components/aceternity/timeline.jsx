import Stack from '@mui/material/Stack';
import { useScroll, useTransform, m } from 'framer-motion';
import React, { memo, useEffect, useRef, useState } from 'react';

import { cn } from '@lib/utils';

const Timeline = ({ data, header = null, footer = null }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 50%'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full h-full bg-white/[.54] dark:bg-neutral-950/[.54] md:px-10 overflow-x-hidden"
      ref={containerRef}
    >
      {!header ? null : (
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 lg:px-10">{header}</div>
      )}
      <div
        ref={ref}
        className="relative max-w-7xl mx-auto pb-10"
      >
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-20 md:gap-10 w-full"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-1/3">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700 border p-2" />
              </div>
              <Stack className="md:pl-20 gap-5">
                <h3 className="hidden md:block text-xl md:text-5xl font-bold text-neutral-800 dark:text-white">
                  {item.title}
                </h3>
                <p className="hidden md:block text-neutral-700 dark:text-white">
                  {item.description}
                </p>
              </Stack>
            </div>

            <div className="pl-20 pr-4 md:pl-4 w-full md:w-2/3">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-800 dark:text-white">
                {item.title}
              </h3>
              {item.content}{' '}
            </div>
          </div>
        ))}
        <div
          className={cn(
            'absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]',
            `h-[${height}px]`,
          )}
        >
          <m.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
      {!footer ? null : (
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 lg:px-10">{footer}</div>
      )}
    </div>
  );
};

export default memo(Timeline);
