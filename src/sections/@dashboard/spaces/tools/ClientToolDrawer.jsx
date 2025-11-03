import {
  Drawer,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { memo, useCallback, useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';

import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import { updateCurrentTool, getSpace } from '../../../../redux/slices/spaces';
import { dispatch, useSelector } from '../../../../redux/store';
import { optimai } from '../../../../utils/axios';
import { bgBlur } from '../../../../utils/cssStyles';

const DATA_TYPES = ['string', 'number', 'boolean', 'array', 'object'];

const VALUE_TYPES = [
  { value: 'ai', label: 'AI' },
  { value: 'fill', label: 'Constant' },
];

const TOOL_CALL_SOUNDS = [
  { value: 'none', label: 'None' },
  { value: 'typing', label: 'Typing' },
  { value: 'elevator_music_1', label: 'Elevator Music 1' },
  { value: 'elevator_music_2', label: 'Elevator Music 2' },
  { value: 'elevator_music_3', label: 'Elevator Music 3' },
  { value: 'elevator_music_4', label: 'Elevator Music 4' },
];

const SOUND_BEHAVIORS = [
  { value: 'auto', label: 'Auto' },
  { value: 'with_pre_speech', label: 'With pre-speech' },
  { value: 'always_play', label: 'Always play' },
];

const EXECUTION_MODES = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'post_speech', label: 'Post speech' },
  { value: 'async', label: 'Async' },
];

