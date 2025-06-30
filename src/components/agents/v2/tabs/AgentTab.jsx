import { Box, Typography, TextField, Select, MenuItem, FormControl, Button, Slider } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';

import { Space } from '../../../../sections/@dashboard/spaces';

const models = [
  {
    provider: 'Anthropic',
    models: [
      'claude-4-opus-latest',
      'claude-4-sonnet-latest',
      'claude-3-7-sonnet-latest',
      'claude-3-5-sonnet-latest',
      'claude-3-opus-latest',
      'claude-3-5-haiku-latest',
    ],
  },
  {
    provider: 'OpenAI',
    models: [
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'o4-mini',
      'o3',
      'o3-mini',
      'gpt-4o',
      'gpt-4o-mini',
      'o1-mini',
      'o1',
    ],
  },
  {
    provider: 'Deepseek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
];

const reasoningModels = ['o1-mini', 'o1', 'o3-mini', 'o3', 'o4-mini'];

const modelToProvider = {};
models.forEach((providerData) => {
  providerData.models.forEach((model) => {
    modelToProvider[model] = providerData.provider;
  });
});

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

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Panel: Configuration */}
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
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

            {reasoningModels.includes(llmModel) && (
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

            {/* Token Limit */}
            <Box>
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
          </Box>

          <Space
            navigate={() => console.log('navigated')}
            spaceId={agentData?.space_id}
            isPreview={true}
          />
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
