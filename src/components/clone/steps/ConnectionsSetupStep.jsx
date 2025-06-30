import {
  Stack,
  Typography,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import React, { memo, useState, useMemo, useEffect, useCallback } from 'react';

import { TextShimmer } from '../../aceternity/text/text-shimmer';
import IconRenderer from '../../icons/IconRenderer';
import ConnectionCreator from '../../tools/ConnectionCreator';
import CoolCard from '../assets/CoolCard';
import ConnectionsAutocomplete from '../connections/ConnectionsAutocomplete';

function ConnectionsSetupStep({
  isCreatingNewConnection,
  setIsCreatingNewConnection,
  connectionsSetup,
  setConnectionsSetup,
  types,
  typesInitialized,
  connections,
  account,
  assets,
}) {
  const [verticalStep, setVerticalStep] = useState(0);

  const totalSetUpConnections = useMemo(
    () => Object.values(connectionsSetup).filter((c) => !!c).length,
    [connectionsSetup],
  );

  useEffect(() => {
    if (totalSetUpConnections && verticalStep < Object.keys(assets?.connections ?? {}).length - 1) {
      setVerticalStep((prev) => prev + 1);
    }
  }, [totalSetUpConnections, assets]);

  const handleConnectionChange = useCallback(
    (index, event, newValue) => {
      if (newValue === 'add-conn') {
        setIsCreatingNewConnection(true);
      } else {
        setConnectionsSetup((prev) => ({
          ...prev,
          [Object.keys(prev)[index]]: newValue,
        }));
        setIsCreatingNewConnection(false);
      }
    },
    [setConnectionsSetup, setIsCreatingNewConnection],
  );

  const allConnectionsSetUp = useMemo(
    () => totalSetUpConnections === Object.keys(connectionsSetup).length,
    [connectionsSetup, totalSetUpConnections],
  );

  if (!typesInitialized) {
    return (
      <Stack width="100%">
        <TextShimmer
          className="text-md w-full"
          duration={2}
        >
          Loading connections...
        </TextShimmer>
      </Stack>
    );
  }

  return (
    <Stack
      width="100%"
      height="100%"
      spacing={1.5}
    >
      <Stepper
        activeStep={verticalStep}
        orientation="vertical"
      >
        {Object.entries(assets?.connections ?? {}).map(([assetId, c], index) => {
          const connectionType = types.find((t) => t.id === c.connection_type_id);
          return (
            <Step key={`conntype-step-${connectionType?.id || index}`}>
              <StepLabel
                onClick={() => setVerticalStep(index)}
                icon={
                  <IconRenderer
                    icon={connectionType?.icon || ''}
                    size={25}
                  />
                }
              >
                {connectionType ? (
                  <Chip
                    label={connectionType.name}
                    size="small"
                  />
                ) : (
                  <Typography
                    sx={{
                      color: (theme) => (theme.palette.mode === 'dark' ? '#fff' : 'red'),
                      fontWeight: 'bold',
                    }}
                  >
                    [NOT FOUND] {c.connection_type_id}
                  </Typography>
                )}
              </StepLabel>
              <StepContent>
                {verticalStep === index && connectionType && (
                  <Stack
                    spacing={1}
                    width="100%"
                  >
                    <CoolCard
                      name={connectionType.name}
                      description={connectionType.description}
                      flat
                      sx={{ paddingY: 1, paddingX: 0 }}
                    />
                    {!isCreatingNewConnection ? (
                      <ConnectionsAutocomplete
                        connectionType={connectionType}
                        verticalStep={verticalStep}
                        onConnectionChange={handleConnectionChange}
                        connectionsSetup={connectionsSetup}
                        existingConnections={
                          (connections[account?.id] || []).filter(
                            (conn) =>
                              conn.connection_type?.id === connectionType.id ||
                              conn.connection_type_id === connectionType.id,
                          ) || []
                        }
                      />
                    ) : (
                      <ConnectionCreator
                        connectionType={connectionType}
                        setIsCreatingNewConnection={setIsCreatingNewConnection}
                        disableClose
                      />
                    )}
                  </Stack>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
      {allConnectionsSetUp && (
        <Chip
          label={`${totalSetUpConnections} connections successfully selected. Feel free to change them any time.`}
          sx={{
            position: 'sticky',
            bottom: 5,
            minHeight: 30,
            opacity: 1,
            color: (theme) => (theme.palette.mode === 'dark' ? '#fff' : 'inherit'),
          }}
          variant="soft"
          color="success"
        />
      )}
    </Stack>
  );
}

export default memo(ConnectionsSetupStep);
