import { Box, ButtonBase, SxProps, Theme } from '@mui/material';
import React from 'react';

import Iconify from '../iconify';

interface InteractiveHoverButtonProps {
  text?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = 'Button', sx = {}, ...props }, ref) => {
    return (
      <ButtonBase
        ref={ref}
        sx={{
          position: 'relative',
          width: 128, // w-32
          cursor: 'pointer',
          overflow: 'hidden',
          borderRadius: '50px', // rounded-full
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 1,
          textAlign: 'center',
          fontWeight: 600, // font-semibold
          transition: 'all 0.3s ease',
          '&:hover': {
            '& .button-text': {
              transform: 'translateX(48px)', // translate-x-12
              opacity: 0,
            },
            '& .hover-content': {
              transform: 'translateX(-4px)', // -translate-x-1
              opacity: 1,
            },
            '& .bg-animation': {
              left: '0%',
              top: '0%',
              height: '100%',
              width: '100%',
              transform: 'scale(1.8)',
              bgcolor: 'primary.main',
            },
          },
          ...sx,
        }}
        {...props}
      >
        {/* Main text */}
        <Box
          className="button-text"
          sx={{
            display: 'inline-block',
            transform: 'translateX(4px)', // translate-x-1
            transition: 'all 0.3s ease',
            color: 'text.primary',
          }}
        >
          {text}
        </Box>

        {/* Hover content with icon */}
        <Box
          className="hover-content"
          sx={{
            position: 'absolute',
            top: 0,
            zIndex: 10,
            display: 'flex',
            height: '100%',
            width: '100%',
            transform: 'translateX(48px)', // translate-x-12
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: 'primary.contrastText',
            opacity: 0,
            transition: 'all 0.3s ease',
          }}
        >
          <span>{text}</span>
          <Iconify
            icon="mdi:arrow-right"
            width={16}
          />
        </Box>

        {/* Background animation */}
        <Box
          className="bg-animation"
          sx={{
            position: 'absolute',
            left: '20%',
            top: '40%',
            height: 8, // h-2
            width: 8, // w-2
            transform: 'scale(1)',
            borderRadius: 1, // rounded-lg equivalent
            bgcolor: 'primary.main',
            transition: 'all 0.3s ease',
          }}
        />
      </ButtonBase>
    );
  },
);

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

export default InteractiveHoverButton;

