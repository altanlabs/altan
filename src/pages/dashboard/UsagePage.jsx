import { Box, CircularProgress, Container, Typography, useTheme } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  isValid,
  isWithinInterval,
  endOfDay,
  startOfDay,
} from 'date-fns';
import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import Iconify from '../../components/iconify';
import { CompactLayout } from '../../layouts/dashboard';
import { selectAccountId, selectAccountSubscriptions } from '../../redux/slices/general';
import { useSelector as useReduxSelector } from '../../redux/store';
import { optimai } from '../../utils/axios';

// Usage colors - consistent throughout the app
const USAGE_COLORS = {
  ai: '#00E559', // Green for AI/Chat
  task: '#FF8A01', // Orange for Tasks/Realtime
  database: '#3B82F6', // Blue for Database
};

// Use the same colors for charts
const CREDIT_TYPES = {
  ai: '#00E559', // Green for AI/Chat
  task: '#FF8A01', // Orange for Tasks/Realtime
  database: '#3B82F6', // Blue for Database
};

// These colors adapt based on theme
const getThemeColors = (isDarkMode) => ({
  background: isDarkMode ? '#121212' : '#F8F9FA',
  cardBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  text: isDarkMode ? '#E0E0E0' : '#212529',
  secondaryText: isDarkMode ? '#9CA3AF' : '#6C757D',
  border: isDarkMode ? '#424242' : '#DEE2E6',
  accent: isDarkMode ? '#3B82F6' : '#0D6EFD',
  chart: {
    grid: isDarkMode ? '#374151' : '#E9ECEF',
    axis: isDarkMode ? '#9CA3AF' : '#6C757D',
    tooltip: {
      bg: isDarkMode ? '#1F2937' : '#FFFFFF',
      border: isDarkMode ? '#374151' : '#DEE2E6',
      text: isDarkMode ? '#D1D5DB' : '#212529',
    },
  },
});

// Only the credit types we want to show in the chart
const CHART_CREDIT_TYPES = ['ai', 'task', 'database'];

