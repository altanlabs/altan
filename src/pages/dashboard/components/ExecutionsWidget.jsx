import React, { memo, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// import UsageToggle from './UsageToggle';
import Iconify from '../../../components/iconify';
import { selectAccountId, updateWorkflowExecutions } from '../../../redux/slices/general';
import { dispatch, useSelector } from '../../../redux/store';
import { optimai } from '../../../utils/axios';
import { fToNow } from '../../../utils/formatTime';

const selectWorkflows = (state) => state.general.account?.workflows;
// const selectWorkflowsLoading = (state) => state.general.accountAssetsLoading.workflows;

const TIME_RANGES = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  ALL: null,
};

const AGGREGATION_PERIODS = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

const CREDIT_COST_PER_TASK = 0.3;

// Add status configuration
const statusConfig = {
  error: {
    color: 'bg-red-900 text-red-200',
    icon: 'mdi:alert-circle',
  },
  success: {
    color: 'bg-green-900 text-green-200',
    icon: 'mdi:check-circle',
  },
  running: {
    color: 'bg-blue-900 text-blue-200',
    icon: 'mdi:progress-clock',
  },
  completed: {
    color: 'bg-green-900 text-green-200',
    icon: 'mdi:check-circle',
  },
  failed: {
    color: 'bg-red-900 text-red-200',
    icon: 'mdi:alert-circle',
  },
};

// Helper function for trend calculation
// const calculateTrends = (data) => {
//   if (data.length < 2) return { trend: 0 };

//   const recent = data.slice(-7);
//   const previous = data.slice(-14, -7);

//   const recentSum = recent.reduce((sum, day) => sum + day.total, 0);
//   const previousSum = previous.reduce((sum, day) => sum + day.total, 0);

//   console.log('Trend calculation:', { recentSum, previousSum });

//   return {
//     trend: previousSum ? ((recentSum - previousSum) / previousSum) * 100 : 0,
//   };
// };

// Helper functions for date aggregation
const getPeriodKey = (date, aggregation) => {
  switch (aggregation) {
    case 'WEEKLY':
      const week = new Date(date);
      week.setHours(0, 0, 0, 0);
      week.setDate(week.getDate() - week.getDay()); // Start of week (Sunday)
      return week.toISOString();
    case 'MONTHLY':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    default: // DAILY
      return date.toISOString().split('T')[0];
  }
};

const getPeriodStart = (date, aggregation) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  switch (aggregation) {
    case 'WEEKLY':
      result.setDate(result.getDate() - result.getDay()); // Start of week (Sunday)
      break;
    case 'MONTHLY':
      result.setDate(1); // Start of month
      break;
    default: // DAILY
      break;
  }

  return result;
};

