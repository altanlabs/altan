import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';

import { AgentOrbAvatar } from './AgentOrbAvatar';
import { CustomAvatar } from '../custom-avatar';
import Logo from '../logo/Logo';

/**
 * DynamicAgentAvatar - Displays agent avatar based on configuration
 * Priority:
 * 1. If agent name is "Altan", show Logo
 * 2. If avatar_url exists, show image
 * 3. Otherwise show orb
 */
const DynamicAgentAvatar = ({ agent, size = 32, agentId, agentState = null, onClick, isStatic = true, sx = {} }) => {
  if (!agent) return null;

  // If agent name is exactly "Altan", render the Logo
  if (agent?.name === 'Altan') {
    const logoSize = size * 0.65; // Make logo 65% of the container size
    return (
      <Box
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
      >
        <Logo minimal disabledLink sx={{ width: logoSize, height: logoSize }} />
      </Box>
    );
  }

  const hasAvatarUrl = !!agent?.avatar_url && agent?.avatar_url?.trim() !== '';

  // Get colors from agent meta_data or use defaults
  const orbColors = agent?.meta_data?.avatar_orb?.colors || ['#CADCFC', '#A0B9D1'];
  // If avatar_url exists, display it
  if (hasAvatarUrl) {
    return (
      <CustomAvatar
        src={agent?.avatar_url}
        alt={agent?.name}
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          cursor: onClick ? 'pointer' : 'default',
          ...sx,
        }}
        name={agent?.name}
      />
    );
  }

  // Otherwise, display the orb with custom colors
  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
    >
      <AgentOrbAvatar
        size={size}
        agentId={agentId || agent?.id}
        agentState={agentState}
        onClick={onClick}
        colors={orbColors}
        isStatic={isStatic}
      />
    </Box>
  );
};

DynamicAgentAvatar.propTypes = {
  agent: PropTypes.object,
  size: PropTypes.number,
  agentId: PropTypes.string,
  agentState: PropTypes.string,
  onClick: PropTypes.func,
  sx: PropTypes.object,
  isStatic: PropTypes.bool,
};

export default memo(DynamicAgentAvatar);
