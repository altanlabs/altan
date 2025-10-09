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
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';

import Iconify from '../../../../components/iconify';
import { useSnackbar } from '../../../../components/snackbar';
import { useSelector } from '../../../../redux/store';
import { optimai } from '../../../../utils/axios';
import { bgBlur } from '../../../../utils/cssStyles';

const DATA_TYPES = ['string', 'number', 'boolean', 'array', 'object'];

const VALUE_TYPES = [
  { value: 'ai', label: 'AI' },
  { value: 'fill', label: 'Constant' },
];

const ClientToolDrawer = ({ open, onClose, toolToEdit = null }) => {
  const { enqueueSnackbar } = useSnackbar();
  const currentAgent = useSelector((state) => state.agents.currentAgent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(toolToEdit);

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      wait_for_response: false,
      parameters: [],
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
        wait_for_response: tool.wait_for_response || false,
        parameters: tool.parameters || [],
      });
    } else if (!toolToEdit && open) {
      reset({
        name: '',
        description: '',
        wait_for_response: false,
        parameters: [],
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
        wait_for_response: data.wait_for_response,
        parameters: data.parameters,
      };

      // Call the appropriate API endpoint
      if (isEditMode) {
        await optimai.patch(`/tool/${toolToEdit.tool.id}`, payload);
        enqueueSnackbar('Client tool updated successfully!', { variant: 'success' });
      } else {
        await optimai.post(`/agent/${currentAgent.id}/add-tool`, payload);
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

        <FormControlLabel
          control={<Checkbox {...methods.register('wait_for_response')} />}
          label="Wait for response"
        />
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Select this box to make the agent wait for the tool to finish executing before resuming
          the conversation.
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
                <FormControl
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <InputLabel>Data type</InputLabel>
                  <Select
                    {...methods.register(`parameters.${index}.type`)}
                    defaultValue={field.type}
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

                <TextField
                  label="Identifier"
                  {...methods.register(`parameters.${index}.id`, { required: true })}
                  size="small"
                  variant="filled"
                  fullWidth
                />
              </Stack>

              <FormControlLabel
                control={
                  <Checkbox
                    {...methods.register(`parameters.${index}.required`)}
                    defaultChecked={field.required}
                  />
                }
                label="Required"
              />

              <FormControl
                size="small"
                fullWidth
              >
                <InputLabel>Value Type</InputLabel>
                <Select
                  {...methods.register(`parameters.${index}.value_type`)}
                  label="Value Type"
                  defaultValue={field.value_type}
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
          </Box>

          {renderActions}
        </Box>
      </FormProvider>
    </Drawer>
  );
};

export default memo(ClientToolDrawer);