// Helper Function to aggregate data
const aggregateData = (data, groupBy) => {
  if (!data || data.length === 0) return [];

  const grouped = data.reduce((acc, item) => {
    const itemDate = parseISO(item.date);
    if (!isValid(itemDate)) return acc;

    let key;
    try {
      key =
        groupBy === 'weekly'
          ? format(startOfWeek(itemDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
          : groupBy === 'monthly'
            ? format(startOfMonth(itemDate), 'yyyy-MM')
            : item.date;
    } catch {
      return acc;
    }

    if (!acc[key]) {
      acc[key] = { date: key };
    }

    Object.entries(item).forEach(([k, v]) => {
      if (k !== 'date' && typeof v === 'number') {
        acc[key][k] = (acc[key][k] || 0) + v;
      }
    });

    return acc;
  }, {});

  return Object.values(grouped).map((item) => {
    const displayDate =
      groupBy === 'monthly' && item.date.length === 7
        ? format(parseISO(item.date + '-01'), 'yyyy-MM-dd')
        : item.date;
    return { ...item, displayDate };
  });
};

// Usage Overview Component
const UsageOverview = ({
  stats,
  isDarkMode,
  billingCycle,
  containerStyle,
  subscriptionData,
  history, // Add history prop
}) => {
  const totalCredits = stats.totalCredits || 0; // Usage-based credits from API
  const monthlyBudget = subscriptionData.totalCredits || 10000; // Get budget from subscription
  const usagePercentage = subscriptionData.usagePercentage || 0; // Use subscription-based percentage

  // Calculate percentages for each credit type
  const usageBreakdown = useMemo(() => {
    if (totalCredits === 0) return [];

    return [
      {
        type: 'ai',
        label: 'AI',
        credits: stats.aiCredits || 0,
        percentage: (((stats.aiCredits || 0) / totalCredits) * 100).toFixed(2), // Percentage within used credits
        budgetPercentage: (((stats.aiCredits || 0) / monthlyBudget) * 100).toFixed(2), // Percentage of total budget
        color: USAGE_COLORS.ai,
      },
      {
        type: 'task',
        label: 'Task',
        credits: stats.taskCredits || 0,
        percentage: (((stats.taskCredits || 0) / totalCredits) * 100).toFixed(2),
        budgetPercentage: (((stats.taskCredits || 0) / monthlyBudget) * 100).toFixed(2),
        color: USAGE_COLORS.task,
      },
      {
        type: 'database',
        label: 'Database',
        credits: stats.databaseCredits || 0,
        percentage: (((stats.databaseCredits || 0) / totalCredits) * 100).toFixed(2),
        budgetPercentage: (((stats.databaseCredits || 0) / monthlyBudget) * 100).toFixed(2),
        color: USAGE_COLORS.database,
      },
    ].filter((item) => item.credits > 0);
  }, [stats, totalCredits, monthlyBudget]);

  const topUsageType =
    usageBreakdown.length > 0
      ? usageBreakdown.reduce((max, current) =>
          parseFloat(current.percentage) > parseFloat(max.percentage) ? current : max,
        )
      : null;

  // Calculate billing cycle progress
  const now = new Date();
  const cycleProgress =
    billingCycle.startDate && billingCycle.endDate
      ? Math.min(
          100,
          Math.max(
            0,
            ((now - billingCycle.startDate) / (billingCycle.endDate - billingCycle.startDate)) *
              100,
          ),
        )
      : 0;

  return (
    <div
      className={`w-full rounded-3xl px-9 py-9 sm:px-12 sm:py-12 mb-6 ${containerStyle} border y-200'}`}
    >
      <div className="mx-auto max-w-4xl">
        {/* Greeting Message */}
        <div className="w-full mb-8">
          Good morning. You are currently subscribed to a{' '}
          <span
            className={`rounded-sm px-2 py-1 font-medium text-white ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            }`}
          >
            {(() => {
              const planName = subscriptionData.planName || 'Pro Plan';
              // For Growth plans, remove the price suffix (e.g., "Growth €800" -> "Growth")
              if (planName.startsWith('Growth ')) {
                return 'Growth';
              }
              return planName;
            })()}
          </span>{' '}
          plan. You have used{' '}
          <span
            className={`rounded-sm px-2 py-1 font-medium ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
            }`}
          >
            {usagePercentage}%
          </span>{' '}
          of your compute budget for the current billing cycle.{' '}
          {topUsageType && (
            <span>
              Most of your usage is coming from{' '}
              <span className="font-medium">{topUsageType.label}</span>.
            </span>
          )}
        </div>

        {/* Timeline and Usage Chart */}
        <div className="flex justify-center">
          <div className="flex w-full max-w-2xl flex-col justify-center">
            {/* Billing Cycle Timeline */}
            <div className="mx-2">
              <div
                className={`mb-1 flex w-full justify-between text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <span className="uppercase">{billingCycle.startLabel}</span>
                <span className="uppercase">{billingCycle.endLabel}</span>
              </div>
              <div
                className={`mt-1 h-[3px] w-full rounded-2xl ${
                  isDarkMode ? 'bg-gray-900' : 'bg-gray-200'
                } shadow-inner`}
              >
                <div
                  className={`h-full rounded-2xl ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}
                  style={{ width: `${cycleProgress}%` }}
                />
              </div>
            </div>

            {/* Usage Breakdown Chart */}
            <div
              className={`relative mt-1.5 flex h-20 w-full rounded-2xl px-2 py-2 ${
                isDarkMode
                  ? 'bg-gray-900 border border-gray-800'
                  : 'bg-gray-100 border border-gray-300'
              } shadow-inner`}
            >
              {usageBreakdown.map((item, index) => {
                // Calculate the actual width based on budget usage, not relative percentage
                const budgetUsagePercentage = parseFloat(item.budgetPercentage);
                const isFirst = index === 0;
                const isLast = index === usageBreakdown.length - 1;

                return (
                  <div
                    key={item.type}
                    className="relative h-full border border-opacity-20"
                    aria-label={`${item.label}: ${item.budgetPercentage}% of budget`}
                    style={{
                      width: `${budgetUsagePercentage}%`,
                      backgroundColor: isDarkMode ? `${item.color}E6` : `${item.color}CC`, // Different opacity for light/dark
                      borderColor: item.color,
                      boxShadow: isDarkMode
                        ? 'inset 0px 1px 5px 0px rgba(255, 255, 255, 0.1), inset 0px 1px 1px 0px rgba(255, 255, 255, 0.1)'
                        : 'inset 0px 1px 3px 0px rgba(0, 0, 0, 0.1), inset 0px 1px 1px 0px rgba(255, 255, 255, 0.3)',
                      borderRadius:
                        isFirst && isLast
                          ? '10px'
                          : isFirst
                            ? '10px 3px 3px 10px'
                            : isLast
                              ? '3px 10px 10px 3px'
                              : '3px',
                    }}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="mx-2 mt-3 flex min-h-8 flex-wrap gap-x-4 gap-y-1.5">
              {usageBreakdown.map((item) => (
                <div
                  key={item.type}
                  className={`flex items-center space-x-2 text-xs ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-500'
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full border"
                    style={{
                      background: `linear-gradient(to top, ${item.color}, color-mix(in srgb, ${item.color} 85%, black))`,
                      borderColor: item.color,
                    }}
                  />
                  <span className="capitalize font-medium">{item.label}</span>
                  <span>{item.budgetPercentage}%</span>
                </div>
              ))}
            </div>

            {/* Credit Usage Summary */}
            <div className="mx-2 mt-4 flex justify-between items-center">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">Credit Spent:</span> €{stats.estimatedCost}
              </div>

              {/* Upgrade Link */}
              <button
                onClick={() => history.push('/pricing')}
                className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Upgrade
              </button>

              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">Remaining Credits:</span> €
                {stats.remainingCreditsEuro}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsagePage = () => {
  const accountId = useSelector(selectAccountId);
  const history = useHistory();
  const theme = useTheme();
  const activeSubscriptions = useReduxSelector(selectAccountSubscriptions);
  const [rawUsageData, setRawUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDarkMode = theme.palette.mode === 'dark';
  const UI_COLORS = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);

  // Get basic subscription data the same way as UpgradeButton.jsx
  const getBasicSubscriptionData = useCallback(() => {
    if (!activeSubscriptions?.[0]) {
      return {
        totalCredits: 1000, // Free plan default credits
        remainingCredits: 0,
        planName: 'Free',
        usagePercentage: 0,
      };
    }

    const subscription = activeSubscriptions[0];
    const totalCredits = subscription?.meta_data?.custom_subscription
      ? Number(subscription?.meta_data?.total_credits ?? 0)
      : Number(subscription?.billing_option?.plan?.credits ?? 0);
    const remainingCredits = Number(subscription?.credit_balance ?? 0);
    const planName = subscription?.billing_option?.plan?.name || 'Free';
    const usedCredits = totalCredits - remainingCredits;
    const usagePercentage = totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0;

    return { totalCredits, remainingCredits, planName, usagePercentage };
  }, [activeSubscriptions]);

  // Get billing cycle information
  const getBillingCycleData = useCallback(() => {
    if (!activeSubscriptions?.[0]) {
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        startDate: startOfCurrentMonth,
        endDate: endOfCurrentMonth,
        startLabel: format(startOfCurrentMonth, 'MMM d'),
        endLabel: format(endOfCurrentMonth, 'MMM d'),
      };
    }

    const subscription = activeSubscriptions[0];
    const lastPaymentDate = subscription?.last_payment_date
      ? parseISO(subscription.last_payment_date)
      : startOfMonth(new Date());
    const expirationDate = subscription?.expiration_date
      ? parseISO(subscription.expiration_date)
      : new Date(
          lastPaymentDate.getFullYear(),
          lastPaymentDate.getMonth() + 1,
          lastPaymentDate.getDate(),
        );

    return {
      startDate: lastPaymentDate,
      endDate: expirationDate,
      startLabel: format(lastPaymentDate, 'MMM d'),
      endLabel: format(expirationDate, 'MMM d'),
    };
  }, [activeSubscriptions]);

  const subscriptionData = getBasicSubscriptionData();
  const billingCycle = getBillingCycleData();

  // Get container background based on theme
  const getContainerStyles = () => {
    if (theme.palette.mode === 'dark') {
      return 'bg-[#1c1c1c]';
    } else {
      return 'bg-white';
    }
  };

  // Filters State
  const [timeframe, setTimeframe] = useState('daily');
  const [creditType, setCreditType] = useState('all');
  const [dateRange, setDateRange] = useState(() => {
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
    const endDate = new Date();
    return [startDate, endDate];
  });
  const [chartType, setChartType] = useState('bar');

  // Listen for theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Theme changes are handled by the theme context, so we don't need to do anything here
      // This effect can be removed if not needed
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fetch Data Effect
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!accountId) {
        setLoading(false);
        setError('Account ID not found.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await optimai.get(`/account/${accountId}/usage`);
        const processed = Object.entries(response.data.daily_usage || {}).map(([date, types]) => {
          const metrics = { date };
          Object.entries(types).forEach(([type, typeMetrics]) => {
            metrics[`${type}_credits`] = typeMetrics.credits || 0;
            metrics[`${type}_input_tokens`] = typeMetrics.input_tokens || 0;
            metrics[`${type}_output_tokens`] = typeMetrics.output_tokens || 0;
            metrics[`${type}_total_tokens`] =
              (typeMetrics.input_tokens || 0) + (typeMetrics.output_tokens || 0);
          });
          return metrics;
        });
        setRawUsageData(processed);
      } catch {
        setError('Failed to fetch usage data.');
        setRawUsageData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [accountId]);

  // Process data for display
  const processedData = useMemo(() => {
    if (!rawUsageData.length) return [];

    const [start, end] = dateRange;
    const startDate = start ? startOfDay(start) : null;
    const endDate = end ? endOfDay(end) : null;

    const dateFilteredData = rawUsageData.filter((item) => {
      const itemDate = parseISO(item.date);
      if (!isValid(itemDate) || !startDate || !endDate) return false;
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });

    return aggregateData(dateFilteredData, timeframe).sort((a, b) => {
      const dateA = parseISO(a.displayDate || a.date);
      const dateB = parseISO(b.displayDate || b.date);
      if (!isValid(dateA) || !isValid(dateB)) return 0;
      return dateA - dateB;
    });
  }, [rawUsageData, dateRange, timeframe]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totals = {
      totalCredits: 0,
      totalTokens: 0,
      taskCredits: 0,
      aiCredits: 0,
      databaseCredits: 0,
    };

    processedData.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value !== 'number') return;
        if (key.endsWith('_credits')) {
          totals.totalCredits += value;
          if (key === 'task_credits') {
            totals.taskCredits += value;
          } else if (key === 'ai_credits') {
            totals.aiCredits += value;
          } else if (key === 'database_credits') {
            totals.databaseCredits += value;
          }
        } else if (key.endsWith('_total_tokens')) {
          totals.totalTokens += value;
        }
      });
    });

    return {
      totalCredits: Math.round(totals.totalCredits),
      totalTokens: Math.round(totals.totalTokens),
      estimatedCost: Math.round(totals.totalCredits / 100),
      remainingCreditsEuro: Math.round(subscriptionData.remainingCredits / 100),
      totalTaskCredits: Math.round(totals.taskCredits * 3),
      aiCredits: Math.round(totals.aiCredits),
      taskCredits: Math.round(totals.taskCredits),
      databaseCredits: Math.round(totals.databaseCredits),
    };
  }, [processedData, subscriptionData.remainingCredits]);

  // Chart rendering
  const renderChart = () => {
    if (loading) {
      return (
        <Box className="flex justify-center items-center h-full">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Typography className="text-center mt-4 text-red-500 dark:text-red-400">{error}</Typography>
      );
    }

    if (!processedData.length) {
      return (
        <Typography className="text-center mt-4 text-gray-500 dark:text-gray-400">
          No data available for the selected filters.
        </Typography>
      );
    }

    const chartProps = {
      data: processedData,
      margin: { top: 5, right: 20, left: 10, bottom: 5 },
      className: 'w-full h-full',
    };

    const commonElements = (
      <>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={UI_COLORS.chart.grid || '#e0e0e0'}
        />
        <XAxis
          dataKey="displayDate"
          stroke={UI_COLORS.chart.axis}
          tickFormatter={(dateStr) => {
            const date = parseISO(dateStr);
            if (!isValid(date)) return '';
            return timeframe === 'monthly' ? format(date, 'MMM yyyy') : format(date, 'MMM dd');
          }}
        />
        <YAxis stroke={UI_COLORS.chart.axis} />
        <Tooltip
          contentStyle={{
            backgroundColor: UI_COLORS.chart.tooltip.bg,
            border: `1px solid ${UI_COLORS.chart.tooltip.border}`,
            borderRadius: '0.375rem',
            color: UI_COLORS.chart.tooltip.text,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        />
        <Legend />
      </>
    );

    const getChartComponent = () => {
      switch (chartType) {
        case 'line':
          return (
            <LineChart {...chartProps}>
              {commonElements}
              {creditType === 'all' ? (
                CHART_CREDIT_TYPES.map((type) => (
                  <Line
                    key={type}
                    type="monotone"
                    dataKey={`${type}_credits`}
                    name={`${type.toUpperCase()} Credits`}
                    stroke={CREDIT_TYPES[type]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={`${creditType}_credits`}
                  stroke={CREDIT_TYPES[creditType] || CREDIT_TYPES.ai}
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          );
        case 'bar':
          return (
            <BarChart {...chartProps}>
              {commonElements}
              {creditType === 'all' ? (
                CHART_CREDIT_TYPES.map((type) => (
                  <Bar
                    key={type}
                    dataKey={`${type}_credits`}
                    name={`${type.toUpperCase()} Credits`}
                    fill={CREDIT_TYPES[type]}
                    stackId="credits"
                  />
                ))
              ) : (
                <Bar
                  dataKey={`${creditType}_credits`}
                  fill={CREDIT_TYPES[creditType] || CREDIT_TYPES.ai}
                />
              )}
            </BarChart>
          );
        default:
          return (
            <AreaChart {...chartProps}>
              {commonElements}
              {creditType === 'all' ? (
                CHART_CREDIT_TYPES.map((type) => (
                  <Area
                    key={type}
                    type="monotone"
                    dataKey={`${type}_credits`}
                    name={`${type.toUpperCase()} Credits`}
                    stroke={CREDIT_TYPES[type]}
                    fill={CREDIT_TYPES[type]}
                    fillOpacity={0.1}
                    stackId="credits"
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey={`${creditType}_credits`}
                  stroke={CREDIT_TYPES[creditType] || CREDIT_TYPES.ai}
                  fill={CREDIT_TYPES[creditType] || CREDIT_TYPES.ai}
                  fillOpacity={0.1}
                />
              )}
            </AreaChart>
          );
      }
    };

    return getChartComponent();
  };

  return (
    <>
      <Container sx={{ pb: 6, pt: 10 }}>
        {/* Usage Overview Section */}
        <UsageOverview
          stats={stats}
          isDarkMode={isDarkMode}
          billingCycle={billingCycle}
          containerStyle={getContainerStyles()}
          subscriptionData={subscriptionData}
          history={history} // Pass history prop
        />
        {/* Header with title and controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Title and Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Detailed Usage Analytics
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => history.push('/usage/tasks')}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md flex items-center gap-2 shadow-sm self-start sm:self-auto"
              >
                <span>View Task Usage</span>
                <Iconify
                  icon="mdi:arrow-right"
                  width={16}
                />
              </button>
              <button
                onClick={() => history.push('/usage/databases')}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md flex items-center gap-2 shadow-sm self-start sm:self-auto"
              >
                <span>View Database Usage</span>
                <Iconify
                  icon="mdi:arrow-right"
                  width={16}
                />
              </button>
            </div>
          </div>

          {/* Filters Section - Better Mobile Layout */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left side filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Credit Type Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Type
                </label>
                <select
                  value={creditType}
                  onChange={(e) => setCreditType(e.target.value)}
                  className={`w-full sm:w-32 ${getContainerStyles()} text-gray-700 dark:text-gray-300 rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`}
                >
                  <option value="all">All Types</option>
                  <option value="ai">AI</option>
                  <option value="task">Task</option>
                  <option value="database">Database</option>
                </select>
              </div>

              {/* Timeframe Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Period
                </label>
                <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setTimeframe('daily')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      timeframe === 'daily'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : `${getContainerStyles()} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTimeframe('weekly')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-l border-r border-gray-200 dark:border-gray-700 ${
                      timeframe === 'weekly'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : `${getContainerStyles()} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTimeframe('monthly')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      timeframe === 'monthly'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : `${getContainerStyles()} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Date Range
                </label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateRangePicker
                    value={dateRange}
                    onChange={(newValue) => setDateRange(newValue)}
                    maxDate={new Date()}
                    slotProps={{
                      textField: {
                        size: 'small',
                        className: `w-full ${getContainerStyles()} text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`,
                        sx: {
                          '& .MuiInputBase-root': {
                            fontSize: '0.875rem',
                            height: '38px',
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            {/* Chart Type Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Chart
              </label>
              <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <button
                  onClick={() => setChartType('area')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    chartType === 'area'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : `${getContainerStyles()} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-l border-r border-gray-200 dark:border-gray-700 ${
                    chartType === 'line'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : `${getContainerStyles()} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    chartType === 'bar'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : `${getContainerStyles()} text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  Bar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Better Mobile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-6">
          <div
            className={`${getContainerStyles()} rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700`}
          >
            <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
              Total Tokens
            </div>
            <div className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {loading ? (
                <div className="animate-pulse h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-24"></div>
              ) : (
                stats.totalTokens.toLocaleString()
              )}
            </div>
          </div>
          <div
            className={`${getContainerStyles()} rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-700`}
          >
            <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
              Total Tasks
            </div>
            <div className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {loading ? (
                <div className="animate-pulse h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-24"></div>
              ) : (
                stats.totalTaskCredits.toLocaleString()
              )}
            </div>
          </div>
        </div>

        {/* Chart - Responsive Height */}
        <div
          className={`${getContainerStyles()} rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6`}
        >
          <div className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 sm:mb-6">
            Usage Credits {creditType !== 'all' && `(${creditType.toUpperCase()})`}
          </div>
          <div style={{ width: '100%', height: 'clamp(400px, 50vh, 600px)' }}>
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(UsagePage);
