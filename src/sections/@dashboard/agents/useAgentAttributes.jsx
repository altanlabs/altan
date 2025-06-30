import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import PersonalityEditor from './PersonalityEditor';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
// import Paper from '@mui/material/Paper';
// import Grid from '@mui/material/Grid';
// import ButtonGroup from '@mui/material/ButtonGroup';
import { useNavigate } from 'react-router';

import { RHFSelect, RHFTextField, RHFUploadAvatar, RHFSlider } from '@components/hook-form';

import AvatarSelectionModal from './components/AvatarSelectionModal.jsx';
import InfoModal from '../../../components/helpers/InfoModal.jsx';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import { updateAltanerComponentById } from '../../../redux/slices/altaners';
import {
  createAgent,
  updateAgent,
} from '../../../redux/slices/general';
import { uploadMedia } from '../../../utils/media';
import { Space } from '../spaces';

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

const AvatarSection = React.memo(
  ({ avatarSrc, handleDropSingleFile, setAvatarSrc, handleAvatarChange }) => {
    const [chooseAvatarsOpen, setChooseAvatarsOpen] = useState(false);

    return (
      <>
        <div className="flex flex-col items-center space-y-4">
          <RHFUploadAvatar
            name="avatar"
            file={avatarSrc}
            maxSize={3145728}
            onDrop={handleDropSingleFile}
            onDelete={() => setAvatarSrc(null)}
            onEdit={() => setChooseAvatarsOpen(true)}
            editConfig={{
              icon: 'ic:outline-change-circle',
              tooltip: 'Choose another avatar',
            }}
          />
          <RHFTextField
            name="name"
            label="Agent Name"
            size="small"
            variant="filled"
            className="w-full max-w-sm"
          />
        </div>
        <AvatarSelectionModal
          open={chooseAvatarsOpen}
          onClose={() => setChooseAvatarsOpen(false)}
          setAvatar={handleAvatarChange}
        />
      </>
    );
  },
);

AvatarSection.displayName = 'AvatarSection';

