import { TextField, TextFieldProps } from '@mui/material';
import { AnimatePresence, m } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

type VanishingTextFieldProps = TextFieldProps & {
  onSubmit: (value: string) => void;
  placeholders?: string[];
}

const VanishingTextField: React.FC<VanishingTextFieldProps> = ({
  onSubmit,
  placeholders,
  InputProps,
  ...rest
}) => {
  const [value, setValue] = useState('');
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const newDataRef = useRef<any[]>([]);

  // Drawing function to capture input text onto canvas
  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue('font-size'));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = '#FFF';
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: any[] = [];

    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value]);

  useEffect(() => {
    if (animating) {
      draw();
    }
  }, [value, animating, draw]);

  // Animation function for vanishing effect
  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr: any[] = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue('');
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();

    const inputValue = inputRef.current?.value || '';
    if (inputValue) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX);
      onSubmit(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !animating) {
      vanishAndSubmit();
    }
  };

  // Sliding Placeholder Logic (Optional)
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const startPlaceholderAnimation = () => {
    if (placeholders && placeholders.length > 0) {
      intervalRef.current = window.setInterval(() => {
        setCurrentPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
      }, 3000);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible' && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === 'visible' && !intervalRef.current) {
      startPlaceholderAnimation();
    }
  };

  useEffect(() => {
    if (placeholders && placeholders.length > 0) {
      startPlaceholderAnimation();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [placeholders]);

  return (
    <div className="relative">
      {/* Canvas for vanishing effect */}
      <canvas
        className={`absolute pointer-events-none transform scale-50 top-[20%] left-2 origin-top-left ${
          !animating ? 'opacity-0' : 'opacity-100'
        }`}
        ref={canvasRef}
      />
      {/* TextField */}
      <TextField
        {...rest}
        value={value}
        inputRef={inputRef}
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            rest.onChange && rest.onChange(e);
          }
        }}
        onKeyDown={handleKeyDown}
        InputProps={{
          ...InputProps,
          className: `${InputProps?.className || ''} ${
            animating ? 'text-transparent' : ''
          }`,
        }}
        placeholder="" // Hide default placeholder
      />
      {/* Optional Sliding Placeholder */}
      {placeholders && placeholders.length > 0 && (
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <AnimatePresence mode="wait">
            {!value && (
              <m.p
                key={`placeholder-${currentPlaceholderIndex}`}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'linear' }}
                className="text-gray-500 pl-4"
              >
                {placeholders[currentPlaceholderIndex]}
              </m.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default memo(VanishingTextField);