const ClientToolDrawer = ({ open, onClose, toolToEdit = null }) => {
  const { enqueueSnackbar } = useSnackbar();
  const currentAgent = useSelector((state) => state.agents.currentAgent);
  const currentSpace = useSelector((state) => state.spaces.current);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(toolToEdit);

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      parameters: [],
      meta_data: {
        response_timeout_secs: 120,
        disable_interruptions: false,
        force_pre_tool_speech: false,
        tool_call_sound: 'typing',
        tool_call_sound_behavior: 'auto',
        expects_response: true,
        execution_mode: 'immediate',
      },
    },
  });

  const { control, handleSubmit, reset } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parameters',
  });

  // Populate form when editing existing tool
  useEffect(() => {
    if (toolToEdit && open) {
      const tool = toolToEdit.tool;
      reset({
        name: tool.name || '',
        description: tool.description || '',
        parameters: tool.parameters || [],
        meta_data: {
          response_timeout_secs: tool.meta_data?.response_timeout_secs || 120,
          disable_interruptions: tool.meta_data?.disable_interruptions || false,
          force_pre_tool_speech: tool.meta_data?.force_pre_tool_speech || false,
          tool_call_sound: tool.meta_data?.tool_call_sound || 'typing',
          tool_call_sound_behavior: tool.meta_data?.tool_call_sound_behavior || 'auto',
          expects_response: tool.meta_data?.expects_response !== undefined ? tool.meta_data.expects_response : true,
          execution_mode: tool.meta_data?.execution_mode || 'immediate',
        },
      });
    } else if (!toolToEdit && open) {
      reset({
        name: '',
        description: '',
        parameters: [],
        meta_data: {
          response_timeout_secs: 120,
          disable_interruptions: false,
          force_pre_tool_speech: false,
          tool_call_sound: 'typing',
          tool_call_sound_behavior: 'auto',
          expects_response: true,
          execution_mode: 'immediate',
        },
      });
    }
  }, [toolToEdit, open, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleAddParameter = useCallback(() => {
    append({
      id: '',
      type: 'string',
      description: '',
      dynamic_variable: '',
      constant_value: '',
      required: false,
      value_type: 'ai',
    });
  }, [append]);

  const handleRemoveParameter = useCallback(
    (index) => {
      remove(index);
    },
    [remove],
  );

  const onSubmit = handleSubmit(async (data) => {
    if (!currentAgent?.id) {
      enqueueSnackbar('No agent selected. Please select an agent first.', { variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tool_type: 'client',
        name: data.name,
        description: data.description,
        parameters: data.parameters,
        meta_data: {
          response_timeout_secs: data.meta_data.response_timeout_secs,
          disable_interruptions: data.meta_data.disable_interruptions,
          force_pre_tool_speech: data.meta_data.force_pre_tool_speech,
          tool_call_sound: data.meta_data.tool_call_sound,
          tool_call_sound_behavior: data.meta_data.tool_call_sound_behavior,
          expects_response: data.meta_data.expects_response,
          execution_mode: data.meta_data.execution_mode,
        },
      };

      // Call the appropriate API endpoint
      if (isEditMode) {
        const response = await optimai.patch(`/tool/${toolToEdit.tool.id}`, payload);
        const { tool } = response.data;
        dispatch(updateCurrentTool(tool));
        enqueueSnackbar('Client tool updated successfully!', { variant: 'success' });
      } else {
        await optimai.post(`/agent/${currentAgent.id}/add-tool`, payload);
        // Refetch space data to get updated tools list
        if (currentSpace?.id) {
          await dispatch(getSpace(currentSpace.id));
        }
        enqueueSnackbar('Client tool created successfully!', { variant: 'success' });
      }

      handleClose();
    } catch (error) {
      console.error('Error creating client tool:', error);
      enqueueSnackbar('Error creating client tool', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  });

  const renderHeader = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
      >
        <Iconify
          icon="mdi:desktop-classic"
          width={24}
        />
        <Typography variant="h6">{isEditMode ? 'Edit' : 'Add'} client tool</Typography>
      </Stack>
      <IconButton onClick={handleClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderConfigurationSection = (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
      >
        Configuration
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        Describe to the LLM how and when to use the tool.
      </Typography>

      <Stack spacing={2}>
        <TextField
          variant="filled"
          label="Name"
          placeholder="Tool name"
          {...methods.register('name', { required: true })}
          fullWidth
        />

        <TextField
          variant="filled"
          label="Description"
          placeholder="Tool description"
          {...methods.register('description')}
          multiline
          rows={3}
          fullWidth
        />
      </Stack>
    </Box>
  );

  const renderBehaviorSection = (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
      >
        Behavior Settings
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        Configure how the tool executes and interacts with the agent.
      </Typography>

      <Stack spacing={2}>
        <Controller
          name="meta_data.execution_mode"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>Execution Mode</InputLabel>
              <Select
                {...field}
                label="Execution Mode"
                variant="filled"
              >
                {EXECUTION_MODES.map((mode) => (
                  <MenuItem
                    key={mode.value}
                    value={mode.value}
                  >
                    {mode.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Determines when and how the tool executes relative to agent speech.
        </Typography>

        <Controller
          name="meta_data.expects_response"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label="Expects response"
            />
          )}
        />
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Select this box to make the agent wait for the tool to finish executing before resuming
          the conversation.
        </Typography>

        <TextField
          variant="filled"
          label="Response Timeout (seconds)"
          type="number"
          {...methods.register('meta_data.response_timeout_secs', { valueAsNumber: true })}
          fullWidth
          inputProps={{ min: 1, max: 600 }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
        >
          How long to wait for the client tool to respond before timing out. Default is 120 seconds.
        </Typography>

        <Controller
          name="meta_data.disable_interruptions"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label="Disable interruptions"
            />
          )}
        />
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Select this box to disable interruptions while the tool is running.
        </Typography>

        <Controller
          name="meta_data.force_pre_tool_speech"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label="Force pre-tool speech"
            />
          )}
        />
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Force agent speech before tool execution or let it decide automatically based on recent execution times.
        </Typography>

        <Controller
          name="meta_data.tool_call_sound"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>Tool Call Sound</InputLabel>
              <Select
                {...field}
                label="Tool Call Sound"
                variant="filled"
              >
                {TOOL_CALL_SOUNDS.map((sound) => (
                  <MenuItem
                    key={sound.value}
                    value={sound.value}
                  >
                    {sound.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Optional sound effect that plays during tool execution.
        </Typography>

        <Controller
          name="meta_data.tool_call_sound_behavior"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>Sound Behavior</InputLabel>
              <Select
                {...field}
                label="Sound Behavior"
                variant="filled"
              >
                {SOUND_BEHAVIORS.map((behavior) => (
                  <MenuItem
                    key={behavior.value}
                    value={behavior.value}
                  >
                    {behavior.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Determines when the tool call sound should play.
        </Typography>
      </Stack>
    </Box>
  );

  const renderParametersSection = (
    <Box sx={{ p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6">Parameters</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Define the parameters that will be sent with the event.
          </Typography>
        </Box>
        <Button
          variant="soft"
          color="inherit"
          onClick={handleAddParameter}
          startIcon={<Iconify icon="mdi:plus" />}
          size="small"
        >
          Add param
        </Button>
      </Stack>

      <Stack spacing={2}>
        {fields.map((field, index) => (
          <Box
            key={field.id}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              position: 'relative',
            }}
          >
            <IconButton
              onClick={() => handleRemoveParameter(index)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'error.main',
              }}
              size="small"
            >
              <Iconify icon="mdi:delete" />
            </IconButton>

            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={2}
              >
                <Controller
                  name={`parameters.${index}.type`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <FormControl
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      <InputLabel>Data type</InputLabel>
                      <Select
                        {...controllerField}
                        variant="filled"
                      >
                        {DATA_TYPES.map((type) => (
                          <MenuItem
                            key={type}
                            value={type}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <TextField
                  label="Identifier"
                  {...methods.register(`parameters.${index}.id`, { required: true })}
                  size="small"
                  variant="filled"
                  fullWidth
                />
              </Stack>

              <Controller
                name={`parameters.${index}.required`}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Required"
                  />
                )}
              />

              <Controller
                name={`parameters.${index}.value_type`}
                control={control}
                render={({ field: controllerField }) => (
                  <FormControl
                    size="small"
                    fullWidth
                  >
                    <InputLabel>Value Type</InputLabel>
                    <Select
                      {...controllerField}
                      label="Value Type"
                      variant="filled"
                    >
                      {VALUE_TYPES.map((type) => (
                        <MenuItem
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <TextField
                variant="filled"
                label="Description"
                {...methods.register(`parameters.${index}.description`)}
                placeholder="This field will be passed to the LLM and should describe in detail how to extract the data from the transcript."
                multiline
                rows={3}
                size="small"
                fullWidth
              />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );

  const renderActions = (
    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
      >
        <Button
          variant="soft"
          color="inherit"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          variant="soft"
          color="primary"
          onClick={onSubmit}
          disabled={isSubmitting}
          startIcon={<Iconify icon="mdi:check" />}
        >
          {isEditMode ? 'Update Tool' : 'Create Tool'}
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      PaperProps={{
        sx: {
          width: 1,
          maxWidth: 600,
          backgroundColor: 'transparent',
          padding: 1,
          pb: 2,
          ...bgBlur({ opacity: 0.1 }),
        },
      }}
      slotProps={{
        backdrop: { invisible: true },
      }}
    >
      <FormProvider {...methods}>
        <Box
          sx={{
            height: '100%',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {renderHeader}

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {renderConfigurationSection}
            <Divider />
            {renderParametersSection}
            <Divider />
            {renderBehaviorSection}
          </Box>

          {renderActions}
        </Box>
      </FormProvider>
    </Drawer>
  );
};

export default memo(ClientToolDrawer);
