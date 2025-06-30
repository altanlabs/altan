import { useTheme } from '@mui/material';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

import { cn } from '@lib/utils.ts';

// Convert hex color to RGB
const hexToRgb = (hex) => {
  const cleanHex = hex.replace(/^#/, '');
  const bigint = parseInt(cleanHex, 16);
  let r, g, b;

  if (cleanHex.length === 3) {
    r = (bigint >> 8) & 0xf;
    g = (bigint >> 4) & 0xf;
    b = bigint & 0xf;
    r = (r << 4) | r;
    g = (g << 4) | g;
    b = (b << 4) | b;
  } else if (cleanHex.length === 6) {
    r = (bigint >> 16) & 0xff;
    g = (bigint >> 8) & 0xff;
    b = bigint & 0xff;
  } else {
    return null;
  }

  return { r, g, b };
};

// Resize handler
const resizeCanvas = (canvas, ctx) => {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
};

// Convert RGB to hex color
const rgbToHex = ({ r, g, b }) => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

// Interpolate numerical values
const interpolateValue = (start, end, factor) => {
  return start + (end - start) * factor;
};

// Interpolate between two colors
const interpolateColor = (color1, color2, factor) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  if (!c1 || !c2) return color2;

  const r = interpolateValue(c1.r, c2.r, factor);
  const g = interpolateValue(c1.g, c2.g, factor);
  const b = interpolateValue(c1.b, c2.b, factor);

  return rgbToHex({ r, g, b });
};

// Interpolate arrays of colors
const interpolateColorsArray = (colors1, colors2, factor) => {
  const length = Math.max(colors1.length, colors2.length);
  const paddedColors1 = [...colors1];
  const paddedColors2 = [...colors2];

  while (paddedColors1.length < length) {
    paddedColors1.push(paddedColors1[paddedColors1.length - 1]);
  }
  while (paddedColors2.length < length) {
    paddedColors2.push(paddedColors2[paddedColors2.length - 1]);
  }

  return paddedColors1.map((color, index) => interpolateColor(color, paddedColors2[index], factor));
};

// Helper to determine speed multiplier
const getSpeed = (speed) => {
  switch (speed) {
    case 'superslow':
      return 0.0001;
    case 'slow':
      return 0.001;
    case 'fast':
      return 0.002;
    default:
      return 0.001;
  }
};

const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth = 50,
  waveCount = 5,
  amplitude = 100,
  frequency = 800,
  speed = 'superslow',
  blur = 10,
  waveOpacity = 0.5,
  backgroundFill,
  ...props
}) => {
  const theme = useTheme();
  const noise = createNoise3D();
  const canvasRef = useRef(null);

  const animationIdRef = useRef();
  const transitionStartTimeRef = useRef(performance.now());
  const transitionDuration = 2000; // 2 seconds

  const initialSettings = useRef({
    colors: colors ?? ['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#22d3ee'],
    waveWidth,
    waveCount,
    amplitude,
    frequency,
    speed: getSpeed(speed),
    blur,
    waveOpacity,
    backgroundFill: backgroundFill || (theme.palette.mode === 'dark' ? 'black' : 'white'),
  });

  const currentSettingsRef = useRef({ ...initialSettings.current });
  const targetSettingsRef = useRef({ ...initialSettings.current });

  const interpolateSettings = useCallback((factor) => {
    const oldSettings = currentSettingsRef.current;
    const targetSettings = targetSettingsRef.current;

    const keysToInterpolate = [
      'waveWidth',
      'waveCount',
      'amplitude',
      'frequency',
      'speed',
      'blur',
      'waveOpacity',
    ];

    keysToInterpolate.forEach((key) => {
      oldSettings[key] = interpolateValue(oldSettings[key], targetSettings[key], factor);
    });

    oldSettings.colors = interpolateColorsArray(oldSettings.colors, targetSettings.colors, factor);

    oldSettings.backgroundFill = interpolateColor(
      oldSettings.backgroundFill,
      targetSettings.backgroundFill,
      factor,
    );
  }, []);

  // Draw wave function
  const drawWave = useCallback(
    (ctx, nt) => {
      const { colors, waveWidth, waveCount, amplitude, frequency } = currentSettingsRef.current;
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;

      for (let i = 0; i < Math.round(waveCount); i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth;
        ctx.strokeStyle = colors[i % colors.length];
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / frequency, i * 0.3, nt) * amplitude;
          ctx.lineTo(x, y + h * 0.5);
        }
        ctx.stroke();
        ctx.closePath();
      }
    },
    [noise],
  );

  // Render loop
  const render = (ctx, prevTime, nt) => {
    const now = performance.now();
    const deltaTime = now - prevTime;
    const elapsed = now - transitionStartTimeRef.current;
    const factor = Math.min(elapsed / transitionDuration, 1);

    // Interpolate settings
    interpolateSettings(factor);

    const { backgroundFill, waveOpacity, blur, speed } = currentSettingsRef.current;

    ctx.filter = `blur(${blur}px)`;
    ctx.globalAlpha = waveOpacity;
    ctx.fillStyle = backgroundFill;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawWave(ctx, nt);

    nt += speed * deltaTime;

    animationIdRef.current = requestAnimationFrame(() => render(ctx, now, nt));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    resizeCanvas(canvas, ctx);
    window.addEventListener('resize', () => resizeCanvas(canvas, ctx));

    const nt = 0;
    render(ctx, performance.now(), nt);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', () => resizeCanvas(canvas, ctx));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update target settings when props change
  useEffect(() => {
    targetSettingsRef.current = {
      colors: colors ?? targetSettingsRef.current.colors,
      waveWidth,
      waveCount,
      amplitude,
      frequency,
      speed: getSpeed(speed),
      blur,
      waveOpacity,
      backgroundFill: backgroundFill || targetSettingsRef.current.backgroundFill,
    };
    transitionStartTimeRef.current = performance.now();
  }, [
    colors,
    waveWidth,
    waveCount,
    amplitude,
    frequency,
    speed,
    blur,
    waveOpacity,
    backgroundFill,
  ]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', containerClassName)}>
      <canvas
        className="absolute inset-0 z-0 w-full h-full"
        ref={canvasRef}
        id="canvas"
      >
      </canvas>
      <div
        className={cn('relative z-10 h-full overflow-y-auto', className)}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default memo(WavyBackground);
