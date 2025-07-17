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

const VoiceConversationWithAgentSelection = memo(() => {
  const { isAuthenticated } = useAuthContext();
  const agents = useSelector(selectSortedAgents);
  const account = useSelector(getAccount);
  const { isConnected } = useVoiceConversation();

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentMenuAnchor, setAgentMenuAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

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

  // Filter agents based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAgents(agents || []);
    } else {
      const filtered = (agents || []).filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredAgents(filtered);
    }
    setFocusedIndex(-1);
  }, [searchQuery, agents]);

  const handleAgentMenuOpen = (event) => {
    event.preventDefault();
    setAgentMenuAnchor(event.currentTarget);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchor(null);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    handleAgentMenuClose();
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex((prev) =>
        prev < filteredAgents.length - 1 ? prev + 1 : 0,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredAgents.length - 1,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (focusedIndex >= 0 && filteredAgents[focusedIndex]) {
        handleAgentSelect(filteredAgents[focusedIndex]);
      } else if (filteredAgents.length > 0) {
        handleAgentSelect(filteredAgents[0]);
      }
    } else if (event.key === 'Escape') {
      handleAgentMenuClose();
    }
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
                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search agents..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 mb-2"
                  autoFocus
                />

                {/* Filtered agents */}
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredAgents.length > 0 ? (
                    filteredAgents.map((agent, index) => (
                      <MenuItem
                        key={agent.id}
                        onClick={() => handleAgentSelect(agent)}
                        sx={{
                          borderRadius: '8px',
                          margin: '2px 0',
                          backgroundColor: focusedIndex === index ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
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
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        px: 2,
                        py: 1,
                        color: 'text.secondary',
                        textAlign: 'center',
                      }}
                    >
                      No agents found
                    </Typography>
                  )}
                </div>
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
