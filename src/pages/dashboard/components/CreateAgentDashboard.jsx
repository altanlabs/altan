import { Chip, Avatar, Popover, Box, Typography, MenuItem } from '@mui/material';
import { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import AgentFormWithButtons from './create/AgentFormWithButtons';
import { useAuthContext } from '../../../auth/useAuthContext';
import SendButton from '../../../components/attachment/SendButton';
import Iconify from '../../../components/iconify';
import { createAgent, selectSortedAgents } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';
import { optimai } from '../../../utils/axios';

// Agent selectors
const getAccount = (state) => state.general.account;

// Chat Mode Component
const ChatMode = memo(({ agents, isAuthenticated, handleVoice, onCreateAgent, account }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentMenuAnchor, setAgentMenuAnchor] = useState(null);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');

  const shouldShowAgentSelection = isAuthenticated && agents.length > 0;

  // Filter agents based on search term
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase()),
  );

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
    setAgentSearchTerm(''); // Reset search when opening
  };

  const handleAgentMenuClose = () => {
    setAgentMenuAnchor(null);
    setAgentSearchTerm(''); // Reset search when closing
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    handleAgentMenuClose();
  };

  const handleAgentSearchKeyDown = (event) => {
    if (event.key === 'Enter' && filteredAgents.length === 1) {
      handleAgentSelect(filteredAgents[0]);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedAgent) return;

    setLoading(true);
    try {
      const response = await optimai.get(`/agent/${selectedAgent.id}/dm`);
      const roomId = response.data.id;
      history.push(`/room/${roomId}?message=${encodeURIComponent(chatMessage)}`);
    } catch (error) {
      console.error('Error getting agent room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const canSend = chatMessage.trim() && (selectedAgent || !shouldShowAgentSelection);

  return (
    <div className="w-full px-4 pt-3 pb-3 rounded-2xl shadow-lg bg-white dark:bg-[#1c1c1c]">
      <textarea
        value={chatMessage}
        onChange={(e) => setChatMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything or describe what you need help with..."
        className="w-full bg-transparent min-h-[24px] max-h-[200px] focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-500/80 resize-none mb-3"
        style={{ fontSize: '16px' }}
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Agent Selection Chip */}
          {shouldShowAgentSelection && (
            <Chip
              avatar={
                selectedAgent ? (
                  <Avatar
                    src={selectedAgent.avatar_url}
                    alt={selectedAgent.name}
                    sx={{ width: 20, height: 20 }}
                  />
                ) : undefined
              }
              icon={!selectedAgent ? <Iconify icon="mdi:at" /> : undefined}
              label={selectedAgent ? selectedAgent.name : `${agents.length} agents`}
              size="small"
              variant="soft"
              color="default"
              onClick={handleAgentMenuOpen}
              onDelete={selectedAgent ? () => setSelectedAgent(null) : undefined}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              sx={{
                borderRadius: '12px',
                fontSize: '0.75rem',
                height: '28px',
                '& .MuiChip-icon': {
                  fontSize: '14px',
                  marginLeft: '4px',
                },
              }}
            />
          )}

          {/* Create Agent Chip */}
          {isAuthenticated && (
            <Chip
              icon={<Iconify icon="mdi:plus" />}
              label="Create Agent"
              size="small"
              variant="outlined"
              color="default"
              onClick={onCreateAgent}
              className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
              sx={{
                borderRadius: '12px',
                fontSize: '0.75rem',
                height: '28px',
                '& .MuiChip-icon': {
                  fontSize: '14px',
                  marginLeft: '4px',
                },
              }}
            />
          )}

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
              {/* Search input */}
              <input
                type="text"
                placeholder="Search agents..."
                value={agentSearchTerm}
                onChange={(e) => setAgentSearchTerm(e.target.value)}
                onKeyDown={handleAgentSearchKeyDown}
                autoFocus
                className="w-full px-2 py-1 mb-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
              />
              {/* Existing agents */}
              {filteredAgents?.map((agent) => (
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
        </div>

        <div className="flex items-center gap-2">
          {/* Voice input button */}
          <button
            onClick={handleVoice}
            disabled={loading}
            className="flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2"></path>
            </svg>
          </button>

          {/* Send button */}
          {canSend && (
            <SendButton
              onSendMessage={handleSendMessage}
              isDisabled={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
});

ChatMode.displayName = 'ChatMode';

// Create Mode Component
const CreateMode = memo(({ handleVoice, onGoBack }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(false);

  // Agent form data
  const [formData, setFormData] = useState({
    agentType: '',
    goal: '',
    industry: '',
    name: '',
    voice: null,
    useCase: '',
  });

  // Agent types and configurations
  const agentTypes = ['Personal Assistant', 'Business Agent'];
  const personalAssistantGoals = [
    'Personal Assistant',
    'Learning Companion',
    'Creative Helper',
    'Health & Wellness',
    'Task Management',
    'Research Assistant',
  ];
  const industries = [
    'Retail & E-commerce',
    'Healthcare & Medical',
    'Finance & Banking',
    'Real Estate',
    'Education & Training',
    'Hospitality & Travel',
    'Automotive',
    'Professional Services',
    'Technology & Software',
    'Government & Public',
    'Food & Beverage',
    'Manufacturing',
    'Fitness & Wellness',
    'Legal Services',
    'Non-Profit',
    'Media & Entertainment',
  ];

  const industryGoalsMap = {
    'Retail & E-commerce': ['Customer Support', 'Outbound Sales', 'Product Recommendations'],
    'Healthcare & Medical': ['Appointment Scheduling', 'Patient Intake', 'Symptom Guidance'],
    'Finance & Banking': ['Account Inquiries', 'Loan Applications', 'Investment Guidance'],
    'Real Estate': ['Property Search', 'Viewing Appointments', 'Market Information'],
    'Education & Training': ['Student Enrollment', 'Course Recommendations', 'Tutoring Support'],
    'Hospitality & Travel': ['Reservation Management', 'Concierge Services', 'Travel Planning'],
    Automotive: ['Service Scheduling', 'Vehicle Diagnostics', 'Parts Ordering'],
    'Professional Services': ['Consultation Booking', 'Client Intake', 'Service Recommendations'],
    'Technology & Software': ['Technical Support', 'Product Demos', 'User Onboarding'],
    'Government & Public': ['Citizen Services', 'Permit Applications', 'Public Information'],
    'Food & Beverage': ['Order Taking', 'Reservation Management', 'Menu Recommendations'],
    Manufacturing: ['Inventory Management', 'Quality Control', 'Production Planning'],
    'Fitness & Wellness': ['Class Booking', 'Workout Planning', 'Nutrition Guidance'],
    'Legal Services': ['Consultation Scheduling', 'Case Intake', 'Legal Resources'],
    'Non-Profit': ['Volunteer Coordination', 'Donation Processing', 'Program Information'],
    'Media & Entertainment': [
      'Content Recommendations',
      'Subscription Management',
      'Fan Engagement',
    ],
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset dependent fields when agent type changes
  useEffect(() => {
    if (formData.agentType === 'Personal Assistant') {
      setFormData((prev) => ({
        ...prev,
        industry: '',
        goal: '',
      }));
    } else if (formData.agentType === 'Business Agent') {
      setFormData((prev) => ({
        ...prev,
        goal: '',
      }));
    }
  }, [formData.agentType]);

  // Reset goal when industry changes for business agents
  useEffect(() => {
    if (formData.agentType === 'Business Agent' && formData.industry) {
      setFormData((prev) => ({
        ...prev,
        goal: '',
      }));
    }
  }, [formData.industry, formData.agentType]);

  const getAvailableGoals = () => {
    if (formData.agentType === 'Personal Assistant') {
      return personalAssistantGoals;
    } else if (formData.agentType === 'Business Agent' && formData.industry) {
      return industryGoalsMap[formData.industry] || [];
    }
    return [];
  };

  const isFormValid = () => {
    const baseValid = formData.agentType && formData.goal && formData.name && formData.useCase;
    if (formData.agentType === 'Business Agent') {
      return baseValid && formData.industry;
    }
    return baseValid;
  };

  const handleCreate = async () => {
    if (!isAuthenticated) {
      history.push('/auth/register');
      return;
    }

    if (!formData.useCase.trim()) {
      return;
    }

    setLoading(true);
    try {
      const enhancementResponse = await fetch('https://api.altan.ai/galaxia/hook/IrrJw9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.useCase,
        }),
      });

      if (!enhancementResponse.ok) {
        throw new Error('Failed to enhance agent prompt');
      }

      const enhancementData = await enhancementResponse.json();
      const agentName = enhancementData.name || formData.name || 'AI Assistant';
      const prompt =
        enhancementData.prompt ||
        `You are a helpful AI assistant. Your goal is to assist users based on: ${formData.useCase}`;
      const description =
        enhancementData.description ||
        formData.useCase.substring(0, 100) + (formData.useCase.length > 100 ? '...' : '');

      const agentData = {
        name: agentName,
        prompt: prompt,
        description: description,
        voice: formData.voice
          ? {
              name: formData.voice.name,
              voice_id: formData.voice.voice_id,
              model_id: 'eleven_flash_v2',
              agent_output_audio_format: 'pcm_16000',
              optimize_streaming_latency: 4,
              stability: 0.5,
              speed: 1,
              similarity_boost: 0.8,
            }
          : null,
        meta_data: {
          agent_type: formData.agentType || 'General Assistant',
          goal: formData.goal || 'Assist users',
          industry: formData.industry || null,
          use_case: formData.useCase,
          voice_name: formData.voice?.name || null,
          created_from: 'dashboard',
          enhanced: true,
        },
      };

      const newAgent = await dispatch(createAgent(agentData));
      history.push(`/agent/${newAgent.id}`);
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Back button */}
      <div className="flex items-center mb-4">
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <Iconify
            icon="eva:arrow-ios-back-fill"
            width={16}
            height={16}
          />
          Back to chat
        </button>
      </div>

      <AgentFormWithButtons
        formData={formData}
        handleInputChange={handleInputChange}
        handleCreate={handleCreate}
        loading={loading}
        handleVoice={handleVoice}
        agentTypes={agentTypes}
        industries={industries}
        availableGoals={getAvailableGoals()}
        isFormValid={isFormValid()}
        shouldShowAgentSelection={false}
        onAgentSelect={() => {}}
        onNewAgentClick={() => {}}
        agents={[]}
        selectedAgent={null}
        setSelectedAgent={() => {}}
        agentMenuAnchor={null}
        handleAgentMenuOpen={() => {}}
        handleAgentMenuClose={() => {}}
      />
    </div>
  );
});

CreateMode.displayName = 'CreateMode';

// Main Component
function CreateAgentDashboard({ handleVoice }) {
  const { isAuthenticated } = useAuthContext();
  const agents = useSelector(selectSortedAgents);
  const account = useSelector(getAccount);
  const history = useHistory();
  const location = useLocation();

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const modeFromUrl = searchParams.get('mode');

  // For unauthenticated users, always default to 'create' mode
  const defaultMode = isAuthenticated ? (modeFromUrl || 'chat') : 'create';
  const [mode, setMode] = useState(defaultMode);

  // Update URL when mode changes
  const updateMode = (newMode) => {
    // Don't allow unauthenticated users to switch to chat mode
    if (!isAuthenticated && newMode === 'chat') {
      return;
    }
    setMode(newMode);
    const newSearchParams = new URLSearchParams(location.search);
    if (newMode === 'chat') {
      newSearchParams.delete('mode');
    } else {
      newSearchParams.set('mode', newMode);
    }
    const newSearch = newSearchParams.toString();
    history.replace({
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : '',
    });
  };

  // Initialize mode from URL on mount, but respect authentication status
  useEffect(() => {
    if (isAuthenticated && modeFromUrl && modeFromUrl !== mode) {
      setMode(modeFromUrl);
    } else if (!isAuthenticated && mode !== 'create') {
      setMode('create');
    }
  }, [modeFromUrl, mode, isAuthenticated]);

  return (
    <div className="w-full max-w-[750px] mx-auto">
      <div className="text-center">
        <div
          data-aos="fade-down"
          data-aos-delay="200"
        >
          <div className="relative flex flex-col mt-2">
            {mode === 'chat' ? (
              <ChatMode
                agents={agents}
                isAuthenticated={isAuthenticated}
                handleVoice={handleVoice}
                onCreateAgent={() => updateMode('create')}
                account={account}
              />
            ) : (
              <CreateMode
                handleVoice={handleVoice}
                onGoBack={() => updateMode('chat')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CreateAgentDashboard);