const OpenRouterModelSearch = React.memo(({ onModelSelect }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const fetchOpenRouterModels = useCallback(async (searchQuery = '') => {
    try {
      setLoading(true);
      const response = await fetch('https://openrouter.ai/api/v1/models');
      const data = await response.json();

      const filteredModels = data.data
        .filter((model) => {
          if (!searchQuery) {
            // For default view, show popular/free models first
            return (
              model.pricing.prompt === '0' ||
              model.name.toLowerCase().includes('gpt') ||
              model.name.toLowerCase().includes('claude') ||
              model.name.toLowerCase().includes('gemini')
            );
          }
          return model.name.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .map((model) => ({
          id: model.id,
          // Remove "(free)" from the name if present
          label: model.name.replace(/\s*\(free\)\s*/i, ''),
          description: model.description,
          contextLength: model.context_length,
        }));

      setOptions(filteredModels);
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && options.length === 0) {
      // Load default options when opened
      fetchOpenRouterModels();
    }
  }, [open, fetchOpenRouterModels]);

  useEffect(() => {
    if (inputValue) {
      fetchOpenRouterModels(inputValue);
    }
  }, [inputValue, fetchOpenRouterModels]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
      options={options}
      loading={loading}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      onChange={(_, newValue) => {
        if (newValue) {
          onModelSelect(newValue.id);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search All Models"
          placeholder="Start typing or explore available models..."
          variant="filled"
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress
                    color="inherit"
                    size={20}
                  />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <div className="flex flex-col p-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-gray-500">
                ({option.contextLength.toLocaleString()} tokens)
              </span>
            </div>
            <div className="text-xs text-gray-500 truncate mt-1">{option.description}</div>
          </div>
        </li>
      )}
      ListboxProps={{
        style: {
          maxHeight: '400px',
        },
      }}
    />
  );
});

OpenRouterModelSearch.displayName = 'OpenRouterModelSearch';

const LLModelSection = React.memo(() => {
  const { watch, setValue } = useFormContext();
  const selectedModel = watch('model');
  const showReasoningEffort = reasoningModels.includes(selectedModel);
  const [useOpenRouter, setUseOpenRouter] = useState(false);

  const handleOpenRouterModelSelect = (modelId) => {
    setValue('model', modelId);
  };

  return (
    <div className="backdrop-blur-sm rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <Typography
        variant="subtitle2"
        className="text-gray-700 pb-2"
      >
        AI Model Settings
        <button
          type="button"
          onClick={() => setUseOpenRouter(!useOpenRouter)}
          className={`mx-3 px-3 py-1 rounded-full text-sm ${
            useOpenRouter ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Search All Models
        </button>
      </Typography>

      <div className="space-y-4">
        {useOpenRouter ? (
          <OpenRouterModelSearch onModelSelect={handleOpenRouterModelSelect} />
        ) : (
          <RHFSelect
            native
            name="model"
            label="AI Model"
            size="small"
            className="w-full"
            variant="filled"
          >
            {models.map((provider) => (
              <optgroup
                label={provider.provider}
                key={provider.provider}
              >
                {provider.models.map((model) => (
                  <option
                    key={model}
                    value={model}
                  >
                    {model}
                  </option>
                ))}
              </optgroup>
            ))}
          </RHFSelect>
        )}

        <div className="space-y-2">
          <InfoModal
            title="Temperature"
            description="The temperature parameter in a language model controls creativity. A low temperature produces predictable text, while a high temperature generates more varied and creative responses."
          />

          <RHFSlider name="temperature" />
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        {showReasoningEffort && (
          <div className="space-y-2">
            <InfoModal
              title="Reasoning Effort"
              description="Constrains effort on reasoning for reasoning models. Currently supported values are low, medium, and high. Reducing reasoning effort can result in faster responses and fewer tokens used on reasoning in a response."
            />
            <RHFSelect
              native
              name="reasoning_effort"
              label="Reasoning Effort"
              size="small"
              className="w-full"
              variant="filled"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </RHFSelect>
          </div>
        )}
      </div>
    </div>
  );
});

LLModelSection.displayName = 'LLModelSection';

const CommandsSection = React.memo(
  ({
    localCommands,
    handleCommandChange,
    handleCommandDelete,
    // handleAddCommand,
    handlePublicCommandSelect,
  }) => {
    const [publicCommandsOpen, setPublicCommandsOpen] = useState(false);

    return (
      <div className="w-full space-y-6">
        <div className="flex items-center space-x-2 mb-2">
          <InfoModal
            title="Instructions"
            description="Prompts and commands are instructions given to an AI language model to guide its responses. They help define the context, task, or specific information you want the model to focus on when generating text."
          />
        </div>

      </div>
    );
  },
);

CommandsSection.displayName = 'CommandsSection';

const INITIAL_COMMAND = {
  name: '',
  content: '',
  tokens: 0,
  configuration: {},
  is_public: false,
};

const useAgentAttributes = ({
  mode = 'create',
  agent = null,
  onClose = null,
  altanerComponentId = null,
}) => {
  const navigate = useNavigate();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [avatarSrc, setAvatarSrc] = useState(agent?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [localCommands, setLocalCommands] = useState(agent?.commands?.items || []);

  const methods = useForm({
    defaultValues: {
      name: agent?.name || '',
      temperature: agent?.llm_config?.settings?.temperature || 0.2,
      model: agent?.llm_config?.model_id || 'gpt-4.1',
      reasoning_effort: agent?.llm_config?.settings?.reasoning_effort || 'medium',
    },
  });

  const space = useMemo(() => mode === 'update' && agent?.personal_space, [agent, mode]);
  const handleAvatarChange = useCallback((newAvatarSrc) => {
    setAvatarSrc(newAvatarSrc);
    setAvatarFile(null);
  }, []);

  useEffect(() => {
    if (agent) {
      setAvatarSrc(agent.avatar_url);
    }
  }, [agent]);

  useEffect(() => {
    methods.reset({
      name: agent?.name || '',
      temperature: agent?.llm_config?.settings?.temperature || 0.2,
      model: agent?.llm_config?.model_id || 'gpt-4.1',
      reasoning_effort: agent?.llm_config?.settings?.reasoning_effort || 'medium',
    });
    setLocalCommands(agent?.commands?.items || []);
  }, [
    agent?.commands?.items,
    agent?.llm_config?.model_id,
    agent?.llm_config?.settings?.reasoning_effort,
    agent?.llm_config?.settings?.temperature,
    agent?.name,
    methods,
  ]);

  const onSubmit = useCallback(
    methods.handleSubmit(async (data) => {
      // Check if the model ID contains a slash (indicating it's an OpenRouter model)
      const isOpenRouterModel = data.model.includes('/');
      const selectedProvider = isOpenRouterModel
        ? 'openrouter'
        : models.find((provider) => provider.models.includes(data.model))?.provider || 'openai';

      const agentData = {
        name: data.name,
        description: data.description || null,
        avatar_url: avatarSrc,
        llmodel_config: {
          provider: selectedProvider.toLowerCase(),
          model_id: data.model,
          settings: {
            temperature: data.temperature,
          },
        },
      };

      // Include the reasoning_effort if the selected model is a reasoning model
      if (reasoningModels.includes(data.model)) {
        agentData.llmodel_config.settings.reasoning_effort = data.reasoning_effort;
      }

      if (avatarFile) {
        try {
          const mediaId = await uploadMedia(avatarFile);
          agentData.avatar_url = mediaId;
        } catch (error) {
          console.error('Failed to upload avatar:', error);
        }
      }

      try {
        const result = await dispatchWithFeedback(
          mode === 'create' ? createAgent(agentData) : updateAgent(agent.id, agentData),
          {
            successMessage: `Agent ${mode === 'create' ? 'created' : 'updated'} successfully`,
            errorMessage: `There was an error ${mode === 'create' ? 'creating' : 'updating'} the agent`,
            useSnackbar: true,
          },
        );

        const savedAgent = result;

        // Handle commands updates
        for (const agentCommand of localCommands) {
          const command = agentCommand.command;

          if (command.id) {
            // Update existing command
            // await dispatch(
            //   updateCommand(command.id, {
            //     name: command.name,
            //     content: command.content,
            //     tokens: command.tokens,
            //     configuration: command.configuration,
            //     is_public: command.is_public,
            //   }),
            // );
          }
        }

        if (!!altanerComponentId && !!savedAgent) {
          await dispatchWithFeedback(
            updateAltanerComponentById(altanerComponentId, {
              ids: [savedAgent.id],
              method: 'insert',
            }),
            {
              successMessage: 'Agent linked to Altaner successfully!',
              errorMessage: 'Error linking Agent',
              useSnackbar: true,
            },
          );
        }
        if (mode === 'create' && savedAgent && !altanerComponentId) {
          navigate(`/agent/${savedAgent.id}`);
        }
        if (onClose) onClose();
      } catch {}
    }),
    [localCommands, avatarFile, avatarSrc, mode, agent, altanerComponentId, onClose],
  );

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setAvatarFile(file);
      setAvatarSrc(URL.createObjectURL(file));
    }
  }, []);

  const handleCommandChange = useCallback((updatedCommand) => {
    setLocalCommands((prevCommands) => {
      const newCommands = prevCommands.map((cmd) => {
        if (cmd.id === updatedCommand.id) {
          // Create the updated command structure
          const updatedCmd = {
            ...cmd,
            command: {
              ...cmd.command,
              content: updatedCommand.command.content, // Explicitly update content
            },
          };
          return updatedCmd;
        }
        return cmd;
      });
      return newCommands;
    });
  }, []);

  const handleCommandDelete = useCallback((commandId) => {
    setLocalCommands((prevCommands) => prevCommands.filter((cmd) => cmd.id !== commandId));
  }, []);

  const handleAddCommand = useCallback(() => {
    const tempCommand = { ...INITIAL_COMMAND, id: `temp_${Date.now()}` };
    setLocalCommands((prevCommands) => [...prevCommands, tempCommand]);
  }, []);

  const handlePublicCommandSelect = useCallback((selectedCommand) => {
    const tempCommand = { ...selectedCommand, id: `temp_${Date.now()}` };
    setLocalCommands((prevCommands) => [...prevCommands, tempCommand]);
  }, []);

  return {
    AgentAttributes: (
      <div style={{ paddingBottom: '100px' }}>
        <FormProvider {...methods}>
          <div className="p-6 space-y-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <AvatarSection
                  avatarSrc={avatarSrc}
                  handleDropSingleFile={handleDropSingleFile}
                  setAvatarSrc={setAvatarSrc}
                  handleAvatarChange={handleAvatarChange}
                />
              </div>

              <div className="md:col-span-8">
                <LLModelSection />
              </div>
            </div>

            {mode !== 'create' && (
              <div className="mt-4">
                <CommandsSection
                  localCommands={localCommands}
                  handleCommandChange={handleCommandChange}
                  handleCommandDelete={handleCommandDelete}
                  handleAddCommand={handleAddCommand}
                  handlePublicCommandSelect={handlePublicCommandSelect}
                />
              </div>
            )}

            {!!space && (
              <div className="mt-4">
                <Space
                  navigate={navigate}
                  spaceId={space?.id}
                  isPreview={true}
                />
              </div>
            )}
          </div>
        </FormProvider>
      </div>
    ),
    triggerSubmit: onSubmit,
    isSubmitting,
  };
};

export default useAgentAttributes;
