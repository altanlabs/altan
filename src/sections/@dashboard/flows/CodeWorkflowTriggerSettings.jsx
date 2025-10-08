import {
  Box,
  Typography,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Iconify from '../../../components/iconify';
import TriggerType from '../../../components/TriggerType';
import Webhook from '../../../components/webhook/Webhook';
import CronAutocomplete from '../../../components/tools/dynamic/autocompletes/CronAutocomplete';

const CodeWorkflowTriggerSettings = ({ trigger, onTriggerUpdate, expanded, onExpandedChange }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Form setup for trigger editing
  const methods = useForm({
    defaultValues: {
      trigger_type: trigger?.trigger_type || 'instant',
      cron_expression: trigger?.cron_expression || '',
      subscriptions: trigger?.subscriptions || [],
    },
  });

  const { watch, setValue, getValues, reset } = methods;
  const watchedValues = watch();

  // Sync with trigger module data
  useEffect(() => {
    if (trigger) {
      setIsInitializing(true);
      reset({
        trigger_type: trigger.trigger_type || 'instant',
        cron_expression: trigger.cron_expression || '',
        subscriptions: trigger.subscriptions || [],
      });
      setHasChanges(false);

      // Allow change detection after initialization
      setTimeout(() => setIsInitializing(false), 200);
    }
  }, [trigger, reset]);

  // Track changes - only after initial load
  useEffect(() => {
    if (!trigger || isInitializing) return;

    const hasFormChanges =
      watchedValues.trigger_type !== (trigger.trigger_type || 'instant') ||
      watchedValues.cron_expression !== (trigger.cron_expression || '') ||
      JSON.stringify(watchedValues.subscriptions || []) !==
        JSON.stringify(trigger.subscriptions || []);

    setHasChanges(hasFormChanges);
  }, [watchedValues, trigger, isInitializing]);

  const handleSaveChanges = useCallback(() => {
    const formData = getValues();
    onTriggerUpdate?.(formData);
    setHasChanges(false);
  }, [getValues, onTriggerUpdate]);

  const handleTriggerTypeChange = useCallback(
    (newType) => {
      setValue('trigger_type', newType, { shouldDirty: true });
    },
    [setValue],
  );

  if (!trigger) return null;

  return (
    <Accordion
      expanded={expanded}
      onChange={onExpandedChange}
      elevation={0}
      sx={{ boxShadow: 'none' }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="mdi:chevron-down" />}
        sx={{ px: 2, py: 1 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flex: 1 }}
        >
          <Iconify icon="fluent-mdl2:trigger-approval" />
          <Typography variant="subtitle2">Trigger Settings</Typography>
          {hasChanges && (
            <Chip
              size="small"
              label="Unsaved"
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0 }}>
        <FormProvider {...methods}>
          <Stack spacing={3}>
            {/* Save Button */}
            {hasChanges && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="mdi:content-save" />}
                onClick={handleSaveChanges}
                fullWidth
              >
                Save Trigger Settings
              </Button>
            )}

            {/* Trigger Type Selection */}
            <Box>
              <Typography
                variant="body2"
                fontWeight={500}
                gutterBottom
              >
                Trigger Type
              </Typography>
              <TriggerType
                value={watchedValues.trigger_type}
                onChange={handleTriggerTypeChange}
              />
            </Box>

            {/* Conditional Rendering based on trigger type */}
            {watchedValues.trigger_type === 'scheduled' && (
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  gutterBottom
                >
                  Schedule
                </Typography>
                <CronAutocomplete />
              </Box>
            )}

            {watchedValues.trigger_type === 'instant' && (
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  gutterBottom
                >
                  Webhook Configuration
                </Typography>
                <Webhook value={watchedValues.subscriptions} />
              </Box>
            )}

            {watchedValues.trigger_type === 'internal' && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <Stack
                  alignItems="center"
                  spacing={1}
                >
                  <Iconify
                    icon="mdi:hand-pointing-up"
                    width={24}
                    color="text.secondary"
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Internal triggers are executed manually or called from other workflows
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </FormProvider>
      </AccordionDetails>
    </Accordion>
  );
};

export default CodeWorkflowTriggerSettings;
