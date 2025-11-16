import React, { memo, useMemo } from 'react';

import { cn } from '@lib/utils';

interface StaticGradientAvatarProps {
  colors?: string[];
  size?: number;
  onClick?: () => void;
  className?: string;
}

/**
 * StaticGradientAvatar - SVG-based gradient avatar with inner shadows
 * Matches the exact structure from the design system
 */
const StaticGradientAvatar = ({ 
  colors = ['#CADCFC', '#A0B9D1'], 
  size = 64, 
  onClick, 
  className 
}: StaticGradientAvatarProps): React.JSX.Element => {
  // Validate colors
  const validColors = Array.isArray(colors) && colors.length >= 2 ? colors : ['#CADCFC', '#A0B9D1'];

  const filterId = useMemo(() => `orb-filter-${Math.random().toString(36).substr(2, 9)}`, []);

  // Parse hex color to RGB values
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  };

  const color0 = hexToRgb(validColors[0]);
  const color1 = hexToRgb(validColors[1]);

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-full relative animate-subtle-pulse',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{ width: size, height: size }}
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
          <circle
            cx="203.5"
            cy="203.5"
            fill={validColors[0]}
            fillOpacity=".01"
            r="203.5"
          />
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
            <feFlood
              floodOpacity="0"
              result="BackgroundImageFix"
            />
            <feBlend
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy="29.071" />
            <feGaussianBlur stdDeviation="58.143" />
            <feComposite
              in2="hardAlpha"
              k2="-1"
              k3="1"
              operator="arithmetic"
            />
            <feColorMatrix
              values={`0 0 0 0 ${color0.r} 0 0 0 0 ${color0.g} 0 0 0 0 ${color0.b} 0 0 0 0.8 0`}
            />
            <feBlend
              in2="shape"
              result="effect1_innerShadow"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy="-17.443" />
            <feGaussianBlur stdDeviation="23.257" />
            <feComposite
              in2="hardAlpha"
              k2="-1"
              k3="1"
              operator="arithmetic"
            />
            <feColorMatrix
              values={`0 0 0 0 ${color1.r} 0 0 0 0 ${color1.g} 0 0 0 0 ${color1.b} 0 0 0 0.6 0`}
            />
            <feBlend
              in2="effect1_innerShadow"
              result="effect2_innerShadow"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default memo(StaticGradientAvatar);

