import { Box, Card, Grid, Chip, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { memo, useEffect, useState } from 'react';

import useResponsive from '../../../hooks/useResponsive.js';
import { optimai } from '../../../utils/axios.js';
import Iconify from '../../iconify/Iconify.jsx';

const FlowExecutionWidget = ({ id: flowExecutionId }) => {
  const theme = useTheme();
  const isSmallScreen = useResponsive('down', 'sm');
  const [flowExecutionSettings, setFlowExecutionSettings] = useState({
    initialized: false,
    error: null,
    flowExecution: null,
    isLoading: false,
  });

  const refresh = () => setFlowExecutionSettings(prev => ({ ...prev, isLoading: false, initialized: false }));

  useEffect(() => {
    const fetchFlowExecution = async () => {
      if (!flowExecutionSettings.initialized && !flowExecutionSettings.isLoading && !!flowExecutionId) {
        setFlowExecutionSettings(prev => ({ ...prev, isLoading: true }));
        try {
          const response = await optimai.get(`/flow/execution/${flowExecutionId}`);
          const { execution } = response.data;
          setFlowExecutionSettings(prev => ({ ...prev, flowExecution: execution }));
        } catch (error) {
          console.error(`Failed to fetch flow execution: ${error}`);
          setFlowExecutionSettings(prev => ({ ...prev, error: error.toString() }));
        } finally {
          setFlowExecutionSettings(prev => ({ ...prev, isLoading: false, initialized: true }));
        }
      }
    };
    fetchFlowExecution();
  }, [flowExecutionId, flowExecutionSettings.initialized]);

  if (flowExecutionSettings.isLoading || !flowExecutionSettings.initialized) {
    return (
      <Chip
        label="Loading execution"
        icon={
          <Iconify
            icon="eos-icons:three-dots-loading"
          />
        }
      />
    );
  }

  if (flowExecutionSettings.error) {
    return (
      <Tooltip
        arrow
        followCursor
        title={flowExecutionSettings.error}
      >
        <Chip
          color="error"
          label={'Flow Execution: ERROR'}
          icon={
            <IconButton
              size="small"
              onClick={refresh}
            >
              <Iconify icon="ic:round-refresh" />
            </IconButton>
          }
        />
      </Tooltip>
    );
  }

  const {
    status,
    meta_data,
  } = (flowExecutionSettings.flowExecution || {});

  const {
    executed_modules_count,
    failed_modules_count,
    sub_executions,
    elapsed_time: rawElapsedTime,
  } = (meta_data?.metrics || {});

  const elapsedTime = !!rawElapsedTime ? `${rawElapsedTime.toFixed(4)} s` : 'N/A';

  const calculateTotalSubExecutions = (subExecs) => {
    return Object.values(subExecs).reduce((acc, curr) => {
      return acc + 1 + (curr.sub_executions ? calculateTotalSubExecutions(curr.sub_executions) : 0);
    }, 0);
  };

  const totalSubExecutions = calculateTotalSubExecutions(sub_executions || {});

  const getStatusIcon = () => {
    if (status === 'error') return <Iconify icon="mdi:alert-outline" color="red" />;
    if (status === 'success') return <Iconify icon="mdi:check-circle-outline" color="green" />;
    return null; // You can add more icons for different statuses if needed
  };

  return (
    <>
      <Card sx={{ padding: theme.spacing(2) }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
              {getStatusIcon()}
              <Typography variant="body1">Flow Execution</Typography>
              <Chip label={`${isSmallScreen ? '' : 'Modules: '}${executed_modules_count}`} variant="outlined" />
              {failed_modules_count > 0 && (
                <Chip label={`${isSmallScreen ? '' : 'Errors: '}${failed_modules_count}`} color="error" variant="outlined" />
              )}
            </Box>

          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography variant="body2">Elapsed Time: {elapsedTime}</Typography>
            <Typography variant="body2">Total Sub Executions: {totalSubExecutions}</Typography>
          </Grid>
        </Grid>
      </Card>
    </>
  );
};

export default memo(FlowExecutionWidget);
