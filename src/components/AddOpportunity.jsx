import { LoadingButton } from '@mui/lab';
import { DialogTitle, DialogActions, Stack, Typography } from '@mui/material';
import React, { memo, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Iconify from './iconify/Iconify';
import useFeedbackDispatch from '../hooks/useFeedbackDispatch';
import formatData from '../utils/formatData';
import CustomDialog from './dialogs/CustomDialog';
import FormParameter from './tools/form/FormParameter';
import { updateClient } from '../redux/slices/clients';

const CLIENT_SCHEMA = {
  type: 'object',
  required: [],
  properties: {
    client_id: { type: 'string', 'x-component': 'ClientAutocomplete' },
    status: {
      type: 'string',
      default: 'opportunity',
      enum: [
        'opportunity',
        'contacted',
        'follow_up',
        'qualified',
        'unqualified',
        'in_progress',
        'negotiation',
        'closed_won',
        'closed_lost',
        'paused',
        'reopened',
      ],
    },
    opportunity_value: { type: 'number' },
  },
};

const AddOpportunity = ({ open, onClose }) => {
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const methods = useForm({ defaultValues: {} });
  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      const payload = formatData(data, CLIENT_SCHEMA.properties);
      dispatchWithFeedback(updateClient({ status: payload.status }, payload.client_id), {
        useSnackbar: true,
        successMessage: 'Opportunity created  successfully',
        errorMessage: 'There was an error: ',
      }).then(() => onClose());
    }),
    [],
  );

  const renderForm = (
    <Stack
      paddingX={2}
      spacing={1}
    >
      {Object.entries(CLIENT_SCHEMA.properties).map(([key, fieldSchema]) => {
        const required = CLIENT_SCHEMA.required.includes(key);
        return (
          <FormParameter
            key={key}
            fieldKey={key}
            schema={fieldSchema}
            required={required}
          />
        );
      })}
    </Stack>
  );
  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
    >
      <DialogTitle className="flex justify-space-between">
        <Typography variant="h5">Add Opportunity</Typography>
        <LoadingButton
          startIcon={<Iconify icon="dashicons:saved" />}
          color="primary"
          variant="soft"
          loading={isSubmitting}
          onClick={onSubmit}
        >
          Save
        </LoadingButton>
      </DialogTitle>

      <FormProvider {...methods}>{renderForm}</FormProvider>
      <DialogActions></DialogActions>
    </CustomDialog>
  );
};

export default memo(AddOpportunity);
