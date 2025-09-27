import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';

import Iconify from '../../../components/iconify';
import JsonViewer from '../../../components/JsonViewer';
import CodeWorkflowSettings from './CodeWorkflowSettings';
import CodeWorkflowTriggerSettings from './CodeWorkflowTriggerSettings';

const CodeWorkflowSidebar = ({ 
  trigger, 
  selectedPayload, 
  onPayloadSelect, 
  executions,
  codeModule,
  onCodeModuleUpdate,
  onTriggerUpdate 
}) => {
  const [payloadHistory, setPayloadHistory] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState('trigger');
  

  // Mock payload history - in real app this would come from executions
  const mockPayloadHistory = useMemo(
    () => [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: 'success',
        payload: { name: 'John Doe', email: 'john@example.com', age: 30 },
        executionId: 'exec-1',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'error',
        payload: { name: 'Jane Smith', email: 'jane@example.com' },
        executionId: 'exec-2',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: 'success',
        payload: { name: 'Bob Johnson', email: 'bob@example.com', age: 25, city: 'New York' },
        executionId: 'exec-3',
      },
    ],
    [],
  );

  useEffect(() => {
    setPayloadHistory(mockPayloadHistory);
  }, [mockPayloadHistory]);


  const handlePayloadSelect = (payload) => {
    onPayloadSelect(payload.payload);
  };

  const handleGenerateSamplePayload = () => {
    const samplePayload = {
      name: 'Sample User',
      email: 'sample@example.com',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Hello from sample payload',
        type: 'test',
      },
    };
    onPayloadSelect(samplePayload);
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return (
          <Iconify
            icon="mdi:check-circle"
            color="success.main"
          />
        );
      case 'error':
        return (
          <Iconify
            icon="mdi:alert-circle"
            color="error.main"
          />
        );
      case 'running':
        return (
          <Iconify
            icon="mdi:loading"
            color="warning.main"
            className="animate-spin"
          />
        );
      default:
        return (
          <Iconify
            icon="mdi:circle"
            color="grey.500"
          />
        );
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        borderRadius: 0,
        paddingTop: 8,
      }}
    >
      {/* Trigger Settings */}
      <CodeWorkflowTriggerSettings
        trigger={trigger}
        onTriggerUpdate={onTriggerUpdate}
        expanded={expandedAccordion === 'trigger'}
        onExpandedChange={handleAccordionChange('trigger')}
      />

      <Divider />

      {/* Code Settings */}
      {codeModule && (
        <>
          <CodeWorkflowSettings
            codeModule={codeModule}
            onCodeModuleUpdate={onCodeModuleUpdate}
            expanded={expandedAccordion === 'code'}
            onExpandedChange={handleAccordionChange('code')}
          />
          <Divider />
        </>
      )}

      {/* Payload History */}
      <Accordion
        expanded={expandedAccordion === 'history'}
        onChange={handleAccordionChange('history')}
        elevation={0}
        sx={{ boxShadow: 'none', flex: 1 }}
      >
        <AccordionSummary
          expandIcon={<Iconify icon="mdi:chevron-down" />}
          sx={{ px: 2, py: 1 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Iconify icon="mdi:history" />
            <Typography variant="subtitle2">Payload History</Typography>
            <Chip
              size="small"
              label={payloadHistory.length}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 2, mb: 2 }}>
            <Stack
              direction="row"
              spacing={1}
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:auto-fix" />}
                onClick={handleGenerateSamplePayload}
                fullWidth
              >
                Generate Sample
              </Button>
              <Tooltip title="Pin as test case">
                <IconButton size="small">
                  <Iconify icon="mdi:pin" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <List sx={{ flex: 1, overflow: 'auto', px: 1 }}>
            {payloadHistory.map((item) => (
              <ListItem
                key={item.id}
                disablePadding
              >
                <ListItemButton
                  onClick={() => handlePayloadSelect(item)}
                  selected={selectedPayload === item.payload}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: selectedPayload === item.payload ? 1 : 0,
                    borderColor: 'primary.main',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{getStatusIcon(item.status)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="body2"
                          noWrap
                        >
                          {item.executionId}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {format(item.timestamp, 'HH:mm')}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {Object.keys(item.payload).join(', ')}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Selected Payload Preview */}
      {selectedPayload && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Typography variant="subtitle2">Selected Payload</Typography>
              <IconButton
                size="small"
                onClick={() => onPayloadSelect(null)}
              >
                <Iconify icon="mdi:close" />
              </IconButton>
            </Stack>
            <Box
              sx={{
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: 'grey.50',
                borderRadius: 1,
                p: 1,
              }}
            >
              <JsonViewer
                data={selectedPayload}
                collapsed={1}
                theme="light"
              />
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default CodeWorkflowSidebar;
