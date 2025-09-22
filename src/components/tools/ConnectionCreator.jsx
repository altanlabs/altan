// ConnectionCreator.js

import {
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import React, { useState, memo, useMemo, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import FormParameter from './form/FormParameter.jsx';
import { API_BASE_URL } from '../../auth/utils.js';
import { newConnection } from '../../redux/slices/connections.js';
// import NavAccount from '../../layout/nav/NavAccount.jsx';
import { selectAccount } from '../../redux/slices/general.js';
import { useSelector, dispatch } from '../../redux/store.js';
import { refreshToken } from '../../utils/auth.js';
import { optimai_root } from '../../utils/axios.js';
import Iconify from '../iconify/Iconify.jsx';
import IconRenderer from '../icons/IconRenderer.jsx';

const ConnectionCreator = ({
  connectionType,
  setIsCreatingNewConnection,
  disableClose = false,
  accountId = null,
  external_id = null,
  popup = true,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const account = useSelector(selectAccount);

  // Create base schema for the name field
  const baseSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Connection name',
        default: connectionType?.external_app?.name || connectionType.name,
      },
    },
    required: ['name'],
  };

  // Only add additional parameters for non-OAuth connections
  const formSchema = useMemo(() => {
    let schema = { ...baseSchema };

    if (connectionType.details?.parameters) {
      schema = {
        ...schema,
        properties: {
          ...schema.properties,
          ...connectionType.details.parameters.properties,
        },
        required: [...schema.required, ...(connectionType.details.parameters.required || [])],
      };
    }

    if (connectionType.auth_type === 'api_key' || connectionType.auth_type === 'bearer_token') {
      schema = {
        ...schema,
        properties: {
          ...schema.properties,
          token: {
            type: 'string',
            description: 'Token or API Key',
          },
        },
        required: [...schema.required, 'token'],
      };
    }

    return schema;
  }, [connectionType]);

  const methods = useForm({
    defaultValues: {
      name: connectionType?.external_app?.name || connectionType.name,
    },
  });

  const {
    handleSubmit,
    formState: { isDirty },
    watch,
  } = methods;
  const nameValue = watch('name');

  // Ensure the button is enabled if the default name is set
  const isSubmitDisabled = !isDirty && !nameValue;

  const handleDialogClose = () => {
    setOpenDialog(false);
    methods.reset();
  };

  const onSubmit = handleSubmit((data) => {
    if (['oauth', 'facebook_oauth', 'openid_connect'].includes(connectionType.auth_type)) {
      handleOauth(data);
    } else {
      handleCreateConnection(data);
    }
    handleDialogClose();
  });

  const handleCreateConnection = useCallback(
    (formData) => {
      const { name, ...details } = formData;


      dispatch(
        newConnection(account, {
          connection_type_id: connectionType.id,
          name,
          details,
          meta_data: {
            external_id,
          },
        }),
      )
        .then(() => {
          setIsCreatingNewConnection(false);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    [account, connectionType.id, setIsCreatingNewConnection, external_id],
  );

  const handleOauth = async (data) => {
    const { accessToken } = await refreshToken(optimai_root);
    const { name, host } = data;

    // Build base URL with required parameters
    let oauthUrl = `https://integration.altan.ai/account/${account.id}/oauth-connection?ctid=${connectionType.id}&origin=${encodeURIComponent(window.location.origin)}&atk=${accessToken}&name=${encodeURIComponent(name)}`;

    // Add host parameter if it exists in data
    if (host) {
      oauthUrl += `&host=${encodeURIComponent(host)}`;
    }
    if (external_id) {
      oauthUrl += `&external_id=${external_id}`;
    }
    console.log('oauthUrl', oauthUrl);
    const popupOptions = 'width=600,height=700,resizable=yes,scrollbars=yes,status=yes';
    const oauthPopup = window.open(oauthUrl, 'OauthPopup', popupOptions);

    const popupTick = setInterval(() => {
      if (oauthPopup.closed) {
        clearInterval(popupTick);
        setIsCreatingNewConnection(false);
      }
    }, 500);
  };

  const closeButton = useMemo(
    () =>
      !!disableClose ? null : (
        <IconButton
          size="small"
          onClick={() => setIsCreatingNewConnection(false)}
          sx={{ position: 'absolute', top: -5, right: -15 }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      ),
    [disableClose, setIsCreatingNewConnection],
  );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Button
        size="large"
        fullWidth
        variant="soft"
        onClick={() => setOpenDialog(true)}
        startIcon={
          <IconRenderer
            icon={connectionType?.external_app?.icon || connectionType.icon}
            size={22}
          />
        }
        color="inherit"
        sx={{
          mt: 1,
          textTransform: 'none',
        }}
      >
        Authorize {connectionType?.external_app?.name || connectionType.name}
      </Button>
      {closeButton}

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Connect {connectionType?.external_app?.name || connectionType.name}
        </DialogTitle>
        <DialogContent>
          <FormProvider {...methods}>
            <Stack
              spacing={2}
              sx={{ pt: 2 }}
            >
              {Object.entries(formSchema.properties).map(([key, fieldSchema]) => (
                <FormParameter
                  key={key}
                  fieldKey={key}
                  schema={fieldSchema}
                  required={formSchema.required.includes(key)}
                  enableLexical={false}
                />
              ))}
            </Stack>
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={isSubmitDisabled}
          >
            {['oauth', 'facebook_oauth', 'openid_connect'].includes(connectionType.auth_type)
              ? `Authorize with ${connectionType?.external_app?.name || connectionType.name}`
              : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default memo(ConnectionCreator);
