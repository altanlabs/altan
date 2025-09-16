import React, { useState } from 'react';
import {
  Card,
  Stack,
  Typography,
  IconButton,
  Collapse,
  Chip,
  Box,
  Tooltip,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Iconify from '../iconify';

const ActionTypeDetails = ({ actionType, metaData, isVisible = false }) => {
  const [expanded, setExpanded] = useState(isVisible);
  const { enqueueSnackbar } = useSnackbar();

  const handleCopyDetails = async () => {
    try {
      const details = {
        name: actionType?.name,
        description: actionType?.description,
        method: actionType?.method,
        connection_type: actionType?.connection_type,
        locations: actionType?.locations,
        meta_data: metaData,
        ...(actionType || {}),
      };

      await navigator.clipboard.writeText(JSON.stringify(details, null, 2));
      enqueueSnackbar('Action type details copied to clipboard!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to copy details', { variant: 'error' });
    }
  };

  const handleCopyJSON = async () => {
    try {
      const fullActionType = { ...actionType, meta_data: metaData };
      await navigator.clipboard.writeText(JSON.stringify(fullActionType, null, 2));
      enqueueSnackbar('Full JSON copied to clipboard!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to copy JSON', { variant: 'error' });
    }
  };

  if (!actionType) {
    return null;
  }

  const METHOD_COLORS = {
    GET: 'success',
    POST: 'info',
    PUT: 'warning',
    PATCH: 'warning',
    DELETE: 'error',
  };

  return (
    <Box className="mt-2 pt-2 border-t border-gray-200">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        className="mb-1"
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          <Iconify
            icon="mdi:code-braces"
            className="text-gray-500"
            width={14}
          />
          <Typography
            variant="caption"
            className="text-gray-600 font-mono"
          >
            dev: action details
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={0.5}
        >
          <Tooltip title="Copy JSON">
            <IconButton
              size="small"
              onClick={handleCopyJSON}
              className="hover:bg-gray-100 p-1"
            >
              <Iconify
                icon="mdi:code-json"
                width={12}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy ID">
            <IconButton
              size="small"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(actionType.id?.toString() || '');
                  enqueueSnackbar('Action ID copied!', { variant: 'success' });
                } catch (error) {
                  enqueueSnackbar('Failed to copy ID', { variant: 'error' });
                }
              }}
              className="hover:bg-gray-100 p-1"
            >
              <Iconify
                icon="mdi:identifier"
                width={12}
              />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            className="hover:bg-gray-100 p-1"
          >
            <Iconify
              icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
              width={12}
            />
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={expanded}>
        <Box className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <Stack spacing={1}>
            {/* Compact Info Grid */}
            <Box className="grid grid-cols-2 gap-2 text-xs">
              <Box>
                <Typography
                  variant="caption"
                  className="text-gray-500 font-mono block"
                >
                  name:
                </Typography>
                <Typography
                  variant="caption"
                  className="text-gray-800 font-mono break-all"
                >
                  {actionType.name}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="text-gray-500 font-mono block"
                >
                  id:
                </Typography>
                <Typography
                  variant="caption"
                  className="text-gray-800 font-mono"
                >
                  {actionType.id}
                </Typography>
              </Box>
            </Box>

            {actionType.connection_type && (
              <Box>
                <Typography
                  variant="caption"
                  className="text-gray-500 font-mono block"
                >
                  connection_type:
                </Typography>
                <Typography
                  variant="caption"
                  className="text-gray-800 font-mono"
                >
                  {actionType.connection_type.name} (id: {actionType.connection_type.id})
                </Typography>
              </Box>
            )}

            {actionType.locations && (
              <Typography
                variant="caption"
                className="text-gray-600 font-mono"
              >
                schema: {Object.keys(actionType.locations.properties || {}).length} params
              </Typography>
            )}

            {/* Quick Copy Actions */}
            <Stack
              direction="row"
              spacing={1}
              className="pt-1 border-t border-gray-200"
            >
              <Tooltip title="Copy action ID">
                <button
                  className="text-xs font-mono text-blue-600 hover:text-blue-800 underline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(actionType.id?.toString() || '');
                      enqueueSnackbar('Action ID copied!', { variant: 'success' });
                    } catch (error) {
                      enqueueSnackbar('Failed to copy ID', { variant: 'error' });
                    }
                  }}
                >
                  copy-id
                </button>
              </Tooltip>

              <Tooltip title="Copy connection type ID">
                <button
                  className="text-xs font-mono text-green-600 hover:text-green-800 underline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        actionType.connection_type?.id?.toString() || '',
                      );
                      enqueueSnackbar('Connection type ID copied!', { variant: 'success' });
                    } catch (error) {
                      enqueueSnackbar('Failed to copy connection type ID', { variant: 'error' });
                    }
                  }}
                >
                  copy-conn-id
                </button>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ActionTypeDetails;
