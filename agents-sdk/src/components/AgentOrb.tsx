/**
 * AgentOrb - Animated orb avatar for voice agents
 * Standalone component for the SDK
 */

import React, { Suspense, Component, ReactNode } from 'react';

import { Orb } from './Orb';
import type { AgentOrbProps, AgentState } from '../types';

// ErrorBoundary for Three.js Orb component
interface OrbErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface OrbErrorBoundaryState {
  hasError: boolean;
}

class OrbErrorBoundary extends Component<OrbErrorBoundaryProps, OrbErrorBoundaryState> {
  constructor(props: OrbErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): OrbErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Orb rendering error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Simple CSS-based fallback orb
 */
const FallbackOrb: React.FC<{ colors: [string, string]; agentState: AgentState }> = ({ colors, agentState }) => {
  const isActive = agentState === 'speaking' || agentState === 'thinking';
  
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors[0]}, ${colors[1]})`,
        animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
        opacity: isActive ? 1 : 0.8,
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

/**
 * AgentOrb - Main component
 */
export const AgentOrb: React.FC<AgentOrbProps> = ({
  size = 180,
  agentId = 'default',
  colors = ['#00fbff', '#68dffd'],
  agentState = null,
  isStatic = false,
  onClick,
}) => {
  const fallback = <FallbackOrb colors={colors} agentState={agentState} />;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        cursor: onClick ? 'pointer' : 'default',
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
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
      </div>
    </div>
  );
};

export default AgentOrb;

