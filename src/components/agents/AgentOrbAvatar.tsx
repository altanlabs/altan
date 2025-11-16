import { Box } from '@mui/material';
import React, { Suspense, Component, forwardRef, ReactNode } from 'react';

import { Orb } from '../elevenlabs/ui/orb';

interface OrbErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface OrbErrorBoundaryState {
  hasError: boolean;
}

// ErrorBoundary for Three.js Orb component
class OrbErrorBoundary extends Component<OrbErrorBoundaryProps, OrbErrorBoundaryState> {
  constructor(props: OrbErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): OrbErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Orb rendering error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface AgentOrbAvatarProps {
  size?: number;
  agentId?: string;
  onClick?: () => void;
  agentState?: 'listening' | 'talking' | 'thinking' | null;
  colors?: string[];
  isStatic?: boolean;
}

/**
 * AgentOrbAvatar - Renders an animated orb avatar for agents
 * @param {number} size - Size of the avatar in pixels (default: 32)
 * @param {string} agentId - Unique identifier for the agent (used for seed)
 * @param {React.Ref} ref - Optional ref to attach to the container
 * @param {function} onClick - Optional click handler
 * @param {string} agentState - Agent state: null, 'listening', 'talking', 'thinking'
 * @param {array} colors - Array of two colors for the orb (default: ['#CADCFC', '#A0B9D1'])
 * @param {boolean} isStatic - Whether the orb should be static or animated
 */
export const AgentOrbAvatar = forwardRef<HTMLDivElement, AgentOrbAvatarProps>(({
  size = 32,
  agentId,
  onClick,
  agentState = null,
  colors = ['#CADCFC', '#A0B9D1'],
  isStatic = true,
}, ref) => {
  const fallback = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 1 },
        },
      }}
    />
  );

  return (
    <Box
      ref={ref}
      onClick={onClick}
      sx={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        cursor: onClick ? 'pointer' : 'default',
        padding: 0,
        margin: 0,
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          padding: 0,
          margin: 0,
        }}
      >
        <OrbErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <Orb
              colors={colors}
              seed={agentId ? agentId.charCodeAt(0) * 1000 : 1000}
              agentState={agentState}
              static={isStatic}
            />
          </Suspense>
        </OrbErrorBoundary>
      </Box>
    </Box>
  );
});

AgentOrbAvatar.displayName = 'AgentOrbAvatar';

export default AgentOrbAvatar;

