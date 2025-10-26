import { CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { m } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

import { useMetricsHistory } from '../hooks';

const PERIODS = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '12h', label: '12H' },
  { value: '24h', label: '24H' },
  { value: '1d', label: '1D' },
  { value: '2d', label: '2D' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

const formatTimestamp = (timestamp, period) => {
  const date = new Date(timestamp);

  // For longer periods, show date
  if (['7d', '30d'].includes(period)) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }

  // For shorter periods, show time
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatTooltipTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const fullTimestamp = payload[0]?.payload?.fullTimestamp;
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-2xl">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          {fullTimestamp ? formatTooltipTimestamp(fullTimestamp) : label}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const StatsCard = ({ label, value, icon: Icon, color }) => {
  // Extract base color for background
  const bgColorClass = color.includes('emerald') ? 'bg-emerald-100 dark:bg-emerald-900/30'
    : color.includes('teal') ? 'bg-teal-100 dark:bg-teal-900/30'
      : color.includes('blue') && !color.includes('indigo') ? 'bg-blue-100 dark:bg-blue-900/30'
        : color.includes('indigo') ? 'bg-indigo-100 dark:bg-indigo-900/30'
          : 'bg-gray-100 dark:bg-gray-900/30';

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${bgColorClass} flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  );
};

export const MetricsHistoryCharts = ({ baseId, metrics }) => {
  const [period, setPeriod] = useState('1h');
  const { history, loading } = useMetricsHistory(baseId, period);

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  // Get limits from metrics
  const getCpuLimit = () => {
    if (!metrics?.instance_type?.cpu_limit) return null;
    const limit = metrics.instance_type.cpu_limit;

    // Handle string format
    if (typeof limit === 'string') {
      if (limit.endsWith('m')) {
        const value = parseFloat(limit.replace('m', ''));
        return value;
      }
      // If it's just a number as string (cores)
      const parsed = parseFloat(limit);
      if (!isNaN(parsed)) {
        return parsed * 1000; // Convert cores to millicores
      }
    }

    // Handle number format (assume it's in cores)
    if (typeof limit === 'number') {
      // If it's a very small number (like 0.4), it's likely cores
      if (limit < 10) {
        return limit * 1000; // Convert to millicores
      }
      return limit;
    }

    return null;
  };

  const getMemoryLimit = () => {
    if (!metrics?.instance_type?.memory_limit) return null;
    const limit = metrics.instance_type.memory_limit;

    // Handle string format
    if (typeof limit === 'string') {
      if (limit.endsWith('Mi')) {
        const value = parseFloat(limit.replace('Mi', ''));
        return value;
      }
      if (limit.endsWith('Gi')) {
        const value = parseFloat(limit.replace('Gi', '')) * 1024;
        return value;
      }
      if (limit.endsWith('Ki')) {
        const value = parseFloat(limit.replace('Ki', '')) / 1024;
        return value;
      }
      // If it's just a number as string
      const parsed = parseFloat(limit);
      if (!isNaN(parsed)) {
        return parsed; // Assume MB
      }
    }

    // Handle number format (assume bytes)
    if (typeof limit === 'number') {
      // If it's a very large number, it's likely bytes
      if (limit > 1000000) {
        const value = limit / (1024 * 1024);
        return value; // Convert bytes to MB
      }
      // Otherwise assume it's already in MB
      return limit;
    }

    return null;
  };

  const cpuLimit = getCpuLimit();
  const memoryLimit = getMemoryLimit();

  // Transform data for charts
  const cpuChartData = history?.cpu_usage_history?.map((item) => ({
    timestamp: formatTimestamp(item.timestamp, period),
    fullTimestamp: item.timestamp,
    cpu: item.value,
    limit: cpuLimit,
  })) || [];

  const memoryChartData = history?.memory_usage_history?.map((item) => ({
    timestamp: formatTimestamp(item.timestamp, period),
    fullTimestamp: item.timestamp,
    memory: parseFloat((item.value / (1024 * 1024)).toFixed(0)), // Convert to MB
    limit: memoryLimit,
  })) || [];

  // Calculate stats and domain
  const cpuAvg = cpuChartData.length > 0
    ? (cpuChartData.reduce((sum, item) => sum + item.cpu, 0) / cpuChartData.length).toFixed(0)
    : '0';
  const cpuMax = cpuChartData.length > 0
    ? Math.max(...cpuChartData.map(item => item.cpu))
    : 0;

  const memoryAvg = memoryChartData.length > 0
    ? (memoryChartData.reduce((sum, item) => sum + item.memory, 0) / memoryChartData.length).toFixed(0)
    : '0';
  const memoryMax = memoryChartData.length > 0
    ? Math.max(...memoryChartData.map(item => item.memory))
    : 0;

  // Calculate Y-axis domain to always show the limit
  const cpuDomain = cpuLimit
    ? [0, Math.max(cpuMax * 1.1, cpuLimit * 1.1)]
    : [0, cpuMax * 1.1 || 100];

  const memoryDomain = memoryLimit
    ? [0, Math.max(memoryMax * 1.1, memoryLimit * 1.1)]
    : [0, memoryMax * 1.1 || 100];

  if (loading && !history) {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6"
      >
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-sm p-4 sm:p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Metrics History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time monitoring and performance insights
              </p>
            </div>
          </div>

          {/* Period Selector */}
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
            className="bg-gray-100 dark:bg-gray-900/50 rounded-lg"
          >
            {PERIODS.map((p) => (
              <ToggleButton
                key={p.value}
                value={p.value}
                className="text-xs font-semibold px-3 py-1"
                sx={{
                  border: 'none',
                  '&.Mui-selected': {
                    backgroundColor: 'rgb(59 130 246)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgb(37 99 235)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgb(229 231 235)',
                  },
                }}
              >
                {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        {/* CPU Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              CPU Usage
            </h3>
            {cpuLimit && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <AlertCircle size={14} />
                <span>Limit: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cpuLimit}m</span></span>
              </div>
            )}
          </div>

          {/* CPU Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              label="Average CPU"
              value={`${cpuAvg}m`}
              icon={TrendingUp}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <StatsCard
              label="Peak CPU"
              value={`${cpuMax.toFixed(0)}m`}
              icon={AlertCircle}
              color="text-teal-600 dark:text-teal-400"
            />
          </div>

          {/* CPU Chart */}
          <div className="h-72 bg-white/50 dark:bg-gray-900/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cpuChartData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', opacity: 0.5 }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', opacity: 0.5 }}
                  label={{ value: 'millicores', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#9CA3AF' } }}
                  domain={cpuDomain}
                  tickFormatter={(value) => Math.round(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', fontWeight: '600' }}
                  iconType="line"
                />
                {cpuLimit && (
                  <ReferenceLine
                    y={cpuLimit}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: `Limit (${cpuLimit}m)`,
                      position: 'right',
                      fill: '#ef4444',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="cpu"
                  fill="url(#colorCpu)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  name="CPU (m)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              Memory Usage
            </h3>
            {memoryLimit && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <AlertCircle size={14} />
                <span>Limit: <span className="font-semibold text-blue-600 dark:text-blue-400">{memoryLimit} MB</span></span>
              </div>
            )}
          </div>

          {/* Memory Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              label="Average Memory"
              value={`${memoryAvg} MB`}
              icon={TrendingUp}
              color="text-blue-600 dark:text-blue-400"
            />
            <StatsCard
              label="Peak Memory"
              value={`${memoryMax.toFixed(0)} MB`}
              icon={AlertCircle}
              color="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          {/* Memory Chart */}
          <div className="h-72 bg-white/50 dark:bg-gray-900/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={memoryChartData}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', opacity: 0.5 }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB', opacity: 0.5 }}
                  label={{ value: 'MB', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#9CA3AF' } }}
                  domain={memoryDomain}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', fontWeight: '600' }}
                  iconType="line"
                />
                {memoryLimit && (
                  <ReferenceLine
                    y={memoryLimit}
                    stroke="#ef4444"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: `Limit (${memoryLimit} MB)`,
                      position: 'right',
                      fill: '#ef4444',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="memory"
                  fill="url(#colorMemory)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  name="Memory (MB)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </m.div>
  );
};
