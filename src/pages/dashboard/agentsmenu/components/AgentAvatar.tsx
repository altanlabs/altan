/**
 * AgentAvatar Component
 * Following Single Responsibility Principle - handles only avatar rendering
 */

/* eslint-disable react/prop-types, @typescript-eslint/no-unsafe-assignment */
import { memo } from 'react';

import { OptimizedAgentOrbAvatar } from '../../../../components/agents/OptimizedAgentOrbAvatar';
// @ts-expect-error - JS component without types
import { CustomAvatar } from '../../../../components/custom-avatar';
import type { AgentAvatarProps } from '../types';

const DEFAULT_COLORS: [string, string] = ['#CADCFC', '#A0B9D1'];

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
  const colors: [string, string] = agent?.meta_data?.avatar_orb?.colors || DEFAULT_COLORS;
  
  return (
    <OptimizedAgentOrbAvatar
      size={size}
      agentId={agent.id}
      colors={colors}
      isStatic={true}
      className={`transition-transform group-hover:scale-105 ${className}`}
    />
  );
});

AgentAvatar.displayName = 'AgentAvatar';

