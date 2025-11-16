import { Typography } from '@mui/material';
import { memo, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import ConnectionTypesAutocomplete from '../ConnectionTypesAutocomplete';
import ConnectionSelectorAutocomplete from './ConnectionSelectorAutocomplete';
import CreateConnection from './CreateConnection';
import { selectAccountConnections } from '../../redux/slices/general/index.ts';

/**
 * Reusable component that handles the complete connection workflow:
 * 1. Select connection type
 * 2. Select existing connection (if available) or create new one
 * 3. Handle connection creation
 */
const ConnectionManager = ({
  onConnectionSelected,
  onClose,
  initialConnectionType = null,
  title = 'Manage Connection',
}) => {
  const [selectedConnectionType, setSelectedConnectionType] = useState(initialConnectionType);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [isCreatingNewConnection, setIsCreatingNewConnection] = useState(false);

  // Get all available connections from account
  const allConnections = useSelector(selectAccountConnections);

  // Filter connections by the selected connection type
  const existingConnections = useMemo(() => {
    if (!selectedConnectionType || !allConnections?.length) {
      return [];
    }
    return allConnections.filter(
      (connection) => connection?.connection_type?.id === selectedConnectionType.id,
    );
  }, [selectedConnectionType, allConnections]);

  // Handle connection type selection
  const handleConnectionTypeChange = useCallback((event, newType) => {
    setSelectedConnectionType(newType);
    setSelectedConnection(null);
    setIsCreatingNewConnection(false);
  }, []);

  // Handle existing connection selection
  const handleConnectionChange = useCallback(
    (event, selectedConn) => {
      if (selectedConn && selectedConn.name === '+ Create connection') {
        setIsCreatingNewConnection(true);
        setSelectedConnection(null);
      } else {
        setSelectedConnection(selectedConn);
        setIsCreatingNewConnection(false);
        // Notify parent component about the selection
        if (onConnectionSelected && selectedConn) {
          onConnectionSelected(selectedConn);
        }
      }
    },
    [onConnectionSelected],
  );

  // Handle successful connection creation
  const handleConnectionCreated = useCallback(
    (newConnection) => {
      setIsCreatingNewConnection(false);
      setSelectedConnection(newConnection);
      // Notify parent component about the new connection
      if (onConnectionSelected && newConnection) {
        onConnectionSelected(newConnection);
      }
      // Close the dialog if provided
      if (onClose) {
        onClose();
      }
    },
    [onConnectionSelected, onClose],
  );

  // Reset to connection selection when creation is cancelled
  const handleCreationCancelled = useCallback(() => {
    setIsCreatingNewConnection(false);
  }, []);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h2>

      {/* Step 1: Connection Type Selection */}
      {!selectedConnectionType && (
        <div className="space-y-3">
          <Typography
            variant="body2"
            className="text-gray-600 dark:text-gray-400"
          >
            First, select the type of connection you want to create or use:
          </Typography>
          <ConnectionTypesAutocomplete
            value={selectedConnectionType?.id}
            onChange={handleConnectionTypeChange}
          />
        </div>
      )}

      {/* Step 2: Connection Selection or Creation */}
      {selectedConnectionType && !isCreatingNewConnection && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Typography
              variant="body2"
              className="text-gray-600 dark:text-gray-400"
            >
              {existingConnections.length > 0
                ? `Found ${existingConnections.length} existing ${selectedConnectionType.name} connection(s):`
                : `No existing ${selectedConnectionType.name} connections found. You'll need to create one:`}
            </Typography>
            <button
              onClick={() => setSelectedConnectionType(null)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Change Type
            </button>
          </div>

          <ConnectionSelectorAutocomplete
            connection={selectedConnection}
            connections={existingConnections}
            onChange={handleConnectionChange}
          />
        </div>
      )}

      {/* Step 3: Connection Creation */}
      {selectedConnectionType && isCreatingNewConnection && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Typography
              variant="body2"
              className="text-gray-600 dark:text-gray-400"
            >
              Creating new {selectedConnectionType.name} connection:
            </Typography>
            <button
              onClick={handleCreationCancelled}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Selection
            </button>
          </div>

          <CreateConnection
            id={selectedConnectionType.id}
            popup={false}
            setIsCreatingNewConnection={handleConnectionCreated}
          />
        </div>
      )}
    </div>
  );
};

export default memo(ConnectionManager);
