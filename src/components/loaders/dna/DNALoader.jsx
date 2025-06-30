import { m } from 'framer-motion';
import React, { memo } from 'react';
import './index.css';
import { Box } from '@mui/material';

import { bgBlur } from '../../../utils/cssStyles';
// import DNAStrand from './components/DNAStrand';

const DNALoader = () => {
  return (
    <Box
      className="loading-container"
      sx={bgBlur({ opacity: 0.3 })}
    >
      {/* SVG Logo */}
      <m.img
        src="/logos/logoWhite.svg"
        alt="Logo"
        className="logo"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* DNA Sequence Animation */}
      {/* <div className="dna-container">
        {[...Array(3)].map((_, i) => (
          <DNAStrand key={i} delay={i * 0.5} />
        ))}
      </div> */}

      {/* Particle Effects */}
      <div className="particle-container">
        {[...Array(30)].map((_, i) => (
          <m.span
            className="particle"
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </Box>
  );
};

export default memo(DNALoader);
