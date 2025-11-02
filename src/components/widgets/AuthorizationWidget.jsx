import { Add as AddIcon, Check as CheckIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { createSelector } from '@reduxjs/toolkit';
import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';

import {
  selectAccountConnectionsByType,
  selectAccountConnectionsLoading,
  selectAccountConnectionsInitialized,
  getConnections,
  selectConnectionTypes,
} from '../../redux/slices/connections';
import { selectAccount, selectCustomConnectionTypes } from '../../redux/slices/general';
import { sendMessage } from '../../redux/slices/room';
import { useSelector, dispatch } from '../../redux/store';
import IconRenderer from '../icons/IconRenderer';
import CreateConnection from '../tools/CreateConnection';

// Create a selector to combine all connection types (like in CreateConnection)
const selectAllConnectionTypes = createSelector(
  [selectConnectionTypes, selectCustomConnectionTypes],
  (conns, myConns) => [...conns, ...(myConns ?? [])],
);

const AuthorizationWidget = ({ connectionTypeId, threadId }) => {
  const theme = useTheme();
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState('');

  const account = useSelector(selectAccount);
  const accountId = account?.id;
  const connectionsLoading = useSelector(selectAccountConnectionsLoading);
  const connectionsInitialized = useSelector(selectAccountConnectionsInitialized);
  const allConnectionTypes = useSelector(selectAllConnectionTypes);

  // Get connections for this specific type
  const connectionsByType = useSelector(selectAccountConnectionsByType(connectionTypeId));

  // Find the connection type details
  const connectionType = useMemo(
    () => allConnectionTypes?.find((type) => type.id === connectionTypeId),
    [allConnectionTypes, connectionTypeId],
  );

  // localStorage key for this specific authorization
  const storageKey = `altan_auth_${connectionTypeId}_${threadId}`;

  // Check if already authorized
  const [isAuthorized, setIsAuthorized] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Load connections on mount
  useEffect(() => {
    if (accountId && !connectionsInitialized && !connectionsLoading) {
      dispatch(getConnections(accountId));
    }
  }, [accountId, connectionsInitialized, connectionsLoading]);

  const handleSelectConnection = useCallback(
    (connectionId) => {
      const connection = connectionsByType?.find((c) => c.id === connectionId);
      if (!connection) return;

      setSelectedConnectionId(connectionId);

      // Store authorization in localStorage
      const authData = {
        connectionId,
        connectionName: connection.name,
        connectionType: connectionType?.name,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(authData));
      setIsAuthorized(authData);

      // Send message to the room
      if (threadId && connectionId) {
        dispatch(
          sendMessage({
            content: `Authorized connection, Connection id is: ${connectionId}`,
            threadId,
          }),
        );
      }
    },
    [threadId, connectionsByType, connectionType, storageKey],
  );

  const handleCreateNew = () => {
    setShowCreateNew(true);
  };

  const handleClearAuthorization = () => {
    localStorage.removeItem(storageKey);
    setIsAuthorized(null);
    setSelectedConnectionId('');
  };

  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (value === 'create_new') {
      handleCreateNew();
    } else {
      handleSelectConnection(value);
    }
  };

  // Track the number of connections to detect when a new one is added
  const previousConnectionCount = useRef(connectionsByType?.length || 0);

  // Auto-select the newest connection when one is created
  useEffect(() => {
    if (connectionsByType && connectionsByType.length > previousConnectionCount.current) {
      // A new connection was added, select the most recent one
      const newestConnection = connectionsByType.reduce((newest, connection) => {
        return new Date(connection.date_creation) > new Date(newest.date_creation)
          ? connection
          : newest;
      });
      handleSelectConnection(newestConnection.id);
    }
    previousConnectionCount.current = connectionsByType?.length || 0;
  }, [connectionsByType, handleSelectConnection]);

  // Show creation form
  if (showCreateNew) {
    return (
      <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CreateConnection
          id={connectionTypeId}
          accountId={accountId}
          popup={false}
          setIsCreatingNewConnection={setShowCreateNew}
        />
      </Box>
    );
  }

  // Show loading state
  if (connectionsLoading) {
    return (
      <Box sx={{ p: 1.5 }}>
        <Skeleton
          variant="text"
          width="60%"
          height={20}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={40}
          sx={{ mt: 1 }}
        />
      </Box>
    );
  }

  // Show authorized state
  if (isAuthorized) {
    return (
      <Box
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'success.main',
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.success.main, 0.05),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon
              color="success"
              size="small"
            />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 500, color: 'success.main' }}
              >
                Authorized
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
              >
                {isAuthorized.connectionName}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Change authorization">
            <IconButton
              onClick={handleClearAuthorization}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <AddIcon sx={{ transform: 'rotate(45deg)' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }
  // Show selection form
  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ mb: 1.5, fontWeight: 500 }}
      >
        Authorize {connectionType?.name || 'Connection'}
      </Typography>

      {connectionsByType && connectionsByType.length > 0 ? (
        <FormControl
          fullWidth
          size="small"
        >
          <InputLabel>Select Connection</InputLabel>
          <Select
            value={selectedConnectionId}
            onChange={handleSelectChange}
            label="Select Connection"
          >
            {connectionsByType.map((connection) => (
              <MenuItem
                key={connection.id}
                value={connection.id}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <IconRenderer icon={connection.connection_type?.icon} />
                  <Typography
                    variant="body2"
                    noWrap
                  >
                    {connection.name}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            <MenuItem value="create_new">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                <AddIcon sx={{ width: 20, height: 20 }} />
                <Typography variant="body2">Create New Connection</Typography>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      ) : (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          fullWidth
          size="small"
        >
          Create New Connection
        </Button>
      )}
    </Box>
  );
};

export default memo(AuthorizationWidget, (prevProps, nextProps) => {
  // Only re-render if connectionTypeId or threadId changes
  return (
    prevProps.connectionTypeId === nextProps.connectionTypeId &&
    prevProps.threadId === nextProps.threadId
  );
});
