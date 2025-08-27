import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import {
  Card,
  CardContent,
  Typography,
  Skeleton,
  useTheme,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router';

import { fToNow } from '@utils/formatTime.js';

import Iconify from '../../../components/iconify';
import { useSelector } from '../../../redux/store';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import CreateFlowDialog from '../../../sections/@dashboard/jobs/CreateFlowDialog';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const formatCredits = (credits) => {
  if (credits >= 1e9) {
    return (credits / 1e9).toFixed(2) + 'B';
  }
  if (credits >= 1e6) {
    return (credits / 1e6).toFixed(2) + 'M';
  }
  if (credits >= 1e3) {
    return (credits / 1e3).toFixed(2) + 'k';
  }
  return credits.toFixed(6);
};

const selectWorkflows = (state) => state.general.account?.workflows;

// Add this status config object near the top of the component
const statusConfig = {
  error: {
    color: 'error',
    icon: 'mdi:alert-circle',
  },
  success: {
    color: 'success',
    icon: 'mdi:check-circle',
  },
  running: {
    color: 'info',
    icon: 'mdi:progress-clock',
  },
};

// Add this conversion helper near the formatCredits function
const taskToAltanCredits = (taskCredits) => taskCredits * 0.3 / 100;

const WorkflowsSummaryWidget = () => {
  const theme = useTheme();
  const [openCreate, setOpenCreate] = useState(false);
  const workflows = useSelector(selectWorkflows) || [];
  const isLoading = useSelector((state) => state.general.accountAssetsLoading.workflows);
  const history = useHistory();;
  const [statusFilter, setStatusFilter] = useState('all');

  // Prepare summary data only if workflows are available
  const summaryData = useMemo(
    () =>
      workflows.map((workflow) => {
        const executions = workflow.executions?.items || [];
        const totalExecutions = executions.length;
        const totalCredits = executions.reduce((acc, exec) => acc + (exec.credits || 0), 0) || 0;
        const successCount = executions.filter(
          (exec) => exec.status?.toLowerCase() === 'success',
        ).length;
        const errorCount = executions.filter(
          (exec) => exec.status?.toLowerCase() === 'error',
        ).length;

        return {
          id: workflow.id,
          name: workflow.name,
          totalExecutions,
          totalCredits,
          successCount,
          errorCount,
        };
      }),
    [workflows],
  );

  // Sort summary data by totalCredits in descending order and limit to top 10
  const sortedSummaryData = useMemo(() => {
    return summaryData.sort((a, b) => b.totalCredits - a.totalCredits);
  }, [summaryData]);

  // Determine the min and max totalCredits for color scaling
  const { minCredits, maxCredits } = useMemo(() => {
    if (sortedSummaryData.length === 0) {
      return { minCredits: 0, maxCredits: 0 };
    }
    const creditsArray = sortedSummaryData.map((item) => item.totalCredits);
    return {
      minCredits: Math.min(...creditsArray),
      maxCredits: Math.max(...creditsArray),
    };
  }, [sortedSummaryData]);

  // Function to map credit value to a color with varying transparency
  const getCreditColor = useCallback(
    (credits) => {
      const baseColor = [30, 144, 255]; // DodgerBlue
      const minAlpha = 0.3; // Minimum opacity
      const maxAlpha = 1; // Maximum opacity

      // Handle case where min and max are equal to avoid division by zero
      if (maxCredits === minCredits) {
        return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${maxAlpha})`;
      }

      // Calculate the ratio
      const ratio = (credits - minCredits) / (maxCredits - minCredits);

      // Interpolate between minAlpha and maxAlpha
      const alpha = minAlpha + ratio * (maxAlpha - minAlpha);

      return `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
    },
    [maxCredits, minCredits],
  );

  // Define column definitions for AG Grid with vertical alignment and heatmap
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Flow',
        field: 'name',
        sortable: true,
        filter: true,
        flex: 1,
        cellRenderer: (params) => (
          <Typography
            variant="body2"
            sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        headerName: 'Total Executions',
        field: 'totalExecutions',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 150,
        cellRenderer: (params) => (
          <Typography
            variant="body2"
            align="right"
            sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        headerName: 'Task Credits Consumed',
        field: 'totalCredits',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 180,
        cellRenderer: (params) => {
          const credits = params.value;
          const color = getCreditColor(credits);
          return (
            <Typography
              variant="body2"
              align="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                backgroundColor: color,
                borderRadius: '4px',
                padding: '4px 8px',
                color: theme.palette.getContrastText(color),
              }}
            >
              {formatCredits(credits)}
            </Typography>
          );
        },
      },
      {
        headerName: 'Altan Credits Consumed',
        field: 'totalCredits',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 180,
        cellRenderer: (params) => {
          const credits = taskToAltanCredits(params.value);
          const color = getCreditColor(params.value); // Using same color scaling as task credits
          return (
            <Typography
              variant="body2"
              align="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                backgroundColor: color,
                borderRadius: '4px',
                padding: '4px 8px',
                color: theme.palette.getContrastText(color),
              }}
            >
              {formatCredits(credits)}
            </Typography>
          );
        },
      },
      {
        headerName: 'Success Rate',
        field: 'successCount',
        width: 150,
        cellRenderer: (params) => {
          const total = params.data.successCount + params.data.errorCount;
          if (total === 0) return <Typography variant="body2">No executions</Typography>;

          const successPercent = (params.data.successCount / total) * 100;
          const errorPercent = (params.data.errorCount / total) * 100;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 1 }}>
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  height: 10,
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${successPercent}%`,
                    bgcolor: theme.palette.success.main,
                  }}
                />
                <Box
                  sx={{
                    width: `${errorPercent}%`,
                    bgcolor: theme.palette.error.main,
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{ minWidth: 45 }}
              >
                {`${Math.round(successPercent)}%`}
              </Typography>
            </Box>
          );
        },
      },
    ],
    [getCreditColor, theme.palette],
  );

  // Handle row double-click to history.push to the workflow
  const onRowDoubleClicked = useCallback(
    (params) => {
      history.push(`/flows/${params.data.id}`);
    },
    [history.push],
  );

  // Add a safe date formatting function
  const safeFormatDate = (date) => {
    try {
      if (!date) return 'N/A';
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      return fToNow(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Update the recentExecutionsData to be more robust
  const recentExecutionsData = useMemo(() => {
    try {
      // Get executions from workflows with safe access and error handling
      const workflowExecutions = (workflows || []).flatMap((workflow) => {
        if (!workflow) return [];
        return (workflow.executions?.items ?? [])
          .filter((exec) => exec) // Filter out null/undefined items
          .map((exec) => {
            try {
              return {
                id: exec.id || `temp-${Date.now()}`,
                workflowName: workflow.name || 'Unnamed Workflow',
                workflowId: workflow.id,
                startTime: exec.date_creation ? new Date(exec.date_creation) : new Date(),
                status: exec.status || 'unknown',
                credits: Number(exec.credits) || 0,
              };
            } catch (error) {
              console.error('Error processing execution:', error);
              return null;
            }
          })
          .filter((exec) => exec); // Filter out failed conversions
      });

      // Get executions from workflowExecutions state with safe access
      const realtimeExecutions = Object.values(workflowExecutions || {}).flatMap(
        (executionGroup) => {
          if (!executionGroup?.items) return [];
          return executionGroup.items
            .filter((exec) => exec) // Filter out null/undefined items
            .map((exec) => {
              try {
                const workflow = (workflows || []).find((w) => w?.id === exec?.workflow_id);
                return {
                  id: exec.id || `temp-${Date.now()}`,
                  workflowName: workflow?.name || 'Unknown Workflow',
                  workflowId: exec.workflow_id,
                  startTime: exec.date_creation ? new Date(exec.date_creation) : new Date(),
                  status: exec.status || 'unknown',
                  credits: Number(exec.credits) || 0,
                };
              } catch (error) {
                console.error('Error processing realtime execution:', error);
                return null;
              }
            })
            .filter((exec) => exec); // Filter out failed conversions
        },
      );

      // Combine and sort all executions
      const allExecutions = [...workflowExecutions, ...realtimeExecutions];

      // Remove duplicates based on execution ID
      const uniqueExecutions = Array.from(
        new Map(allExecutions.map((item) => [item.id, item])).values(),
      );

      // Filter executions based on status
      const filteredExecutions = uniqueExecutions.filter((exec) => {
        if (statusFilter === 'all') return true;
        return exec.status?.toLowerCase() === statusFilter;
      });

      return filteredExecutions.sort((a, b) => {
        try {
          return new Date(b.startTime) - new Date(a.startTime);
        } catch {
          return 0;
        }
      });
    } catch (error) {
      console.error('Error processing executions data:', error);
      return [];
    }
  }, [workflows, statusFilter]);

  // Update the column renderer to handle the status field correctly
  const recentExecutionsColumnDefs = useMemo(
    () => [
      {
        headerName: 'Flow',
        field: 'workflowName',
        flex: 1,
        cellRenderer: (params) => (
          <Typography
            variant="body2"
            sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        headerName: 'Created At',
        field: 'startTime',
        width: 160,
        cellRenderer: (params) => (
          <Typography
            variant="body2"
            sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
          >
            {safeFormatDate(params.value)}
          </Typography>
        ),
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 120,
        cellRenderer: (params) => {
          const status = params.value?.toLowerCase() || 'unknown';
          const config = statusConfig[status] || { color: 'default', icon: 'mdi:help-circle' };

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Button
                variant="soft"
                size="small"
                color={config.color}
                startIcon={<Iconify icon={config.icon} />}
                sx={{
                  textTransform: 'capitalize',
                  pointerEvents: 'none',
                  minWidth: '90px',
                  py: 0.5,
                }}
              >
                {status}
              </Button>
            </Box>
          );
        },
      },
      {
        headerName: 'Task Credits',
        field: 'credits',
        width: 120,
        cellRenderer: (params) => (
          <Typography
            variant="body2"
            align="right"
            sx={{ height: '100%' }}
          >
            {formatCredits(params.value)}
          </Typography>
        ),
      },
      {
        headerName: 'Altan Credits',
        field: 'credits',
        width: 120,
        cellRenderer: (params) => (
          <Typography
            variant="body2"
            align="right"
            sx={{ height: '100%' }}
          >
            {formatCredits(taskToAltanCredits(params.value))}
          </Typography>
        ),
      },
    ],
    [],
  );

  // Update the handler to include execution ID in the URL
  const onRecentExecutionDoubleClicked = useCallback(
    (params) => {
      history.push(`/flows/${params.data.workflowId}?execution=${params.data.id}`);
    },
    [history.push],
  );

  // Add status filter handler
  const handleStatusFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setStatusFilter(newFilter);
    }
  };

  return (
    <Card>
      <CardContent>
        {isLoading ? (
          // Display skeletons while loading
          <>
            <Skeleton
              variant="rectangular"
              height={40}
              width="100%"
              sx={{ mb: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={30}
              width="100%"
            />
            <Skeleton
              variant="rectangular"
              height={30}
              width="100%"
              sx={{ mt: 1 }}
            />
          </>
        ) : !workflows?.length ? (
          // Display message if no workflows are available
          <Typography>No workflows available.</Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', md: 'row' },
              height: '400px', // Reduced height
            }}
          >
            {/* Most Executed Workflows Grid */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h6"
                gutterBottom
              >
                Top Workflows by Usage
              </Typography>
              <div
                className={
                  theme.palette.mode === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'
                }
                style={{ width: '100%', flexGrow: 1 }}
              >
                <AgGridReact
                  rowData={sortedSummaryData}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    flex: 1,
                    minWidth: 100,
                    resizable: true,
                    sortable: true,
                    filter: true,
                  }}
                  onRowDoubleClicked={onRowDoubleClicked}
                  domLayout="autoHeight"
                  pagination={true}
                  paginationPageSize={10}
                />
              </div>
            </Box>

            {/* Recent Executions Grid */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
              >
                Recent Executions
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: 0,
                  zIndex: 1,
                }}
              >
                <ToggleButtonGroup
                  value={statusFilter}
                  exclusive
                  onChange={handleStatusFilterChange}
                  size="small"
                >
                  <ToggleButton
                    value="all"
                    sx={{ py: 0.5 }}
                  >
                    All
                  </ToggleButton>
                  <ToggleButton
                    value="error"
                    sx={{ py: 0.5, color: theme.palette.error.main }}
                  >
                    Error
                  </ToggleButton>
                  <ToggleButton
                    value="success"
                    sx={{ py: 0.5, color: theme.palette.success.main }}
                  >
                    Success
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <div
                className={
                  theme.palette.mode === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'
                }
                style={{ width: '100%', flexGrow: 1 }}
              >
                <AgGridReact
                  rowData={recentExecutionsData}
                  columnDefs={recentExecutionsColumnDefs}
                  defaultColDef={{
                    flex: 1,
                    minWidth: 100,
                    resizable: true,
                    sortable: true,
                    filter: true,
                  }}
                  onRowDoubleClicked={onRecentExecutionDoubleClicked}
                  domLayout="autoHeight"
                  pagination={true}
                  paginationPageSize={10}
                />
              </div>
            </Box>
          </Box>
        )}
      </CardContent>

      <CreateFlowDialog
        open={openCreate}
        handleClose={() => setOpenCreate(false)}
      />
    </Card>
  );
};

export default WorkflowsSummaryWidget;
