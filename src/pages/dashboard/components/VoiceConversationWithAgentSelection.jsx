import { Avatar, Popover, Box, Typography, MenuItem } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import VoiceConversation from './VoiceConversation';
import { useAuthContext } from '../../../auth/useAuthContext';
import Iconify from '../../../components/iconify';
import { useVoiceConversation } from '../../../providers/voice/VoiceConversationProvider';
import { selectSortedAgents } from '../../../redux/slices/general';

// Agent selector
const getAccount = (state) => state.general.account;

const VoiceConversationWithAgentSelection = memo(({ onCreateAgent }) => {
  const { isAuthenticated } = useAuthContext();
  const agents = useSelector(selectSortedAgents);
  const account = useSelector(getAccount);
  const { isConnected } = useVoiceConversation();

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentMenuAnchor, setAgentMenuAnchor] = useState(null);

  const shouldShowAgentSelection = isAuthenticated && agents.length > 0;

  // Get localStorage key for this account
  const getLocalStorageKey = () => (account?.id ? `selected_agent_${account.id}` : null);

  // Load selected agent from localStorage on mount
  useEffect(() => {
    const storageKey = getLocalStorageKey();
    if (storageKey && agents.length > 0) {
      const savedAgentId = localStorage.getItem(storageKey);
      if (savedAgentId) {
        const foundAgent = agents.find((agent) => agent.id === savedAgentId);
        if (foundAgent) {
          setSelectedAgent(foundAgent);
        }
      }
    }
  }, [agents, account?.id]);

  // Save selected agent to localStorage when it changes
  useEffect(() => {
    const storageKey = getLocalStorageKey();
    if (storageKey && selectedAgent) {
      localStorage.setItem(storageKey, selectedAgent.id);
    }
  }, [selectedAgent, account?.id]);

  const handleAgentMenuOpen = (event) => {
    event.preventDefault();
    setAgentMenuAnchor(event.currentTarget);
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchor(null);
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    handleAgentMenuClose();
  };

  // Default agent configuration when no agent is selected
  const defaultAgent = {
    id: 'ad2b3598-a2b4-4bc5-aba9-6af5fe484951',
    name: 'Altan',
    displayAvatar: false,
  };

  // Get the effective agent configuration
  const effectiveAgent = selectedAgent || defaultAgent;

  return (
    <div className="flex flex-col items-center gap-2 max-w-4xl mx-auto">
      {/* Compact Agent Selector + Voice Conversation Row */}
      <div className="flex items-center gap-1">
        {/* Agent Selection Bubble - Left Side */}
        {shouldShowAgentSelection && !isConnected && (
          <>
            <button
              onClick={handleAgentMenuOpen}
              className="relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-ring group backdrop-blur-md bg-white/80 dark:bg-[#1c1c1c] p-1.5 h-auto border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-full hover:bg-white/70 dark:hover:bg-gray-900/70 active:bg-white/70 dark:active:bg-gray-900/70 transition-all duration-300"
            >
              <span className="w-8 h-8 flex items-center justify-center">
                {selectedAgent ? (
                  <Avatar
                    src={selectedAgent.avatar_url}
                    alt={selectedAgent.name}
                    sx={{ width: 20, height: 20 }}
                  />
                ) : (
                  <Iconify
                    icon="mdi:at"
                    sx={{ width: 20, height: 20 }}
                  />
                )}
              </span>
            </button>

            {/* Agent Menu */}
            <Popover
              open={Boolean(agentMenuAnchor)}
              anchorEl={agentMenuAnchor}
              onClose={handleAgentMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
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
                  Select an agent or create new
                </Typography>
                {/* New Agent option */}
                <MenuItem
                  onClick={() => {
                    onCreateAgent();
                    handleAgentMenuClose();
                  }}
                  sx={{
                    borderRadius: '8px',
                    margin: '2px 0',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      marginRight: 1,
                      backgroundColor: 'primary.main',
                    }}
                  >
                    <Iconify
                      icon="mdi:plus"
                      sx={{ fontSize: 16 }}
                    />
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500 }}
                  >
                    New Agent
                  </Typography>
                </MenuItem>
                {/* Existing agents */}
                {agents?.map((agent) => (
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
                      src={agent.avatar_url}
                      alt={agent.name}
                      sx={{ width: 24, height: 24, marginRight: 1 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500 }}
                    >
                      {agent.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Box>
            </Popover>
          </>
        )}

        {/* Voice Conversation Component - No Avatar */}
        <VoiceConversation
          altanAgentId={effectiveAgent.id}
          agentName={effectiveAgent.name}
          displayAvatar={false}
          dynamicVariables={effectiveAgent.dynamicVariables}
        />
      </div>
    </div>
  );
});

VoiceConversationWithAgentSelection.displayName = 'VoiceConversationWithAgentSelection';

export default VoiceConversationWithAgentSelection;
