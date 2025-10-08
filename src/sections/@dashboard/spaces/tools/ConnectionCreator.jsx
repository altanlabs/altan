// ConnectionCreator.js

import { TextField, Button, ButtonGroup } from '@mui/material';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { API_BASE_URL } from '../../../../auth/utils.js';
import Iconify from '../../../../components/iconify/index.js';
import Logo from '../../../../components/logo/Logo.jsx';
import { newConnection } from '../../../../redux/slices/connections';
import { refreshToken } from '../../../../utils/auth.js';
import { optimai_root } from '../../../../utils/axios.js';

const ConnectionCreator = ({ connectionType, setIsCreatingNewConnection }) => {
  const [apiKey, setApiKey] = useState('');
  const dispatch = useDispatch();
  const { id: accountId } = useSelector((state) => state.general.account);

  const handleApiKeySubmit = () => {
    handleCreateConnection({ token: apiKey });
  };

  const handleCreateConnection = (details = null) => {
    try {
      dispatch(
        newConnection({
          connection_type_id: connectionType.id,
          details: details ?? {},
        }),
      );
    } catch (e) {
      console.log(e);
    }
    setIsCreatingNewConnection(false);
  };

  const handleOauth = async () => {
    const { accessToken } = await refreshToken(optimai_root);
    const oauthUrl = `https://integration.altan.ai/account/${accountId}/oauth-connection?ctid=${connectionType.id}&origin=${window.location.origin}&atk=${accessToken}`;
    window.location = oauthUrl;
  };

  const handleAuthorizeButtonClick = () => {
    if (connectionType.auth_type === 'oauth') {
      handleOauth();
    } else {
      handleCreateConnection();
    }
  };

  switch (connectionType.auth_type) {
    case 'oai_member_atk':
    case 'aigent_atk':
    case 'oauth':
      const icon = connectionType?.external_app?.icon || connectionType.icon;
      return (
        <Button
          size="large"
          fullWidth
          variant="contained"
          onClick={handleAuthorizeButtonClick}
          startIcon={
            icon === 'optimai' ? (
              <Logo disabledLink />
            ) : (
              <Iconify
                icon={icon}
                width={22}
              />
            )
          }
          sx={{
            color: 'black',
            mt: 1,
            backgroundColor: '#fff',
            textTransform: 'none',
            border: '1px solid black',
            '&:hover': {
              backgroundColor: '#4285F4',
              color: '#fff',
            },
          }}
        >
          Authorize {connectionType?.external_app?.name || connectionType.name}
        </Button>
      );
    case 'api_key':
    case 'bearer_token':
      return (
        <div>
          <TextField
            label="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            fullWidth
            size="small"
          />
          <ButtonGroup
            fullWidth
            variant="soft"
            sx={{ my: 1 }}
          >
            <Button onClick={handleApiKeySubmit}>Submit</Button>
            <Button
              color="warning"
              onClick={() => setIsCreatingNewConnection(false)}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </div>
      );
    default:
      break;
  }
};

export default ConnectionCreator;
