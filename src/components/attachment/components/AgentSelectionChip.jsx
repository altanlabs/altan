import {
  Chip,
  Avatar,
  Popover,
  Box,
  Typography,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';

import { selectMembers } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store';
import Iconify from '../../iconify/Iconify.jsx';

const AgentSelectionChip = ({
  agents = [],
  selectedAgent,
  onAgentSelect,
  onAgentClear,
  isVoiceActive = false,
}) => {
  const [agentMenuAnchor, setAgentMenuAnchor] = useState(null);
  const [userHasCleared, setUserHasCleared] = useState(false);
  const hasAutoSelected = useRef(false);
  const lastAgentIds = useRef('');
  const members = useSelector(selectMembers);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Auto-select agent with "always" interaction when available
  useEffect(() => {
    // Only auto-select once and only if user hasn't manually cleared
    if (!selectedAgent && agents.length > 1 && !userHasCleared && !hasAutoSelected.current) {
      const alwaysAgent = agents.find((agent) => {
        const originalMember = members.byId[agent.id];
        const interaction = originalMember?.agent_interaction;
        console.log(`🔍 Checking agent ${agent.name}:`, {
          agentId: agent.id,
          originalMember: !!originalMember,
          agentInteraction: interaction,
        });
        return interaction === 'always';
      });

      console.log('🔍 Always agent found:', alwaysAgent?.name || 'none');

      if (alwaysAgent) {
        console.log('🎯 Auto-selecting "always" agent:', alwaysAgent.name);
        onAgentSelect(alwaysAgent);
        hasAutoSelected.current = true;
      }
    } else {
      console.log('🔍 Auto-selection blocked because:', {
        hasSelectedAgent: !!selectedAgent,
        notEnoughAgents: agents.length <= 1,
        userHasCleared,
        alreadyAutoSelected: hasAutoSelected.current,
      });
    }
  }, [agents, selectedAgent, members, onAgentSelect, userHasCleared]);

  // Reset flags when entering a new room (when agents list changes significantly)
  useEffect(() => {
    const agentIds = agents.map(agent => agent.id).sort().join(',');
    // Only reset if we have a completely different set of agents (new room)
    if (agentIds && agentIds !== lastAgentIds.current && agents.length > 0) {
      // Only reset if this is truly a different room, not just the first load
      if (lastAgentIds.current !== '') {
        setUserHasCleared(false);
        hasAutoSelected.current = false;
      }
      lastAgentIds.current = agentIds;
    }
  }, [agents]);

  const handleAgentMenuOpen = (event) => {
    event.preventDefault();
    setAgentMenuAnchor(event.currentTarget);
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchor(null);
  };

  const handleAgentSelect = (agent) => {
    console.log('🎯 Agent manually selected:', agent.name);
    console.log('🔍 State before selection:', {
      userHasCleared,
      hasAutoSelected: hasAutoSelected.current,
    });
    setUserHasCleared(false); // Reset flag when user selects an agent
    hasAutoSelected.current = true; // Mark as having a selection
    onAgentSelect(agent);
    setAgentMenuAnchor(null);
  };

  const handleAgentClear = () => {
    console.log('❌ Agent manually cleared');
    console.log('🔍 State before clearing:', {
      userHasCleared,
      hasAutoSelected: hasAutoSelected.current,
    });
    setUserHasCleared(true); // Mark that user has manually cleared
    console.log('🔍 State after clearing:', {
      userHasCleared: true,
      hasAutoSelected: hasAutoSelected.current,
    });
    onAgentClear();
  };

  // Don't show if there's only one agent or if voice is active
  if (agents.length <= 1 || isVoiceActive) {
    return null;
  }

  // Get label based on mobile state
  const getLabel = () => {
    if (selectedAgent) {
      return selectedAgent.name;
    }
    // On mobile, return empty string to hide the count
    return isMobile ? '' : `${agents.length} agents`;
  };

  return (
    <>
      <Chip
        avatar={
          selectedAgent ? (
            <Avatar
              src={selectedAgent.src}
              alt={selectedAgent.name}
              sx={{ width: 20, height: 20 }}
            />
          ) : undefined
        }
        icon={!selectedAgent ? <Iconify icon="mdi:at" /> : undefined}
        label={getLabel()}
        size="small"
        variant="soft"
        color="default"
        onClick={handleAgentMenuOpen}
        onDelete={selectedAgent ? handleAgentClear : undefined}
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        sx={{
          borderRadius: '12px',
          fontSize: '0.75rem',
          height: '28px',
          minWidth: isMobile && !selectedAgent ? '28px' : 'auto',
          '& .MuiChip-icon': {
            fontSize: '14px',
            marginLeft: '4px',
          },
          '& .MuiChip-label': {
            paddingLeft: isMobile && !selectedAgent ? 0 : undefined,
            paddingRight: isMobile && !selectedAgent ? 0 : undefined,
          },
        }}
      />

      {/* Agent Menu */}
      <Popover
        open={Boolean(agentMenuAnchor)}
        anchorEl={agentMenuAnchor}
        onClose={handleAgentMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            maxWidth: '250px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Box p={1}>
          <Typography
            variant="caption"
            sx={{ px: 1, py: 0.5, color: 'text.secondary' }}
          >
            Select an agent to mention
          </Typography>
          {agents.map((agent) => (
            <MenuItem
              key={agent.id}
              onClick={() => handleAgentSelect(agent)}
              sx={{
                borderRadius: '8px',
                margin: '2px 0',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Avatar
                src={agent.src}
                alt={agent.name}
                sx={{ width: 24, height: 24, marginRight: 1 }}
              />
              <Typography
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                {agent.name}
              </Typography>
              {(() => {
                const originalMember = members.byId[agent.id];
                const hasVoice = !!originalMember?.member?.agent?.elevenlabs_id;
                return hasVoice ? (
                  <Iconify
                    icon="mdi:microphone"
                    sx={{ ml: 'auto', color: 'success.main', fontSize: '16px' }}
                  />
                ) : null;
              })()}
            </MenuItem>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default AgentSelectionChip;
