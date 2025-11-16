import { LoadingButton } from '@mui/lab';
import { Button, Dialog, Stack, DialogActions, Typography } from '@mui/material';
import { useState, useCallback, memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../hooks/useFeedbackDispatch';
import formatData from '../utils/formatData';
import FormParameter from './tools/form/FormParameter';
import { createAccountResource, selectAccountId } from '../redux/slices/general/index.ts';
import { useSelector } from '../redux/store.ts';
import InteractiveButton from './buttons/InteractiveButton';

const DEV_APP_SCHEMA = {
  title: 'DevAppCreate',
  type: 'object',
  description: 'Schema for creating a new dev app.',
  properties: {
    app_id: {
      type: 'string',
      description: 'The id of the app',
      'x-hide-label': true,
      'x-component': 'AppsAutocomplete',
    },
    name: {
      type: 'string',
      description: 'The name of the webhook.',
      'x-hide-label': true,
    },
    details: {
      type: 'object',
      properties: {
        client_id: {
          type: 'string',
          description: 'The unique client identifier',
        },
        client_secret: {
          type: 'string',
          description: 'The secret key used for authentication',
        },
      },
    },
  },
  required: ['name', 'app_id', 'details'],
};

const CreateDevApp = () => {
  const [open, setOpen] = useState(false);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const accountId = useSelector(selectAccountId);

  const methods = useForm({ defaultValues: {} });
  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const handleClose = useCallback(() => setOpen(false), []);
  const handleOpen = useCallback(() => setOpen(true), []);

  const onSubmit = useCallback(
    async (data) => {
      const formattedData = formatData(data, DEV_APP_SCHEMA.properties);
      formattedData['account_id'] = accountId;
      await dispatchWithFeedback(createAccountResource('ExternalDevApp', formattedData), {
        useSnackbar: true,
        successMessage: 'Devapp created successfully',
        errorMessage: 'Could not create developer app',
      });
      handleClose();
    },
    [accountId, dispatchWithFeedback, handleClose],
  );

  return (
    <>
      <InteractiveButton
        id="create-dev-app-button"
        icon="fluent:window-dev-tools-16-regular"
        title="Create Developer App"
        onClick={handleOpen}
        // duration={8000}
        containerClassName="h-[40] border-transparent"
        borderClassName="h-[80px] w-[250px]"
        // enableBorder={true}
        className="py-1 px-2"
      />
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
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
            New Dev App
          </Typography>
        </Stack>
        <FormProvider {...methods}>
          <Stack
            padding={4}
            spacing={1}
          >
            {Object.entries(DEV_APP_SCHEMA.properties).map(([key, fieldSchema]) => {
              const required = DEV_APP_SCHEMA.required.includes(key);
              return (
                <FormParameter
                  key={key}
                  fieldKey={key}
                  schema={fieldSchema}
                  required={required}
                  enableLexical={false}
                />
              );
            })}
          </Stack>
          <DialogActions>
            <Button
              color="error"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <LoadingButton
              color="primary"
              variant="soft"
              loading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty}
            >
              Create
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );
};

export default memo(CreateDevApp);
