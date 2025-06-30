import { RadioGroup, FormControlLabel, Radio, TextField, Typography, Card } from '@mui/material';
import React, { useState, useEffect } from 'react';

function Authentication({ authData, onChange }) {
  const [authType, setAuthType] = useState(authData?.type || 'none');
  const [apiKey, setApiKey] = useState(authData?.apiKey || '');
  const [apiAuthType, setApiAuthType] = useState(authData?.apiAuthType || 'Basic');
  const [customHeaderName, setCustomHeaderName] = useState(authData?.customHeaderName || null);
  const [oauthDetails, setOauthDetails] = useState(
    authData?.oauthDetails || {
      clientId: '',
      clientSecret: '',
      authorizationURL: '',
      tokenURL: '',
      scope: '',
      type: '',
    },
  );

  const handleAuthTypeChange = (event) => {
    setAuthType(event.target.value);
  };

  useEffect(() => {
    if (authType === 'apiKey') {
      onChange({
        type: authType,
        apiKey,
        apiAuthType,
        customHeaderName: apiAuthType === 'Custom' ? customHeaderName : undefined,
      });
    } else if (authType === 'oauth') {
      onChange({ type: authType, oauthDetails });
    } else {
      onChange({ type: 'none' });
    }
  }, [authType, apiKey, apiAuthType, customHeaderName, oauthDetails, onChange]);

  const renderAuthFields = () => {
    switch (authType) {
      case 'apiKey':
        return (
          <>
            <TextField
              margin="dense"
              label="API Key"
              type="text"
              fullWidth
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <RadioGroup
              row
              name="apiAuthType"
              value={apiAuthType}
              onChange={(e) => setApiAuthType(e.target.value)}
            >
              <FormControlLabel
                value="Basic"
                control={<Radio />}
                label="Basic"
              />
              <FormControlLabel
                value="Bearer"
                control={<Radio />}
                label="Bearer"
              />
              <FormControlLabel
                value="Custom"
                control={<Radio />}
                label="Custom"
              />
            </RadioGroup>
            {apiAuthType === 'Custom' && (
              <TextField
                margin="dense"
                label="Custom Header Name"
                type="text"
                fullWidth
                variant="outlined"
                value={customHeaderName}
                onChange={(e) => setCustomHeaderName(e.target.value)}
              />
            )}
          </>
        );
      case 'oauth':
        return (
          <>
            <TextField
              margin="dense"
              label="Client ID"
              type="text"
              fullWidth
              variant="outlined"
              value={oauthDetails.clientId}
              onChange={(e) => setOauthDetails({ ...oauthDetails, clientId: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Client Secret"
              type="text"
              fullWidth
              variant="outlined"
              value={oauthDetails.clientSecret}
              onChange={(e) => setOauthDetails({ ...oauthDetails, clientSecret: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Authorization URL"
              type="url"
              fullWidth
              variant="outlined"
              value={oauthDetails.authorizationURL}
              onChange={(e) =>
                setOauthDetails({ ...oauthDetails, authorizationURL: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Token URL"
              type="text"
              fullWidth
              variant="outlined"
              value={oauthDetails.tokenURL}
              onChange={(e) => setOauthDetails({ ...oauthDetails, tokenURL: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Scope"
              type="text"
              fullWidth
              variant="outlined"
              value={oauthDetails.scope}
              onChange={(e) => setOauthDetails({ ...oauthDetails, scope: e.target.value })}
            />
            <TextField
              select
              SelectProps={{ native: true }}
              margin="dense"
              name="type"
              label="Token Exchange Method"
              fullWidth
              variant="outlined"
              value={oauthDetails.type}
              onChange={(e) => setOauthDetails({ ...oauthDetails, type: e.target.value })}
            >
              {['Default POST Request', 'Basic Authorization Header'].map((method) => (
                <option
                  key={method}
                  value={method}
                >
                  {method}
                </option>
              ))}
            </TextField>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card sx={{ p: 2, mt: 1 }}>
      <Typography
        variant="h6"
        sx={{ my: 1 }}
      >
        Authentication
      </Typography>
      <RadioGroup
        row
        name="authType"
        value={authType}
        onChange={handleAuthTypeChange}
      >
        <FormControlLabel
          value="none"
          control={<Radio />}
          label="None"
        />
        <FormControlLabel
          value="apiKey"
          control={<Radio />}
          label="API Key"
        />
        <FormControlLabel
          value="oauth"
          control={<Radio />}
          label="OAuth"
        />
      </RadioGroup>
      {renderAuthFields()}
    </Card>
  );
}

export default Authentication;
