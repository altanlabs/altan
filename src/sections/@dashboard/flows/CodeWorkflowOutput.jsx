import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { format } from 'date-fns';

import Iconify from '../../../components/iconify';
import JsonViewer from '../../../components/JsonViewer';

const CodeWorkflowOutput = ({ executionResult, codeModule, responseModule, isExecuting }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedLog, setExpandedLog] = useState(null);

  // Mock execution timeline
  const executionTimeline = useMemo(() => {
    if (!executionResult) return [];
    
    const baseTime = new Date(executionResult.timestamp);
    return [
      {
        step: 'Trigger',
        status: 'completed',
        duration: '12ms',
        timestamp: new Date(baseTime.getTime() - 150),
        details: 'Webhook received payload'
      },
      {
        step: 'Code Execution',
        status: executionResult.success ? 'completed' : 'error',
        duration: '234ms',
        timestamp: new Date(baseTime.getTime() - 100),
        details: executionResult.success ? 'Python code executed successfully' : executionResult.error
      },
      {
        step: 'Response',
        status: executionResult.success ? 'completed' : 'skipped',
        duration: '8ms',
        timestamp: baseTime,
        details: 'HTTP response sent'
      }
    ];
  }, [executionResult]);

  // Mock output data
  const mockOutput = useMemo(() => {
    if (!executionResult?.success) return null;
    
    return {
      result: {
        processed_data: {
          full_name: 'John Doe',
          email: 'john@example.com',
          processed_at: new Date().toISOString()
        },
        metrics: {
          processing_time: '234ms',
          memory_usage: '12MB'
        }
      }
    };
  }, [executionResult]);

  // Mock logs
  const mockLogs = useMemo(() => [
    {
      level: 'info',
      timestamp: new Date(),
      message: 'Starting code execution',
      line: 1
    },
    {
      level: 'debug',
      timestamp: new Date(Date.now() + 50),
      message: 'Processing input variables: first_name, last_name',
      line: 5
    },
    {
      level: 'info',
      timestamp: new Date(Date.now() + 100),
      message: 'Code execution completed successfully',
      line: 12
    }
  ], []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      case 'running':
        return 'warning';
      case 'skipped':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'mdi:check-circle';
      case 'error':
        return 'mdi:alert-circle';
      case 'running':
        return 'mdi:loading';
      case 'skipped':
        return 'mdi:minus-circle';
      default:
        return 'mdi:circle';
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
        return 'default';
      default:
        return 'default';
    }
  };

  const renderOutputTab = () => (
    <Box sx={{ p: 2 }}>
      {isExecuting ? (
        <Stack alignItems="center" spacing={2} py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Executing workflow...
          </Typography>
        </Stack>
      ) : executionResult ? (
        executionResult.success ? (
          <Stack spacing={2}>
            <Typography variant="subtitle2">Execution Output</Typography>
            {mockOutput ? (
              <Box 
                sx={{ 
                  bgcolor: 'grey.50', 
                  borderRadius: 1, 
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'grey.200'
                }}
              >
                <JsonViewer 
                  data={mockOutput} 
                  collapsed={false}
                  theme="light"
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No output data available
              </Typography>
            )}
          </Stack>
        ) : (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Execution Failed</Typography>
            <Typography variant="body2">
              {executionResult.error}
            </Typography>
          </Alert>
        )
      ) : (
        <Stack alignItems="center" spacing={2} py={4}>
          <Iconify icon="mdi:play-circle-outline" width={48} color="text.secondary" />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Run your code to see the output here
            <br />
            Press <strong>⌘+Enter</strong> to execute
          </Typography>
        </Stack>
      )}
    </Box>
  );

  const renderTimelineTab = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Execution Timeline
      </Typography>
      
      {executionTimeline.length > 0 ? (
        <List>
          {executionTimeline.map((item, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2} width="100%">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: `${getStatusColor(item.status)}.main`,
                    flexShrink: 0
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={500}>
                      {item.step}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        size="small"
                        label={item.duration}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        icon={<Iconify icon={getStatusIcon(item.status)} width={14} />}
                        label={item.status}
                        color={getStatusColor(item.status)}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {item.details}
                  </Typography>
                </Box>
              </Stack>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No execution timeline available
        </Typography>
      )}
    </Box>
  );

  const renderLogsTab = () => (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle2">
          Execution Logs
        </Typography>
        <Button size="small" startIcon={<Iconify icon="mdi:refresh" />}>
          Refresh
        </Button>
      </Stack>

      {mockLogs.length > 0 ? (
        <List sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
          {mockLogs.map((log, index) => (
            <ListItem key={index} sx={{ px: 2, py: 1 }}>
              <Stack direction="row" alignItems="flex-start" spacing={2} width="100%">
                <Chip
                  size="small"
                  label={log.level.toUpperCase()}
                  color={getLogLevelColor(log.level)}
                  variant="outlined"
                  sx={{ minWidth: 60, fontSize: '0.7rem' }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {log.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Line {log.line} • {format(log.timestamp, 'HH:mm:ss.SSS')}
                  </Typography>
                </Box>
              </Stack>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No logs available
        </Typography>
      )}
    </Box>
  );

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: 'divider',
        borderRadius: 0
      }}
    >
      {/* Header with Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ minHeight: 48 }}
        >
          <Tab 
            icon={<Iconify icon="mdi:code-json" />}
            label="Output" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<Iconify icon="mdi:timeline" />}
            label="Timeline" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<Iconify icon="mdi:text-box" />}
            label="Logs" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 0 && renderOutputTab()}
        {activeTab === 1 && renderTimelineTab()}
        {activeTab === 2 && renderLogsTab()}
      </Box>

      {/* Quick Actions */}
      {executionResult?.success && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:email" />}
                fullWidth
              >
                Send Test
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:pin" />}
                fullWidth
              >
                Pin Result
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default CodeWorkflowOutput;
