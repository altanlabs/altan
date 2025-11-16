import {
  Stack,
  DialogActions,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useCallback, memo, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { selectFlowDetails } from '../../redux/slices/flows';
import { createWebhook } from '../../redux/slices/general/index.ts';
import { useSelector } from '../../redux/store.ts';
import { optimai } from '../../utils/axios';
import { CardTitle } from '../aceternity/cards/card-hover-effect';
import InteractiveButton from '../buttons/InteractiveButton';
import FormParameters from '../tools/form/FormParameters';

const updateWebhook = async (webhookId, data) => {
  try {
    const response = await optimai.patch(`/hooks/${webhookId}`, data);
    const { hook } = response.data;
    return hook;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.detail) {
      return Promise.reject(e.response.data.detail);
    } else {
      return Promise.reject(e.message);
    }
  }
};

const selectFlowName = (state) => selectFlowDetails(state)?.name;

const customWebhookSchema = {
  type: 'object',
  properties: {
    route_path: {
      type: 'string',
      description: 'The URL endpoint for the API call.',
    },
    body: {
      type: 'object',
      description: 'The body of the request.',
    },
    methods: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      },
      description: 'The HTTP method to be used for the API call.',
    },
    path_params: {
      type: 'object',
      description: 'Path parameters to format the URL of the API call with.',
    },
    query_params: {
      type: 'object',
      description: 'Query parameters to append to the URL of the API call.',
    },
    headers: {
      type: 'object',
      description: 'A dictionary of HTTP headers to include in the API call.',
    },
  },
};

const CreateWebhookParameters = ({ webhook, onSaveWebhook, onClose }) => {
  const flowName = useSelector(selectFlowName);
  const methods = useForm({ defaultValues: webhook ?? {} });
  const { handleSubmit, register, setValue } = methods;
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [authType, setAuthType] = useState(webhook?.auth?.type || 'NoAuth');

  const mustCreate = !webhook?.id;

  const onSubmit = useCallback(
    (data) => {
      const formattedData = {
        name: data.name,
        auth: {
          type: authType,
          ...(authType === 'Basic' && {
            username: data.username,
            password: data.password,
          }),
          ...(authType === 'Header' && {
            header_name: data.header_name,
            header_value: data.header_value,
          }),
        },
        details: data.details,
      };
      console.log('formattedData', formattedData);
      if (mustCreate) {
        dispatchWithFeedback(createWebhook(formattedData), {
          useSnackbar: true,
          successMessage: 'Webhook created successfully',
          errorMessage: 'Could not create webhook',
        }).then((hook) => {
          if (onSaveWebhook) {
            onSaveWebhook(hook);
          }
        });
      } else {
        updateWebhook(webhook?.id, formattedData)
          .then((hook) => {
            if (onSaveWebhook) {
              onSaveWebhook(hook);
            }
          })
          .catch((error) => {
            console.error('Failed to update webhook:', error);
          });
      }
      if (!!onClose) {
        onClose();
      }
    },
    [authType, mustCreate, onClose, dispatchWithFeedback, onSaveWebhook, webhook?.id],
  );

  useEffect(() => {
    if (!!mustCreate && flowName) {
      setValue('name', `${!!flowName ? `${flowName}'s` : 'Custom'} Webhook`, { shouldDirty: true });
    }
  }, [mustCreate, flowName, setValue]);

  return (
    <FormProvider {...methods}>
      <DialogTitle className="sticky top-0 z-[99] backdrop-blur-lg">
        <CardTitle>{mustCreate ? 'Create' : 'Edit'} webhook</CardTitle>
      </DialogTitle>
      <Stack
        padding={2}
        spacing={2}
        component="form"
        style={{
          width: '550px',
        }}
      >
        <TextField
          fullWidth
          variant="filled"
          size="small"
          label="Webhook Name"
          {...register('name')}
          defaultValue={webhook?.name || ''}
        />

        <FormControl
          fullWidth
          variant="filled"
          size="small"
        >
          <InputLabel>Authentication Type</InputLabel>
          <Select
            value={authType}
            label="Authentication Type"
            onChange={(e) => setAuthType(e.target.value)}
          >
            <MenuItem value="NoAuth">No Authentication</MenuItem>
            <MenuItem value="Basic">Basic Auth</MenuItem>
            <MenuItem value="Header">Header Auth</MenuItem>
            <MenuItem value="Altan">Altan Auth</MenuItem>
          </Select>
        </FormControl>

        {authType === 'Basic' && (
          <>
            <TextField
              fullWidth
              variant="filled"
              size="small"
              label="Username"
              {...register('username')}
              defaultValue={webhook?.auth?.username || ''}
            />
            <TextField
              fullWidth
              variant="filled"
              size="small"
              label="Password"
              type="password"
              {...register('password')}
              defaultValue={webhook?.auth?.password || ''}
            />
          </>
        )}

        {authType === 'Header' && (
          <>
            <TextField
              fullWidth
              variant="filled"
              size="small"
              label="Header Name"
              {...register('header_name')}
              defaultValue={webhook?.auth?.header_name || ''}
            />
            <TextField
              fullWidth
              variant="filled"
              size="small"
              label="Header Value"
              {...register('header_value')}
              defaultValue={webhook?.auth?.header_value || ''}
            />
          </>
        )}
        <FormParameters
          formSchema={customWebhookSchema}
          path="details.schema."
          enableLexical={false}
        />
      </Stack>
      <DialogActions className="sticky bottom-0 z-[99] backdrop-blur-lg">
        <InteractiveButton
          icon="mdi:check"
          title={!!mustCreate ? 'Create Webhook' : 'Save'}
          onClick={handleSubmit(onSubmit)}
          duration={8000}
          containerClassName="h-[40]"
          borderClassName="h-[80px] w-[250px]"
          enableBorder={true}
          loading={isSubmitting}
          className="p-2"
        />
      </DialogActions>
    </FormProvider>
  );
};

export default memo(CreateWebhookParameters);
