import { m } from 'framer-motion';
import React, { memo } from 'react';

const DNAStrand = ({ delay }) => (
  <m.svg
    width="200"
    height="100"
    viewBox="0 0 200 100"
    style={{ position: 'absolute' }}
    initial={{ x: '-20%' }}
    animate={{ x: '120%' }}
    transition={{
      duration: 6,
      ease: 'linear',
      repeat: Infinity,
      delay,
    }}
  >
    <m.path
      d="M0,50 Q50,0 100,50 T200,50"
      fill="none"
      stroke="#8fa1b3"
      strokeWidth="2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'mirror',
      }}
    />
  </m.svg>
);

export default memo(DNAStrand);