// Update tooltip formatter to show appropriate date format
const getTooltipLabel = (timestamp, aggregation) => {
  const date = new Date(timestamp);
  switch (aggregation) {
    case 'WEEKLY':
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `Week of ${date.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
    case 'MONTHLY':
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    default: // DAILY
      return date.toLocaleDateString();
  }
};

const RecentExecutions = ({ executions, showCredits }) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const itemsPerPage = 5;

  const filteredExecutions = useMemo(() => {
    if (statusFilter === 'all') return executions;

    return executions.filter((exec) => {
      const status = exec.status.toLowerCase();
      if (statusFilter === 'success') {
        return status === 'success' || status === 'completed';
      }
      if (statusFilter === 'error') {
        return status === 'error' || status === 'failed';
      }
      return true;
    });
  }, [executions, statusFilter]);

  const totalPages = Math.ceil(filteredExecutions.length / itemsPerPage);

  const paginatedExecutions = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredExecutions.slice(start, start + itemsPerPage);
  }, [filteredExecutions, page]);

  useEffect(() => {
    setPage(1); // Reset to first page when filter changes
  }, [statusFilter]);

  const handleRowClick = (execution) => {
    // Open in new tab with correct workflow ID
    window.open(`/flows/${execution.workflow_id}?execution=${execution.id}`, '_blank');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Recent Executions</h3>

        <div className="flex rounded-md overflow-hidden">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-sm ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('success')}
            className={`px-3 py-1.5 text-sm ${
              statusFilter === 'success'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Success
          </button>
          <button
            onClick={() => setStatusFilter('error')}
            className={`px-3 py-1.5 text-sm ${
              statusFilter === 'error'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Error
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Workflow
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                {showCredits ? 'Credits' : 'Tasks'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedExecutions.map((exec) => (
              <tr
                key={exec.id}
                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleRowClick(exec)}
              >
                <td className="px-4 py-3 text-sm">{exec.workflow_name}</td>
                <td className="px-4 py-3 text-sm">{fToNow(exec.date_creation)}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                      statusConfig[exec.status.toLowerCase()]?.color ||
                      'bg-yellow-900 text-yellow-200'
                    }`}
                  >
                    <Iconify
                      icon={statusConfig[exec.status.toLowerCase()]?.icon || 'mdi:help-circle'}
                      width={14}
                      height={14}
                    />
                    {exec.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {showCredits ? (exec.credits * CREDIT_COST_PER_TASK).toFixed(2) : exec.credits}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <nav className="flex items-center space-x-2">
              <button
                className={`px-3 py-1 rounded text-sm ${
                  page > 1
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  page < totalPages
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

const TopWorkflows = ({ workflows, showCredits }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(workflows.length / itemsPerPage);

  const handleRowClick = (workflow) => {
    window.open(`/flows/${workflow.id}`, '_blank');
  };

  const paginatedWorkflows = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return workflows.slice(start, start + itemsPerPage);
  }, [workflows, page]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium text-white mb-4">Top Workflows</h3>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                {showCredits ? 'Credits' : 'Tasks'}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Usage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedWorkflows.map((workflow) => (
              <tr
                key={workflow.id}
                className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                onClick={() => handleRowClick(workflow)}
              >
                <td className="px-4 py-3 text-sm">{workflow.name}</td>
                <td className="px-4 py-3 text-sm text-right">
                  {showCredits
                    ? (workflow.total_credits * CREDIT_COST_PER_TASK).toFixed(2)
                    : workflow.total_credits.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        workflow.successRate >= 90
                          ? 'bg-green-900 text-green-200'
                          : workflow.successRate >= 70
                            ? 'bg-yellow-900 text-yellow-200'
                            : 'bg-red-900 text-red-200'
                      }`}
                    >
                      {workflow.successRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-end">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${workflow.percentage}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <nav className="flex items-center space-x-2">
              <button
                className={`px-3 py-1 rounded text-sm ${
                  page > 1
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  page < totalPages
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

const formatNumber = (number) => {
  if (number >= 1e6) {
    return `${(number / 1e6).toFixed(2)}M`;
  }
  if (number >= 1e3) {
    return `${(number / 1e3).toFixed(1)}k`;
  }
  return number.toLocaleString();
};

const ExecutionsWidget = () => {
  const navigate = useNavigate();
  const workflows = useSelector(selectWorkflows);
  const accountId = useSelector(selectAccountId);
  const [isLoadingExecutions, setIsLoadingExecutions] = React.useState(true);
  const workflowExecutionsInitialized = useSelector(
    (state) => state.general.workflowExecutionsInitialized,
  );
  const [timeRange, setTimeRange] = useState('ALL');
  const [aggregation, setAggregation] = useState('DAILY');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showCredits, setShowCredits] = useState(false);

  // Add fetch logic
  React.useEffect(() => {
    const fetchExecutions = async () => {
      if (!workflows?.length || !accountId) return;

      if (workflowExecutionsInitialized) {
        // console.log('executions already initialized');
        setIsLoadingExecutions(false);
        return;
      }

      // console.log('starting download');
      setIsLoadingExecutions(true);
      try {
        const response = await optimai.post(`/account/${accountId}/gq`, {
          workflows: {
            '@fields': ['id', 'name', 'date_creation'],
            // '@filter': { id: { _in: workflows.map((w) => w.id) } },
            executions: {
              '@fields': ['id', 'credits', 'date_creation', 'altaner_id', 'status'],
            },
          },
        });

        if (response.data?.workflows?.items) {
          dispatch(updateWorkflowExecutions(response.data.workflows.items));
        }
      } catch (error) {
        console.error('Error fetching executions:', error);
      } finally {
        setIsLoadingExecutions(false);
      }
    };

    fetchExecutions();
  }, [accountId, workflows, workflowExecutionsInitialized]);

  // Filter executions based on selected workflow
  const filteredExecutions = useMemo(() => {
    const allExecutions = [];
    workflows?.forEach((workflow) => {
      // Skip if a workflow is selected and it's not this one
      if (selectedWorkflow && workflow.name !== selectedWorkflow) return;

      workflow.executions?.items?.forEach((exec) => {
        allExecutions.push({
          id: exec.id,
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          date_creation: exec.date_creation,
          status: exec.status,
          credits: exec.credits,
        });
      });
    });
    return allExecutions.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
  }, [workflows, selectedWorkflow]);

  // Update chart data based on filtered executions
  const { chartData, workflowNames, stats } = useMemo(() => {
    if (!workflows?.length)
      return {
        chartData: [],
        workflowNames: [],
        stats: {
          total: { tasks: 0, credits: 0 },
          dailyAvg: { tasks: 0, credits: 0 },
          monthlyAvg: { tasks: 0, credits: 0 },
        },
      };

    // Collect all workflow names first
    const names = new Set();
    workflows.forEach((workflow) => names.add(workflow.name));

    // Find min and max dates from filtered executions
    let minDate = new Date();
    let maxDate = new Date(0);
    let total = 0;
    const allExecutions = [];

    filteredExecutions.forEach((exec) => {
      if (!exec.credits || exec.credits <= 0) return;

      const execDate = new Date(exec.date_creation);
      minDate = execDate < minDate ? execDate : minDate;
      maxDate = execDate > maxDate ? execDate : maxDate;
      total += exec.credits;
      allExecutions.push({
        date: execDate,
        credits: exec.credits,
      });
    });

    // Adjust date range based on selection
    const daysToInclude = TIME_RANGES[timeRange];
    const cutoffDate = daysToInclude
      ? new Date(maxDate.getTime() - daysToInclude * 24 * 60 * 60 * 1000)
      : minDate;

    // Group executions by period
    const dataMap = new Map();
    let totalTasks = 0;

    allExecutions
      .filter((exec) => exec.date >= cutoffDate)
      .forEach((exec) => {
        const periodKey = getPeriodKey(exec.date, aggregation);
        if (!dataMap.has(periodKey)) {
          dataMap.set(periodKey, {
            date: getPeriodStart(exec.date, aggregation).getTime(),
            tasks: 0,
            credits: 0,
          });
        }
        dataMap.get(periodKey).tasks += 1;
        dataMap.get(periodKey).credits += CREDIT_COST_PER_TASK;
        totalTasks += 1;
      });

    const sortedData = Array.from(dataMap.values()).sort((a, b) => a.date - b.date);

    // console.log('Processed chart data:', {
    //   timeRange,
    //   aggregation,
    //   points: sortedData.length,
    //   firstPoint: sortedData[0],
    // });

    // Calculate averages
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const totalMonths =
      maxDate.getMonth() -
      minDate.getMonth() +
      12 * (maxDate.getFullYear() - minDate.getFullYear()) +
      1;

    return {
      chartData: sortedData,
      workflowNames: Array.from(names),
      stats: {
        total: {
          tasks: totalTasks,
          credits: totalTasks * CREDIT_COST_PER_TASK,
        },
        dailyAvg: {
          tasks: totalTasks / totalDays,
          credits: (totalTasks * CREDIT_COST_PER_TASK) / totalDays,
        },
        monthlyAvg: {
          tasks: totalTasks / totalMonths,
          credits: (totalTasks * CREDIT_COST_PER_TASK) / totalMonths,
        },
      },
    };
  }, [workflows, filteredExecutions, timeRange, aggregation]);

  // Filter top workflows based on selected workflow
  const topWorkflows = useMemo(() => {
    if (!workflows?.length) return [];

    const workflowStats = workflows
      .filter((workflow) => !selectedWorkflow || workflow.name === selectedWorkflow)
      .map((workflow) => {
        const executions = workflow.executions?.items || [];
        const total = executions.reduce((sum, exec) => sum + (exec.credits || 0), 0);
        const successCount = executions.filter(
          (exec) =>
            exec.status?.toLowerCase() === 'success' || exec.status?.toLowerCase() === 'completed',
        ).length;
        const successRate = executions.length ? (successCount / executions.length) * 100 : 0;

        return {
          id: workflow.id,
          name: workflow.name,
          total_credits: total,
          successRate,
          executionsCount: executions.length,
        };
      });

    const sortedWorkflows = workflowStats.sort((a, b) => b.total_credits - a.total_credits);

    const maxCredits = sortedWorkflows[0]?.total_credits || 1;
    return sortedWorkflows.map((workflow) => ({
      ...workflow,
      percentage: (workflow.total_credits / maxCredits) * 100,
    }));
  }, [workflows, selectedWorkflow]);

  // Show loading state
  if (isLoadingExecutions) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-48 mb-4"></div>
        <div className="h-[400px] bg-gray-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with title and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/usage')}
            className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-gray-200"
          >
            <Iconify
              icon="mdi:arrow-left"
              width={24}
            />
          </button>
          <h2 className="text-xl font-semibold text-gray-100">Task Usage</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
          {/* Workflow Selector */}
          <select
            value={selectedWorkflow || ''}
            onChange={(e) => setSelectedWorkflow(e.target.value || null)}
            className="w-full sm:w-auto bg-gray-800 text-gray-300 rounded px-3 py-1.5 text-sm border-0 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Workflows</option>
            {workflowNames.map((name) => (
              <option
                key={name}
                value={name}
              >
                {name}
              </option>
            ))}
          </select>

          <div className="flex rounded-md overflow-hidden w-full sm:w-auto">
            <button
              onClick={() => setShowCredits(false)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-sm ${!showCredits ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Tasks
            </button>
            <button
              onClick={() => setShowCredits(true)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-sm ${showCredits ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Credits
            </button>
          </div>

          <div className="flex rounded-md overflow-hidden w-full sm:w-auto">
            {Object.keys(TIME_RANGES).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-sm ${timeRange === range ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {range}
              </button>
            ))}
          </div>

          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value)}
            className="w-full sm:w-auto bg-gray-800 text-gray-300 rounded px-3 py-1.5 text-sm border-0 focus:ring-2 focus:ring-blue-600"
          >
            {Object.entries(AGGREGATION_PERIODS).map(([key, label]) => (
              <option
                key={key}
                value={key}
              >
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">
            {showCredits ? 'Total Credits' : 'Executed Tasks'}
          </div>
          <div className="text-2xl font-semibold text-white">
            {showCredits ? formatNumber(stats.total.credits) : formatNumber(stats.total.tasks)}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Daily Average</div>
          <div className="text-2xl font-semibold text-white">
            {showCredits
              ? formatNumber(stats.dailyAvg.credits)
              : formatNumber(stats.dailyAvg.tasks)}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Monthly Average</div>
          <div className="text-2xl font-semibold text-white">
            {showCredits
              ? formatNumber(stats.monthlyAvg.credits)
              : formatNumber(stats.monthlyAvg.tasks)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] sm:h-[400px] mb-6">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
            />
            <XAxis
              dataKey="date"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => getTooltipLabel(timestamp, aggregation)}
              stroke="#9CA3AF"
            />
            <YAxis
              stroke="#9CA3AF"
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.375rem',
                color: '#D1D5DB',
              }}
              formatter={(value) => [
                `${
                  showCredits ? `${value.toFixed(2)} credits` : `${value.toLocaleString()} tasks`
                }`,
              ]}
              labelFormatter={(timestamp) => getTooltipLabel(timestamp, aggregation)}
            />
            <Line
              type="monotone"
              dataKey={showCredits ? 'credits' : 'tasks'}
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExecutions
          executions={filteredExecutions}
          showCredits={showCredits}
        />
        <TopWorkflows
          workflows={topWorkflows}
          showCredits={showCredits}
        />
      </div>
    </div>
  );
};

export default memo(ExecutionsWidget);
