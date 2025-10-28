import {
  Chip,
  Popover,
  Box,
  Typography,
  MenuItem,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';

import { AgentDetailDialog } from './agent-detail';
import { useAuthContext } from '../../../auth/useAuthContext';
import { selectMembers, selectRoomId } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store';
import Iconify from '../../iconify/Iconify.jsx';
import DynamicAgentAvatar from '../../agents/DynamicAgentAvatar';

const AgentSelectionChip = ({
  agents = [],
  selectedAgent,
  onAgentSelect,
  onAgentClear,
  isVoiceActive = false,
}) => {
  const [agentMenuAnchor, setAgentMenuAnchor] = useState(null);
  const [detailDialogAgent, setDetailDialogAgent] = useState(null);
  const members = useSelector(selectMembers);
  const roomId = useSelector(selectRoomId);
  const { user } = useAuthContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // LocalStorage key for this room's selected agent
  const getStorageKey = useCallback(() => `selectedAgent_${roomId}`, [roomId]);

  // Load persisted agent selection for this room
  useEffect(() => {
    if (roomId && agents.length > 0 && !selectedAgent) {
      try {
        const savedAgentId = localStorage.getItem(getStorageKey());
        if (savedAgentId) {
          const savedAgent = agents.find(agent => agent.id === savedAgentId);
          if (savedAgent) {
            onAgentSelect(savedAgent);
          } else {
            // Clean up invalid stored agent ID
            localStorage.removeItem(getStorageKey());
          }
        }
      } catch {
        // Error loading saved agent selection
      }
    }
  }, [roomId, agents, selectedAgent, onAgentSelect, getStorageKey]);

  const handleAgentMenuOpen = (event) => {
    event.preventDefault();
    setAgentMenuAnchor(event.currentTarget);
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchor(null);
  };

  const handleAgentSelect = (agent) => {
    // Save selection to localStorage for this room
    try {
      localStorage.setItem(getStorageKey(), agent.id);
    } catch {
      // Error saving agent selection
    }
    onAgentSelect(agent);
    setAgentMenuAnchor(null);
  };

  const handleAgentClear = () => {
    // Remove selection from localStorage for this room
    try {
      localStorage.removeItem(getStorageKey());
    } catch {
      // Error clearing agent selection
    }
    onAgentClear();
  };

  const handleAgentInfo = (event, agent) => {
    event.stopPropagation();
    // Get the full member object from Redux
    const fullMember = members.byId[agent.id];
    setDetailDialogAgent(fullMember);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogAgent(null);
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DynamicAgentAvatar
                agent={members.byId[selectedAgent.id]?.member?.agent || selectedAgent}
                size={20}
                isStatic
              />
            </Box>
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
          {agents.map((agent) => {
            const originalMember = members.byId[agent.id];
            const hasVoice = !!originalMember?.member?.agent?.elevenlabs_id;

            return (
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
                <Box sx={{ marginRight: 1 }}>
                  <DynamicAgentAvatar
                    agent={originalMember?.member?.agent || agent}
                    size={24}
                    isStatic
                  />
                </Box>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ flex: 1, fontWeight: 500 }}
                >
                  {agent.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                  {hasVoice && (
                    <Iconify
                      icon="mdi:microphone"
                      width={15}
                      sx={{ color: 'success.main' }}
                    />
                  )}
                  {user?.xsup && (
                    <Tooltip title="Agent details">
                      <IconButton
                        size="small"
                        onClick={(e) => handleAgentInfo(e, agent)}
                        sx={{
                          width: 24,
                          height: 24,
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <Iconify icon="eva:settings-2-outline" width={14} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </MenuItem>
            );
          })}
        </Box>
      </Popover>

      {/* Agent Detail Dialog for Super Users */}
      {user?.xsup && (
        <AgentDetailDialog
          open={!!detailDialogAgent}
          onClose={handleCloseDetailDialog}
          agentMember={detailDialogAgent}
        />
      )}
    </>
  );
};

export default AgentSelectionChip;
