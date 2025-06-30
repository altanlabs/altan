import { useTheme, Stack, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import React, { useMemo, memo, useCallback, useEffect } from 'react';

import { CustomAvatar } from '../../custom-avatar';
import IconRenderer from '../../icons/IconRenderer';

const ConnectionsAutocomplete = ({
  connectionType,
  verticalStep,
  onConnectionChange,
  connectionsSetup = null,
  existingConnections = [],
}) => {
  const theme = useTheme();

  // Debug logging
  // useEffect(() => {
  //   console.log('Existing Connections:', existingConnections);
  //   console.log('Connections Setup:', connectionsSetup);
  // }, [existingConnections, connectionsSetup]);

  const value = useMemo(() => {
    if (Array.isArray(existingConnections) && existingConnections.length > 0) {
      if (connectionsSetup) {
        const valueId = Object.values(connectionsSetup)[verticalStep];
        const foundConnection = existingConnections.find((c) => c.id === valueId);
        return foundConnection || existingConnections[0];
      }
      return existingConnections[0];
    } else {
      return { name: '+ Create connection', id: 'add-conn' };
    }
  }, [connectionsSetup, existingConnections, verticalStep]);

  const renderInput = useCallback(
    (params) => (
      <TextField
        {...params}
        label={'Select Connection'}
        sx={{
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 15px rgba(0, 255, 255, 0.1)' // Neon glow in dark mode
              : '0 2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow in light mode
          // textShadow: theme.palette.mode === 'dark' ? '0 0 10px rgba(0, 255, 255, 0.5)' : 'none',
          fontFamily: '"Inter Tight", sans-serif',
        }}
        InputLabelProps={{
          sx: {
            color: '#555',
          },
        }}
      />
    ),
    [theme.palette.mode],
  );

  const renderOption = useCallback(
    (props, option) => {
      const src =
        option.user_id &&
        `https://storage.googleapis.com/logos-chatbot-optimai/user/${option.user_id}`;
      return (
        <li
          {...props}
          key={`connection-${option.id}`}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            {connectionType?.icon && (
              <IconRenderer
                sx={{ width: 20, height: 20 }}
                variant="circular"
                icon={connectionType?.icon}
                color={connectionType?.meta_data?.color || 'inherit'}
              />
            )}
            <Typography color="text.primary">{option.name}</Typography>
            {src && (
              <CustomAvatar
                sx={{ width: 20, height: 20 }}
                variant="circular"
                src={src}
              />
            )}
          </Stack>
        </li>
      );
    },
    [connectionType?.icon, connectionType?.meta_data?.color],
  );

  const options = useMemo(() => {
    const connectionOptions = Array.isArray(existingConnections) ? [...existingConnections] : [];
    if (!connectionOptions.some((conn) => conn.id === 'add-conn')) {
      connectionOptions.push({ name: '+ Create connection', id: 'add-conn' });
    }
    // console.log('Options:', connectionOptions);
    return connectionOptions;
  }, [existingConnections]);

  useEffect(() => {
    // console.log('Selected value:', value);
    if (value) {
      onConnectionChange(verticalStep, null, value.id);
    }
  }, [value, verticalStep, onConnectionChange]);

  return (
    <Autocomplete
      fullWidth
      options={options}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      renderInput={renderInput}
      value={value}
      onChange={(event, newValue) => {
        // console.log('New selected value:', newValue);
        onConnectionChange(verticalStep, event, newValue?.id);
      }}
      size="small"
      renderOption={renderOption}
    />
  );
};

export default memo(ConnectionsAutocomplete);
