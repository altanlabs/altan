/**
 * AgentAvatar Component
 * Following Single Responsibility Principle - handles only avatar rendering
 */

/* eslint-disable react/prop-types, @typescript-eslint/no-unsafe-assignment */
import { memo } from 'react';

// @ts-expect-error - JSX component without types
import StaticGradientAvatar from '../../../../components/agents/StaticGradientAvatar';
// @ts-expect-error - JS component without types
import { CustomAvatar } from '../../../../components/custom-avatar';
import type { AgentAvatarProps } from '../types';

const DEFAULT_COLORS = ['#CADCFC', '#A0B9D1'];

export const AgentAvatar = memo<AgentAvatarProps>(({ agent, size = 48, className = '' }) => {
  const hasAvatarUrl = agent.avatar_url && agent.avatar_url.trim() !== '';

  if (hasAvatarUrl) {
    return (
      <CustomAvatar
        src={agent.avatar_url}
        alt={agent.name}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
        }}
        name={agent.name}
        className={`transition-transform group-hover:scale-105 ${className}`}
      />
    );
  }

  // @ts-expect-error - meta_data type definition incomplete
  const colors = agent?.meta_data?.avatar_orb?.colors || DEFAULT_COLORS;
  return (
    <StaticGradientAvatar
      size={size}
      colors={colors}
      className={`transition-transform group-hover:scale-105 ${className}`}
    />
  );
});

AgentAvatar.displayName = 'AgentAvatar';

