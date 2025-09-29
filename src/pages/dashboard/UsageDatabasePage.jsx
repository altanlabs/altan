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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import Iconify from '../../components/iconify';
import { CompactLayout } from '../../layouts/dashboard';
import { selectAccountId } from '../../redux/slices/general';
import { optimai } from '../../utils/axios';

// Database usage colors - varied palette for different databases
const DATABASE_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F472B6', // Rose
];

// Theme colors helper
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

// Helper function to aggregate data
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

    // Aggregate by database (base_id)
    if (item.base_id) {
      const baseKey = `${item.base_id}_credits`;
      acc[key][baseKey] = (acc[key][baseKey] || 0) + (item.credits || 0);
    }

    // Also keep total credits
    acc[key].total_credits = (acc[key].total_credits || 0) + (item.credits || 0);

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

const UsageDatabasePage = () => {
  const accountId = useSelector(selectAccountId);
  const history = useHistory();
  const theme = useTheme();
  const [rawUsageData, setRawUsageData] = useState([]);
  const [databaseNames, setDatabaseNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDarkMode = theme.palette.mode === 'dark';
  const UI_COLORS = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);

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
  const [selectedDatabase, setSelectedDatabase] = useState('all');
  const [dateRange, setDateRange] = useState(() => {
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
    const endDate = new Date();
    return [startDate, endDate];
  });
  const [chartType, setChartType] = useState('bar');

  // Fetch database names
  const fetchDatabaseNames = useCallback(async (baseIds) => {
    if (!baseIds.length) return {};

    try {
      const promises = baseIds.map(async (baseId) => {
        try {
          const response = await optimai.get(`/database/${baseId}`);
          return { baseId, name: response.data.name || `Database ${baseId.slice(0, 8)}` };
        } catch {
          return { baseId, name: `Database ${baseId.slice(0, 8)}` };
        }
      });

      const results = await Promise.all(promises);
      const nameMap = {};
      results.forEach(({ baseId, name }) => {
        nameMap[baseId] = name;
      });

      return nameMap;
    } catch {
      const nameMap = {};
      baseIds.forEach((baseId) => {
        nameMap[baseId] = `Database ${baseId.slice(0, 8)}`;
      });
      return nameMap;
    }
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
        // Fetch raw database usage data
        const response = await optimai.get(
          `/account/${accountId}/usage?raw=true&credit_type=database`,
        );
        const rawData = response.data.usage || [];

        // Process the raw data to extract base_id from meta_data
        const processedData = rawData
          .filter((item) => item.meta_data && item.meta_data.base_id)
          .map((item) => ({
            date: item.date_creation.split('T')[0], // Extract date part
            base_id: item.meta_data.base_id,
            credits: item.altan_credits || 0,
            input_tokens: item.input_tokens || 0,
            output_tokens: item.output_tokens || 0,
          }));

        setRawUsageData(processedData);

        // Get unique base_ids and fetch their names
        const uniqueBaseIds = [...new Set(processedData.map((item) => item.base_id))];
        if (uniqueBaseIds.length > 0) {
          const names = await fetchDatabaseNames(uniqueBaseIds);
          setDatabaseNames(names);
        }
      } catch (err) {
        console.error('Error fetching database usage:', err);
        setError('Failed to fetch database usage data.');
        setRawUsageData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [accountId, fetchDatabaseNames]);

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

  // Get unique databases from processed data
  const availableDatabases = useMemo(() => {
    const databases = new Set();
    processedData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key.endsWith('_credits') && key !== 'total_credits') {
          const baseId = key.replace('_credits', '');
          databases.add(baseId);
        }
      });
    });
    return Array.from(databases);
  }, [processedData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totals = {
      totalCredits: 0,
      totalTokens: 0,
      databaseBreakdown: {},
    };

    rawUsageData.forEach((item) => {
      totals.totalCredits += item.credits || 0;
      totals.totalTokens += (item.input_tokens || 0) + (item.output_tokens || 0);

      if (item.base_id) {
        if (!totals.databaseBreakdown[item.base_id]) {
          totals.databaseBreakdown[item.base_id] = {
            credits: 0,
            tokens: 0,
            name: databaseNames[item.base_id] || `Database ${item.base_id.slice(0, 8)}`,
          };
        }
        totals.databaseBreakdown[item.base_id].credits += item.credits || 0;
        totals.databaseBreakdown[item.base_id].tokens +=
          (item.input_tokens || 0) + (item.output_tokens || 0);
      }
    });

    return {
      totalCredits: Math.round(totals.totalCredits),
      totalTokens: Math.round(totals.totalTokens),
      estimatedCost: Math.round(totals.totalCredits / 100),
      databaseBreakdown: totals.databaseBreakdown,
    };
  }, [rawUsageData, databaseNames]);

  // Prepare pie chart data
  const pieChartData = useMemo(() => {
    return Object.entries(stats.databaseBreakdown).map(([baseId, data], index) => ({
      name: data.name,
      value: data.credits,
      color: DATABASE_COLORS[index % DATABASE_COLORS.length],
      baseId,
    }));
  }, [stats.databaseBreakdown]);

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
          No database usage data available for the selected filters.
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
      const databases = selectedDatabase === 'all' ? availableDatabases : [selectedDatabase];

      switch (chartType) {
        case 'line':
          return (
            <LineChart {...chartProps}>
              {commonElements}
              {databases.map((baseId, index) => (
                <Line
                  key={baseId}
                  type="monotone"
                  dataKey={`${baseId}_credits`}
                  name={databaseNames[baseId] || `Database ${baseId.slice(0, 8)}`}
                  stroke={DATABASE_COLORS[index % DATABASE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          );
        case 'bar':
          return (
            <BarChart {...chartProps}>
              {commonElements}
              {databases.map((baseId, index) => (
                <Bar
                  key={baseId}
                  dataKey={`${baseId}_credits`}
                  name={databaseNames[baseId] || `Database ${baseId.slice(0, 8)}`}
                  fill={DATABASE_COLORS[index % DATABASE_COLORS.length]}
                  stackId="credits"
                />
              ))}
            </BarChart>
          );
        default:
          return (
            <AreaChart {...chartProps}>
              {commonElements}
              {databases.map((baseId, index) => (
                <Area
                  key={baseId}
                  type="monotone"
                  dataKey={`${baseId}_credits`}
                  name={databaseNames[baseId] || `Database ${baseId.slice(0, 8)}`}
                  stroke={DATABASE_COLORS[index % DATABASE_COLORS.length]}
                  fill={DATABASE_COLORS[index % DATABASE_COLORS.length]}
                  fillOpacity={0.1}
                  stackId="credits"
                />
              ))}
            </AreaChart>
          );
      }
    };

    return getChartComponent();
  };

  return (
    <CompactLayout
      noPadding
      title="Database Usage · Altan"
      className="min-h-screen"
    >
      <Container sx={{ pb: 6, pt: 4 }}>
        {/* Header with title and controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Title and Back Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => history.push('/usage')}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <Iconify
                  icon="mdi:arrow-left"
                  width={24}
                />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Database Usage Analytics
              </h2>
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left side filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Database Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Database
                </label>
                <select
                  value={selectedDatabase}
                  onChange={(e) => setSelectedDatabase(e.target.value)}
                  className={`w-full sm:w-48 ${getContainerStyles()} text-gray-700 dark:text-gray-300 rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm`}
                >
                  <option value="all">All Databases</option>
                  {availableDatabases.map((baseId) => (
                    <option
                      key={baseId}
                      value={baseId}
                    >
                      {databaseNames[baseId] || `Database ${baseId.slice(0, 8)}`}
                    </option>
                  ))}
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

        {/* Stats Cards and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`${getContainerStyles()} rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700`}
            >
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Total Database Credits
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                ) : (
                  stats.totalCredits.toLocaleString()
                )}
              </div>
            </div>
            <div
              className={`${getContainerStyles()} rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700`}
            >
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Tokens</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                ) : (
                  stats.totalTokens.toLocaleString()
                )}
              </div>
            </div>
            <div
              className={`${getContainerStyles()} rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700`}
            >
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Estimated Cost</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                ) : (
                  `€${stats.estimatedCost}`
                )}
              </div>
            </div>
            <div
              className={`${getContainerStyles()} rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700`}
            >
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Active Databases</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                ) : (
                  Object.keys(stats.databaseBreakdown).length
                )}
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div
            className={`${getContainerStyles()} rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700`}
          >
            <div className="text-base font-medium text-gray-900 dark:text-white mb-4">
              Usage by Database
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <CircularProgress size={32} />
              </div>
            ) : pieChartData.length > 0 ? (
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: UI_COLORS.chart.tooltip.bg,
                        border: `1px solid ${UI_COLORS.chart.tooltip.border}`,
                        borderRadius: '0.375rem',
                        color: UI_COLORS.chart.tooltip.text,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-48 text-gray-500 dark:text-gray-400">
                No data available
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {pieChartData.slice(0, 5).map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {entry.value.toLocaleString()}
                  </span>
                </div>
              ))}
              {pieChartData.length > 5 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                  +{pieChartData.length - 5} more databases
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div
          className={`${getContainerStyles()} rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6`}
        >
          <div className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Database Usage Over Time
            {selectedDatabase !== 'all' && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({databaseNames[selectedDatabase] || `Database ${selectedDatabase.slice(0, 8)}`})
              </span>
            )}
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
    </CompactLayout>
  );
};

export default memo(UsageDatabasePage);
