import { Box } from '@mui/material';
import { Suspense, Component } from 'react';

import { Orb } from '../elevenlabs/ui/orb';

// ErrorBoundary for Three.js Orb component
class OrbErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('Orb rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * AgentOrbAvatar - Renders an animated orb avatar for agents
 * @param {number} size - Size of the avatar in pixels (default: 32)
 * @param {string} agentId - Unique identifier for the agent (used for seed)
 * @param {React.Ref} ref - Optional ref to attach to the container
 * @param {function} onClick - Optional click handler
 * @param {string} agentState - Agent state: null, 'listening', 'talking', 'thinking'
 */
export const AgentOrbAvatar = ({
  size = 32,
  agentId,
  ref,
  onClick,
  agentState = null,
}) => {
  const fallback = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #CADCFC 0%, #A0B9D1 100%)',
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
        padding: '1px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <OrbErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <Orb
              colors={['#CADCFC', '#A0B9D1']}
              seed={agentId ? agentId.charCodeAt(0) * 1000 : 1000}
              agentState={agentState}
            />
          </Suspense>
        </OrbErrorBoundary>
      </Box>
    </Box>
  );
};

export default AgentOrbAvatar;
