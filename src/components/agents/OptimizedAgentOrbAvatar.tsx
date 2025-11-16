import { Suspense, memo, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Orb } from '../elevenlabs/ui/orb';

interface OptimizedAgentOrbAvatarProps {
  size?: number;
  agentId?: string;
  onClick?: () => void;
  agentState?: null | 'listening' | 'talking' | 'thinking';
  colors?: [string, string];
  isStatic?: boolean;
  className?: string;
}

interface FallbackAvatarProps {
  colors: [string, string];
}

/**
 * Fallback component for loading/error states
 * Uses CSS gradient instead of WebGL to avoid creating extra contexts
 */
const FallbackAvatar = memo<FallbackAvatarProps>(({ colors }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]})`,
      opacity: 0.8,
    }}
  />
));

FallbackAvatar.displayName = 'FallbackAvatar';

/**
 * OptimizedAgentOrbAvatar - High-performance orb avatar with visibility detection
 * 
 * Optimizations:
 * - Intersection Observer: Only renders when visible in viewport
 * - Lazy WebGL initialization: Delays expensive context creation
 * - Proper resource cleanup: Prevents memory leaks
 * - Lightweight wrapper: No heavy UI library dependencies
 * - Smart memoization: Prevents unnecessary re-renders
 * 
 * @param size - Avatar size in pixels (default: 32)
 * @param agentId - Unique agent identifier for seeded randomness
 * @param onClick - Optional click handler
 * @param agentState - Agent state: null, 'listening', 'talking', 'thinking'
 * @param colors - Gradient colors [primary, secondary]
 * @param isStatic - Whether to use static rendering (better performance)
 * @param className - Additional CSS classes
 */
// eslint-disable-next-line react/prop-types
export const OptimizedAgentOrbAvatar = memo<OptimizedAgentOrbAvatarProps>(
  ({
    size = 32,
    agentId,
    onClick,
    agentState = null,
    colors = ['#CADCFC', '#A0B9D1'],
    isStatic = true,
    className = '',
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(false);

    // Intersection Observer to detect visibility
    useEffect(() => {
      const element = containerRef.current;
      if (!element) return;

      let enterTimeout: ReturnType<typeof setTimeout> | null = null;
      let exitTimeout: ReturnType<typeof setTimeout> | null = null;

      // Use a more aggressive threshold for better performance
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            // Clear exit timeout if we're re-entering
            if (exitTimeout) {
              clearTimeout(exitTimeout);
              exitTimeout = null;
            }
            // Delay actual render slightly to batch multiple orbs
            enterTimeout = setTimeout(() => setShouldRender(true), 50);
          } else {
            // Clear enter timeout if we're exiting before render
            if (enterTimeout) {
              clearTimeout(enterTimeout);
              enterTimeout = null;
            }
            // Keep render active for a bit after leaving viewport for smooth scrolling
            exitTimeout = setTimeout(() => setShouldRender(false), 500);
          }
        },
        {
          rootMargin: '50px', // Start loading slightly before entering viewport
          threshold: 0.01, // Minimal visibility needed
        }
      );

      observer.observe(element);

      return () => {
        if (enterTimeout) clearTimeout(enterTimeout);
        if (exitTimeout) clearTimeout(exitTimeout);
        observer.disconnect();
      };
    }, []);

    // Generate stable seed from agentId
    const seed = agentId ? agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 1000 : Math.random() * 10000;

    return (
      <div
        ref={containerRef}
        onClick={onClick}
        className={className}
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          cursor: onClick ? 'pointer' : 'default',
          padding: 0,
          margin: 0,
          overflow: 'hidden',
        }}
      >
        {shouldRender ? (
          <ErrorBoundary
            fallback={
              <FallbackAvatar colors={colors} />
            }
            onError={(error) => {
              // Silent error logging - don't spam console in production
              if (typeof window !== 'undefined' && import.meta.env?.DEV) {
                // eslint-disable-next-line no-console
                console.error('Orb rendering error:', error);
              }
            }}
          >
            <Suspense fallback={<FallbackAvatar colors={colors} />}>
              <Orb
                colors={colors}
                seed={seed}
                agentState={agentState}
                static={isStatic}
                className="w-full h-full"
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          // Show fallback when not visible to maintain layout
          <FallbackAvatar colors={colors} />
        )}
      </div>
    );
  },
  // Custom comparison to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    if (prevProps.size !== nextProps.size) return false;
    if (prevProps.agentId !== nextProps.agentId) return false;
    if (prevProps.agentState !== nextProps.agentState) return false;
    if (prevProps.isStatic !== nextProps.isStatic) return false;
    if (prevProps.className !== nextProps.className) return false;
    
    // Safely compare colors
    const prevColors = prevProps.colors ?? ['#CADCFC', '#A0B9D1'];
    const nextColors = nextProps.colors ?? ['#CADCFC', '#A0B9D1'];
    if (prevColors[0] !== nextColors[0]) return false;
    if (prevColors[1] !== nextColors[1]) return false;
    
    return true;
  }
);

OptimizedAgentOrbAvatar.displayName = 'OptimizedAgentOrbAvatar';

