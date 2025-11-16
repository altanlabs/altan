import { LoadingButton } from '@mui/lab';
import { Button, Dialog, Stack, DialogActions, Typography } from '@mui/material';
import { useState, useCallback, memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../hooks/useFeedbackDispatch';
import formatData from '../utils/formatData';
import InteractiveButton from './buttons/InteractiveButton';
import FormParameter from './tools/form/FormParameter';
import { createCustomApp } from '../redux/slices/general/index.ts';

const CUSTOM_APP_SCHEMA = {
  title: 'DevAppCreate',
  type: 'object',
  description: 'Schema for creating a new dev app.',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the custom app.',
      'x-hide-label': true,
    },
    description: {
      type: 'string',
      description: 'The description of the custom app.',
      'x-hide-label': true,
    },
    icon: {
      type: 'string',
      description: 'The public url of the icon of the app',
      'x-hide-label': true,
    },
  },
  required: ['name', 'icon'],
};

const CreateCustomApp = () => {
  const [open, setOpen] = useState(false);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();

  const methods = useForm({ defaultValues: {} });
  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const handleClose = useCallback(() => setOpen(false), []);
  const handleOpen = useCallback(() => setOpen(true), []);

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      const formattedData = formatData(data, CUSTOM_APP_SCHEMA.properties);
      dispatchWithFeedback(createCustomApp(formattedData), {
        useSnackbar: true,
        successMessage: 'Custom app created successfully',
        errorMessage: 'Could not create custom connector',
      }).then(handleClose());
    }),
    [],
  );

  return (
    <>
      <InteractiveButton
        id="create-custom-app-button"
        icon="mdi:package-variant-closed"
        title="Create Custom Connector"
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
            New Custom Connector
          </Typography>
        </Stack>
        <FormProvider {...methods}>
          <Stack
            padding={4}
            spacing={1}
          >
            {Object.entries(CUSTOM_APP_SCHEMA.properties).map(([key, fieldSchema]) => {
              const required = CUSTOM_APP_SCHEMA.required.includes(key);
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
              onClick={onSubmit}
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

export default memo(CreateCustomApp);
