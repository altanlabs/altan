import { Button } from '@mui/material';
import React, { memo, useCallback } from 'react';

import { optimai_integration } from '../../../utils/axios';
import Iconify from '../../iconify';

function MetaAuth({ connection, selectedAccount, setIsCreatingNewConnection }) {
  const handleMeta = useCallback(() => {
    window.FB.login(
      function(response) {
        (async () => {
          if (response.status === 'connected') {
            try {
              const res = await optimai_integration.post('/connection/meta/oauth', {
                short_lived_token: response.authResponse.accessToken,
                code: response.authResponse.code,
                account_id: selectedAccount.id,
                connection_type_id: connection.id,
              });
              const longLivedToken = res.data.long_lived_token;
              if (longLivedToken) {
                console.log('Long-lived Access Token: ', longLivedToken);
              } else {
                console.log('Failed to get long-lived token: ', res.data);
              }
            } catch (error) {
              console.log('An error occurred while fetching the long-lived token: ', error);
            } finally {
              setIsCreatingNewConnection(false);
            }
          } else {
            console.log('User did not authenticate.');
            setIsCreatingNewConnection(false);
          }
        })();
      },
      {
        config_id: connection.meta_data.config,
        response_type: 'code',
        override_default_response_type: true,
        // redirect_uri: 'https://api.altan.ai/integration/connection/meta/oauth/'
      },
    );
  }, [connection.id, connection.meta_data.config, selectedAccount.id, setIsCreatingNewConnection]);

  return (
    <Button
      onClick={handleMeta}
      size="large"
      fullWidth
      variant="soft"
      color="inherit"
      startIcon={
        <Iconify
          icon={connection.icon}
          width={22}
        />
      }
      sx={{ mt: 1 }}
    >
      Authorize {connection.name}
    </Button>
  );
}

export default memo(MetaAuth);
