import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';

/**
 * StaticGradientAvatar - SVG-based gradient avatar with inner shadows
 * Matches the exact structure from the design system
 */
const StaticGradientAvatar = ({ colors = ['#CADCFC', '#A0B9D1'], size = 64, onClick, sx = {} }) => {
  // Validate colors
  const validColors = Array.isArray(colors) && colors.length >= 2
    ? colors
    : ['#CADCFC', '#A0B9D1'];

  const filterId = `orb-filter-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        animation: 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.9 },
          '50%': { opacity: 1 },
        },
        ...sx,
      }}
    >
      <svg
        fill="none"
        height="100%"
        viewBox="0 0 407 407"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <g filter={`url(#${filterId})`}>
          <circle cx="203.5" cy="203.5" fill={validColors[0]} fillOpacity=".01" r="203.5" />
        </g>
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height="453.514"
            id={filterId}
            width="407"
            x="0"
            y="-17.443"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="29.071" />
            <feGaussianBlur stdDeviation="58.143" />
            <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
            <feColorMatrix values={`0 0 0 0 ${parseInt(validColors[0].slice(1, 3), 16) / 255} 0 0 0 0 ${parseInt(validColors[0].slice(3, 5), 16) / 255} 0 0 0 0 ${parseInt(validColors[0].slice(5, 7), 16) / 255} 0 0 0 0.8 0`} />
            <feBlend in2="shape" result="effect1_innerShadow" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="-17.443" />
            <feGaussianBlur stdDeviation="23.257" />
            <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
            <feColorMatrix values={`0 0 0 0 ${parseInt(validColors[1].slice(1, 3), 16) / 255} 0 0 0 0 ${parseInt(validColors[1].slice(3, 5), 16) / 255} 0 0 0 0 ${parseInt(validColors[1].slice(5, 7), 16) / 255} 0 0 0 0.6 0`} />
            <feBlend in2="effect1_innerShadow" result="effect2_innerShadow" />
          </filter>
        </defs>
      </svg>
    </Box>
  );
};

StaticGradientAvatar.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.number,
  onClick: PropTypes.func,
  sx: PropTypes.object,
};

export default memo(StaticGradientAvatar);

