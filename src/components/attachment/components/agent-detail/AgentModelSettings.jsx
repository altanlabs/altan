import {
  Box,
  Typography,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Switch,
  FormControlLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormControl,
} from '@mui/material';
import { memo, useState } from 'react';

import Iconify from '../../../iconify/Iconify';

const models = [
  { provider: 'Anthropic', models: ['claude-4-1-opus-latest', 'claude-4-opus-latest', 'claude-4-5-sonnet-latest', 'claude-4-sonnet-latest'] },
  { provider: 'OpenAI', models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'o4-mini', 'o3', 'o3-mini', 'o4-mini-deep-research'] },
  { provider: 'Deepseek', models: ['deepseek-chat', 'deepseek-reasoner'] },
];

const modelToProvider = {};
models.forEach((providerData) => {
  providerData.models.forEach((model) => {
    modelToProvider[model] = providerData.provider;
  });
});

const alwaysReasoningModels = ['o1-mini', 'o1', 'o3-mini', 'o3', 'o4-mini'];
const optionalReasoningModels = ['gpt-5', 'claude-4-1-opus-latest', 'claude-4-opus-latest', 'claude-4-5-sonnet-latest', 'claude-4-sonnet-latest'];

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

const AgentModelSettings = ({ agentData, onFieldChange }) => {
  const [expanded, setExpanded] = useState(false);
  
  const llmModel = agentData?.llm_config?.model_id || 'o3-mini';
  const provider = agentData?.llm_config?.provider || modelToProvider[llmModel];
  const temperature = agentData?.llm_config?.settings?.temperature ?? 0.7;
  const tokenLimit = agentData?.llm_config?.settings?.token_limit ?? -1;
  const reasoningEffort = agentData?.llm_config?.settings?.reasoning_effort || 'medium';
  const reasoningEnabled = agentData?.llm_config?.settings?.reasoning_enabled ?? false;
  const betaHeaders = agentData?.llm_config?.settings?.beta_headers ?? [];

  const handleModelChange = (newModel) => {
    const newProvider = modelToProvider[newModel];
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      model_id: newModel,
      provider: newProvider,
    });
  };

  const handleReasoningEnabledChange = (enabled) => {
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, reasoning_enabled: enabled },
    });
  };

  const handleReasoningEffortChange = (effort) => {
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, reasoning_effort: effort },
    });
  };

  const handleBetaHeadersChange = (event) => {
    const value = event.target.value;
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: {
        ...agentData.llm_config?.settings,
        beta_headers: typeof value === 'string' ? value.split(',') : value,
      },
    });
  };

  const showReasoningControls = alwaysReasoningModels.includes(llmModel) || 
    (optionalReasoningModels.includes(llmModel) && reasoningEnabled);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        boxShadow: 'none',
        '&:before': { display: 'none' },
        '& .MuiAccordionSummary-root': {
          minHeight: 64,
        },
      }}
    >
      <AccordionSummary sx={{ px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:brain" width={20} sx={{ color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Model
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {provider} · {llmModel}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={0.5} sx={{ mr: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {showReasoningControls && (
              <Chip
                label={reasoningEffort}
                size="small"
                icon={<Iconify icon="mdi:brain-outline" width={12} />}
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: 'warning.lighter',
                  color: 'warning.darker',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}
              />
            )}
            {betaHeaders.length > 0 && (
              <Chip
                label={betaHeaders.length}
                size="small"
                icon={<Iconify icon="mdi:beta" width={12} />}
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: 'info.lighter',
                  color: 'info.darker',
                  fontWeight: 500,
                }}
              />
            )}
            <Chip
              label={temperature.toFixed(1)}
              size="small"
              icon={<Iconify icon="mdi:thermometer" width={12} />}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                bgcolor: 'grey.200',
                color: 'text.secondary',
                fontWeight: 500,
              }}
            />
          </Stack>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
        <Stack spacing={2}>
          {/* Model Selection */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
              MODEL
            </Typography>
            <Select
              size="small"
              value={llmModel}
              onChange={(e) => handleModelChange(e.target.value)}
              fullWidth
              sx={{ fontSize: '0.875rem' }}
            >
              {models.map((providerGroup) => [
                <MenuItem key={`header-${providerGroup.provider}`} disabled sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                  {providerGroup.provider}
                </MenuItem>,
                ...providerGroup.models.map((model) => (
                  <MenuItem key={model} value={model} sx={{ pl: 3, fontSize: '0.875rem' }}>
                    {model}
                  </MenuItem>
                )),
              ])}
            </Select>
          </Box>

          {/* Optional Reasoning Toggle */}
          {optionalReasoningModels.includes(llmModel) && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={reasoningEnabled}
                  onChange={(e) => handleReasoningEnabledChange(e.target.checked)}
                />
              }
              label={
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  Enable extended thinking
                </Typography>
              }
            />
          )}

          {/* Reasoning Effort */}
          {showReasoningControls && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                REASONING EFFORT
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {['low', 'medium', 'high'].map((effort) => (
                  <Chip
                    key={effort}
                    label={effort}
                    size="small"
                    onClick={() => handleReasoningEffortChange(effort)}
                    sx={{
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontSize: '0.75rem',
                      bgcolor: reasoningEffort === effort ? 'primary.main' : 'action.hover',
                      color: reasoningEffort === effort ? 'primary.contrastText' : 'text.secondary',
                      '&:hover': {
                        bgcolor: reasoningEffort === effort ? 'primary.dark' : 'action.selected',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Token Limit */}
          {tokenLimit > 0 && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                TOKEN LIMIT
              </Typography>
              <Chip
                label={`${tokenLimit.toLocaleString()} tokens max`}
                size="small"
                icon={<Iconify icon="mdi:text-box-outline" width={12} />}
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  bgcolor: 'grey.200',
                  color: 'text.primary',
                  fontWeight: 500,
                }}
              />
            </Box>
          )}

          {/* Beta Headers - Only for Anthropic */}
          {provider?.toLowerCase() === 'anthropic' && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                BETA FEATURES
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  multiple
                  value={betaHeaders}
                  onChange={handleBetaHeadersChange}
                  input={<OutlinedInput />}
                  renderValue={(selected) =>
                    selected.length === 0 ? (
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        Select features
                      </Typography>
                    ) : (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {selected.slice(0, 2).map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: 'info.lighter',
                              color: 'info.darker',
                            }}
                          />
                        ))}
                        {selected.length > 2 && (
                          <Chip
                            label={`+${selected.length - 2}`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: 'grey.300',
                              color: 'text.secondary',
                            }}
                          />
                        )}
                      </Stack>
                    )
                  }
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 300 },
                    },
                  }}
                  sx={{ fontSize: '0.875rem' }}
                >
                  {betaHeaderOptions.map((option) => (
                    <MenuItem key={option} value={option} sx={{ fontSize: '0.875rem' }}>
                      <Checkbox checked={betaHeaders.indexOf(option) > -1} size="small" />
                      <ListItemText
                        primary={option}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default memo(AgentModelSettings);

