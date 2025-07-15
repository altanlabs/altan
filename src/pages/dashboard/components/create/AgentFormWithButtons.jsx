import { Icon } from '@iconify/react';
import { Chip, Avatar, Popover, Box, Typography, MenuItem } from '@mui/material';
import { m } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';

import { TextShimmer } from '../../../../components/aceternity/text/text-shimmer';
import VoiceSelector from '../../../../components/agents/v2/components/VoiceSelector';
import Iconify from '../../../../components/iconify';

function AgentFormWithButtons({
  formData,
  handleInputChange,
  handleCreate,
  loading,
  handleVoice,
  agentTypes,
  industries,
  availableGoals,
  shouldShowAgentSelection,
  onAgentSelect,
  onNewAgentClick,
  agents,
  selectedAgent,
  setSelectedAgent,
  agentMenuAnchor,
  handleAgentMenuOpen,
  handleAgentMenuClose,
}) {
  const textareaRef = useRef(null);
  const [isStructuredMode, setIsStructuredMode] = useState(true);
  const [activeField, setActiveField] = useState(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(24, textarea.scrollHeight)}px`;
    }
  }, []);

  // Generate the structured sentence
  const generateStructuredText = () => {
    let text = 'Create a ';

    if (formData.agentType) {
      text += formData.agentType;
    } else {
      text += '[Agent Type]';
    }

    // For Business Agent, show industry first, then goal
    if (formData.agentType === 'Business Agent') {
      text += ' for the ';

      if (formData.industry) {
        text += formData.industry;
      } else {
        text += '[Industry]';
      }

      text += ' industry that helps me with ';

      if (formData.goal) {
        text += formData.goal.toLowerCase();
      } else {
        text += '[Goal]';
      }
    } else {
      // For Personal Assistant, show goal first
      text += ' that helps me with ';

      if (formData.goal) {
        text += formData.goal.toLowerCase();
      } else {
        text += '[Goal]';
      }
    }

    text += '. The agent is named ';

    if (formData.name) {
      text += formData.name;
    } else {
      text += '[Agent Name]';
    }

    text += ' with ';

    if (formData.voice) {
      text += formData.voice.name;
    } else {
      text += '[Voice]';
    }

    text += ' voice.';

    return text;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [formData.useCase, adjustTextareaHeight]);

  // Update useCase when in structured mode and form data changes
  useEffect(() => {
    if (isStructuredMode) {
      const structuredText = generateStructuredText();
      if (formData.useCase !== structuredText) {
        handleInputChange('useCase', structuredText);
      }
    }
  }, [isStructuredMode, formData.agentType, formData.goal, formData.industry, formData.name]);

  const handleSubmit = () => {
    handleCreate();
  };

  // Check if the form is ready for submission
  const isFormReady = () => {
    if (isStructuredMode) {
      // In structured mode, check if required fields are filled
      if (!formData.agentType) return false;
      if (!formData.goal) return false;
      if (formData.agentType === 'Business Agent' && !formData.industry) return false;
      // Agent name is optional, so we don't require it
      return true;
    } else {
      // In text mode, check if there's content in useCase
      return formData.useCase.trim().length > 0;
    }
  };

  // Check if form is ready for agent selection
  const isAgentSelectionReady = () => {
    return formData.useCase.trim().length > 0;
  };

  // Toggle between structured and free-form mode
  const toggleMode = () => {
    if (isStructuredMode) {
      // Switch to free-form - generate the full structured text and put it in the textarea
      setIsStructuredMode(false);
      setActiveField(null);
      const structuredText = generateStructuredText();
      handleInputChange('useCase', structuredText);
    } else {
      // Switch to structured - keep the current form data
      setIsStructuredMode(true);
      // Don't change the useCase text, just change the display mode
    }
  };

  // Handle clicking on bracketed fields
  const handleFieldClick = (fieldType, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = event.currentTarget.closest('.relative').getBoundingClientRect();

    setActiveField({
      type: fieldType,
      position: {
        top: rect.bottom - containerRect.top,
        left: rect.left - containerRect.left,
        width: rect.width,
      },
    });
  };

  // Render clickable structured text
  const renderStructuredDisplay = () => {
    const parts = [];

    parts.push('Create a ');

    // Agent Type - Always clickable
    parts.push(
      <button
        key="agentType"
        onClick={(e) => handleFieldClick('agentType', e)}
        className={`inline-flex items-center px-2 py-0.5 mx-1 text-sm font-medium rounded transition-colors ${
          formData.agentType
            ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
            : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
        }`}
      >
        {formData.agentType || 'Agent Type'}
        <Icon
          icon="mdi:chevron-down"
          className="ml-1 w-4 h-4"
        />
      </button>,
    );

    // For Business Agent, show industry first, then goal
    if (formData.agentType === 'Business Agent') {
      parts.push(' for the ');

      // Industry - Always clickable for Business Agent
      parts.push(
        <button
          key="industry"
          onClick={(e) => handleFieldClick('industry', e)}
          className={`inline-flex items-center px-2 py-0.5 mx-1 text-sm font-medium rounded transition-colors ${
            formData.industry
              ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
              : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
        >
          {formData.industry || 'Industry'}
          <Icon
            icon="mdi:chevron-down"
            className="ml-1 w-4 h-4"
          />
        </button>,
      );

      parts.push(' industry that helps me with ');

      // Goal - Only clickable if industry is selected for Business Agent
      if (formData.industry) {
        parts.push(
          <button
            key="goal"
            onClick={(e) => handleFieldClick('goal', e)}
            className={`inline-flex items-center px-2 py-0.5 mx-1 text-sm font-medium rounded transition-colors ${
              formData.goal
                ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
                : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
            }`}
          >
            {formData.goal || 'Goal'}
            <Icon
              icon="mdi:chevron-down"
              className="ml-1 w-4 h-4"
            />
          </button>,
        );
      } else {
        parts.push(
          <span className="inline-flex items-center px-2 py-0.5 mx-1 text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded">
            Goal
          </span>,
        );
      }
    } else {
      // For Personal Assistant, show goal first
      parts.push(' that helps me with ');

      // Goal - Always clickable for Personal Assistant
      parts.push(
        <button
          key="goal"
          onClick={(e) => handleFieldClick('goal', e)}
          className={`inline-flex items-center px-2 py-0.5 mx-1 text-sm font-medium rounded transition-colors ${
            formData.goal
              ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
              : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
        >
          {formData.goal || 'Goal'}
          <Icon
            icon="mdi:chevron-down"
            className="ml-1 w-4 h-4"
          />
        </button>,
      );
    }

    parts.push('. The agent is named ');

    // Agent Name - Always clickable
    parts.push(
      <button
        key="name"
        onClick={(e) => handleFieldClick('name', e)}
        className={`inline-flex items-center px-2 py-0.5 mx-1 text-sm font-medium rounded transition-colors ${
          formData.name
            ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
            : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
        }`}
      >
        {formData.name || 'Agent Name'}
        <Icon
          icon="mdi:chevron-down"
          className="ml-1 w-4 h-4"
        />
      </button>,
    );

    parts.push(' with ');

    // Voice - Always clickable
    parts.push(
      <button
        key="voice"
        onClick={(e) => handleFieldClick('voice', e)}
        className={`inline-flex items-center px-2 py-0.5 mx-1 text-sm font-medium rounded transition-colors ${
          formData.voice
            ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
            : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
        }`}
      >
        {formData.voice?.name || 'Voice'}
        <Icon
          icon="mdi:chevron-down"
          className="ml-1 w-4 h-4"
        />
      </button>,
    );

    parts.push(' voice.');

    return parts;
  };

  // Render the textarea with clickable fields in structured mode
  const renderStructuredInput = () => {
    if (!isStructuredMode) {
      return (
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent min-h-[24px] max-h-[200px] focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-500/80 resize-none mb-1"
          placeholder="Describe your agent..."
          value={formData.useCase}
          onChange={(e) => {
            handleInputChange('useCase', e.target.value);
            adjustTextareaHeight();
          }}
        />
      );
    }

    return (
      <div className="relative">
        <div className="w-full min-h-[24px] max-h-[200px] text-gray-900 dark:text-gray-100 mb-1 leading-6">
          {renderStructuredDisplay()}
        </div>

        {/* Dropdown overlays for active fields */}
        {activeField && (
          <div
            className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 mt-1"
            style={{
              top: activeField.position?.top || 0,
              left: activeField.position?.left || 0,
              minWidth: Math.max(200, activeField.position?.width || 200),
            }}
          >
            {activeField.type === 'agentType' && (
              <div className="p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Agent Type</div>
                {agentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      handleInputChange('agentType', type);
                      setActiveField(null);
                    }}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            {activeField.type === 'industry' && (
              <div className="p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Industry</div>
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => {
                      handleInputChange('industry', industry);
                      setActiveField(null);
                    }}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {industry}
                  </button>
                ))}
              </div>
            )}

            {activeField.type === 'goal' && (
              <div className="p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Goal</div>
                {availableGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => {
                      handleInputChange('goal', goal);
                      setActiveField(null);
                    }}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            )}

            {activeField.type === 'name' && (
              <div className="p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Agent Name</div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter agent name..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
            )}

            {activeField.type === 'voice' && (
              <div className="p-2" style={{ minWidth: '320px' }}>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Agent Voice</div>
                <VoiceSelector
                  value={formData.voice}
                  onChange={(voice) => {
                    handleInputChange('voice', voice);
                    setActiveField(null);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Click outside to close dropdown */}
        {activeField && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActiveField(null)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="w-full px-4 pt-3 pb-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary shadow-lg bg-white dark:bg-[#1c1c1c]">
        {renderStructuredInput()}

        {/* Buttons section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Structured mode toggle button */}
            <button
              onClick={toggleMode}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
              title={isStructuredMode ? 'Switch to free form' : 'Use structured form'}
            >
              <Icon
                icon={isStructuredMode ? 'mdi:form-textbox' : 'mdi:form-select'}
                className="w-5 h-5 text-slate-700 dark:text-white"
              />
            </button>

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
                label={
                  selectedAgent
                    ? selectedAgent.name
                    : `${agents?.length || 0} agents`
                }
                size="small"
                variant="outlined"
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
                  Select an agent or create new
                </Typography>
                {/* New Agent option */}
                <MenuItem
                  onClick={onNewAgentClick}
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
                    <Iconify icon="mdi:plus" sx={{ fontSize: 16 }} />
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
                    onClick={() => onAgentSelect(agent)}
                    disabled={!isAgentSelectionReady()}
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

            {/* Mode indicator */}
            {isStructuredMode && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Click the fields to customize
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Voice input button */}
            <m.button
              whileTap={{ scale: 0.95 }}
              onClick={!isFormReady() ? handleVoice : handleSubmit}
              disabled={loading}
              className={`
                relative inline-flex items-center justify-center
                ${!isFormReady() && !loading ? 'w-10 h-10 rounded-full' : 'min-w-[120px] rounded-2xl px-2 py-1'}
                text-base font-medium tracking-tight
                transition-all duration-300 ease-in-out
                backdrop-blur-lg
                text-slate-900 dark:text-slate-100
                shadow-md dark:shadow-lg

                hover:bg-white/90 dark:hover:bg-slate-700/70
                hover:shadow-xl dark:hover:shadow-sm dark:hover:shadow-white/40
                hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-600

                active:scale-[0.97] active:ring-2 active:ring-blue-400/50
                focus:outline-none focus:ring-2 focus:ring-blue-400/50

                bg-white dark:bg-black
                disabled:opacity-40
                disabled:bg-slate-300/70 dark:disabled:bg-slate-700/50
                disabled:text-slate-500 dark:disabled:text-slate-400
                disabled:cursor-not-allowed disabled:shadow-none
              `}
            >
              {/* Voice input when no text */}
              {!isFormReady() && !loading && (
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
              )}

              {/* Create Agent button when there is text */}
              {isFormReady() && !loading && (
                <>
                  <span className="opacity-100 transition-opacity duration-200">Create Agent</span>
                  <Icon
                    icon="noto:sparkles"
                    className="ml-2 text-lg transition-opacity duration-300"
                  />
                </>
              )}

              {/* Loading state */}
              {loading && (
                <TextShimmer
                  className="text-md font-medium tracking-tight"
                  duration={2}
                >
                  Creating Agent...
                </TextShimmer>
              )}
            </m.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentFormWithButtons;
