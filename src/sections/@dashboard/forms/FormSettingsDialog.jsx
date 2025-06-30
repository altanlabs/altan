import { LoadingButton } from '@mui/lab';
import { Button, Dialog, Stack, DialogActions, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import FormParameter from '../../../components/tools/form/FormParameter';
import { updateForm } from '../../../redux/slices/general';
import { dispatch } from '../../../redux/store';

const FORM_SETTINGS_SCHEMA = {
  title: 'FormSettings',
  type: 'object',
  description: 'Schema for form settings.',
  properties: {
    redirect: {
      type: 'boolean',
      description: 'Redirects the user to the execution that triggered the form response.',
    },
  },
};

export default function FormSettingsDialog({ open, onClose, formId }) {
  const methods = useForm({ defaultValues: { redirect: false } });

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const handleFormSubmit = useCallback(
    handleSubmit((data) => {
      dispatch(updateForm(formId, { meta_data: data }));
      onClose();
    }),
    [onClose],
  );

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', px: 4 }}
        spacing={2}
        justifyContent="space-between"
      >
        <Typography
          variant="h5"
          sx={{ pt: 4 }}
        >
          Form Settings
        </Typography>
      </Stack>
      <FormProvider {...methods}>
        <Stack
          padding={4}
          spacing={1}
        >
          {Object.entries(FORM_SETTINGS_SCHEMA.properties).map(([key, fieldSchema]) => {
            const required = FORM_SETTINGS_SCHEMA.required?.includes(key);
            return (
              <FormParameter
                key={key}
                fieldKey={key}
                schema={fieldSchema}
                required={required}
                enableLexical={true}
              />
            );
          })}
        </Stack>
        <DialogActions>
          <Button
            color="error"
            onClick={onClose}
          >
            Cancel
          </Button>
          <LoadingButton
            color="primary"
            variant="soft"
            onClick={handleFormSubmit}
            disabled={!isDirty}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
