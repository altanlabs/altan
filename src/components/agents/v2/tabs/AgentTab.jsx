import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Typography, TextField, Select, MenuItem, FormControl, Button, Slider, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';

const models = [
  {
    provider: 'Anthropic',
    models: [
      'claude-4-1-opus-latest',
      'claude-4-5-sonnet-latest',
      'claude-4-5-haiku-latest',
    ],
  },
  {
    provider: 'OpenAI',
    models: [
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-nano',
      'o4-mini',
      'o3',
      'o3-mini',
      'o4-mini-deep-research',
    ],
  },
  {
    provider: 'Deepseek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
];

// Models that always have reasoning enabled
const alwaysReasoningModels = [
  'o1-mini',
  'o1',
  'o3-mini',
  'o3',
  'o4-mini',
];

// Models that support optional reasoning (can be enabled/disabled)
const optionalReasoningModels = [
  'gpt-5',
  'claude-4-1-opus-latest',
  'claude-4-opus-latest',
  'claude-4-5-sonnet-latest',
  'claude-4-sonnet-latest',
];

const modelToProvider = {};
models.forEach((providerData) => {
  providerData.models.forEach((model) => {
    modelToProvider[model] = providerData.provider;
  });
});

const betaHeaderOptions = [
  'message-batches-2024-09-24',
  'prompt-caching-2024-07-31',
  'computer-use-2024-10-22',
  'computer-use-2025-01-24',
  'pdfs-2024-09-25',
  'token-counting-2024-11-01',
  'token-efficient-tools-2025-02-19',
  'output-128k-2025-02-19',
  'files-api-2025-04-14',
  'mcp-client-2025-04-04',
  'dev-full-thinking-2025-05-14',
  'interleaved-thinking-2025-05-14',
  'code-execution-2025-05-22',
  'extended-cache-ttl-2025-04-11',
  'context-1m-2025-08-07',
];

function AgentTab({ agentData, onFieldChange }) {
  const [systemPrompt, setSystemPrompt] = useState(agentData?.prompt || 'I am a helpful assistant');

  const [llmModel, setLlmModel] = useState(agentData?.llm_config?.model_id || 'o3-mini');
  const [temperature, setTemperature] = useState(
    agentData?.llm_config?.settings?.temperature ?? 0.7,
  );
  const [tokenLimit, setTokenLimit] = useState(agentData?.llm_config?.settings?.token_limit ?? -1);
  const [reasoningEffort, setReasoningEffort] = useState(
    agentData?.llm_config?.settings?.reasoning_effort || 'medium',
  );
  const [reasoningEnabled, setReasoningEnabled] = useState(
    agentData?.llm_config?.settings?.reasoning_enabled ?? false,
  );
  const [betaHeaders, setBetaHeaders] = useState(
    agentData?.llm_config?.settings?.beta_headers ?? [],
  );

  const handleSystemPromptChange = (value) => {
    setSystemPrompt(value);
    onFieldChange('prompt', value);
  };

  const handleModelChange = (newModel) => {
    const newProvider = modelToProvider[newModel];
    setLlmModel(newModel);
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      model_id: newModel,
      provider: newProvider,
    });
  };

  const handleTemperatureChange = (value) => {
    setTemperature(value);
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, temperature: value },
    });
  };

  const handleTokenLimitChange = (value) => {
    const intValue = parseInt(value, 10) || -1;
    setTokenLimit(intValue);
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, token_limit: intValue },
    });
  };

  const handleReasoningEffortChange = (value) => {
    setReasoningEffort(value);
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, reasoning_effort: value },
    });
  };

  const handleReasoningEnabledChange = (enabled) => {
    setReasoningEnabled(enabled);
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, reasoning_enabled: enabled },
    });
  };

  const handleBetaHeadersChange = (event) => {
    const value = event.target.value;
    setBetaHeaders(typeof value === 'string' ? value.split(',') : value);
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, beta_headers: typeof value === 'string' ? value.split(',') : value },
    });
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Panel: Configuration */}
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* System Prompt */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
              System prompt
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              The system prompt is used to determine the persona of the agent and the context of the
              conversation.
            </Typography>

            <TextField
              multiline
              rows={12}
              fullWidth
              value={systemPrompt}
              onChange={(e) => handleSystemPromptChange(e.target.value)}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>

          {/* LLM Configuration */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>
              LLM
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Select which provider and model to use for the LLM. If your chosen LLM is not
              available at the moment or something goes wrong, we will redirect the conversation to
              another LLM.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                size="small"
                value={llmModel}
                onChange={(e) => handleModelChange(e.target.value)}
              >
                {models.map((providerGroup) => [
                  <MenuItem key={`header-${providerGroup.provider}`} disabled sx={{ fontWeight: 'bold' }}>
                    {providerGroup.provider}
                  </MenuItem>,
                  ...providerGroup.models.map((model) => (
                    <MenuItem key={model} value={model} sx={{ pl: 3 }}>
                      {model}
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>

            {/* Optional Reasoning Toggle (for GPT-5 and Claude models) */}
            {optionalReasoningModels.includes(llmModel) && (
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reasoningEnabled}
                      onChange={(e) => handleReasoningEnabledChange(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                        Enable Reasoning
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Enable extended thinking for more complex reasoning tasks
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            )}

            {/* Reasoning Effort Controls */}
            {(alwaysReasoningModels.includes(llmModel) ||
              (optionalReasoningModels.includes(llmModel) && reasoningEnabled)) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1 }}>
                  Reasoning Effort
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Controls the amount of reasoning the model applies. Higher effort can lead to
                  better quality answers on complex tasks, but may increase latency.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['low', 'medium', 'high'].map((effort) => (
                    <Button
                      key={effort}
                      onClick={() => handleReasoningEffortChange(effort)}
                      variant={reasoningEffort === effort ? 'contained' : 'outlined'}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        color: reasoningEffort === effort ? undefined : 'text.secondary',
                      }}
                    >
                      {effort}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Temperature */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1 }}>
                Temperature
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Temperature is a parameter that controls the creativity or randomness of the
                responses generated by the LLM.
              </Typography>

              <Box sx={{ px: 1 }}>
                <Slider
                  value={temperature}
                  onChange={(e, value) => handleTemperatureChange(value)}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0, label: 'Deterministic' },
                    { value: 0.5, label: '0.5' },
                    { value: 1, label: 'Creative' },
                  ]}
                  sx={{
                    mb: 2,
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      '&[data-index="0"]': {
                        transform: 'translateX(-25%)',
                      },
                      '&[data-index="2"]': {
                        transform: 'translateX(-75%)',
                      },
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: 'divider',
                      height: 8,
                      width: 2,
                    },
                    '& .MuiSlider-track': {
                      height: 6,
                    },
                    '& .MuiSlider-rail': {
                      height: 6,
                      opacity: 0.3,
                    },
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Advanced Settings */}
            <Accordion
              sx={{
                boxShadow: 'none',
                '&:before': { display: 'none' },
                border: 1,
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&:first-of-type': {
                  borderRadius: '8px !important',
                },
                '&:last-of-type': {
                  borderRadius: '8px !important',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    my: 1,
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                  Advanced
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {/* Token Limit */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1 }}>
                    Limit token usage
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Configure the maximum number of tokens that the LLM can predict. A limit will be
                    applied if the value is greater than 0.
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    fullWidth
                    value={tokenLimit}
                    onChange={(e) => handleTokenLimitChange(e.target.value)}
                  />
                </Box>

                {/* Beta Headers - Only for Anthropic */}
                {agentData?.llm_config?.provider?.toLowerCase() === 'anthropic' && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1 }}>
                      Beta Headers
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Enable experimental Anthropic beta features for this agent
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        multiple
                        size="small"
                        value={betaHeaders}
                        onChange={handleBetaHeadersChange}
                        input={<OutlinedInput />}
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        }}
                      >
                        {betaHeaderOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            <Checkbox checked={betaHeaders.indexOf(option) > -1} />
                            <ListItemText primary={option} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

AgentTab.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default memo(AgentTab);
