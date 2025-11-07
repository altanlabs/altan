import { m } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

import { useMetricsHistory } from '../../../../databases/base/sections/overview/hooks';
import { Tabs, TabsList, TabsTrigger } from '../../../../ui/tabs';

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
  if (['7d', '30d'].includes(period)) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }
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
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
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
  return (
    <div className="rounded-md p-2.5 border border-border/60 bg-background/60 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{label}</p>
          <p className={`text-lg font-semibold ${color}`}>{value}</p>
        </div>
        <div className="w-7 h-7 rounded-md bg-background/60 border border-border/60 flex items-center justify-center">
          <Icon size={14} className={color} />
        </div>
      </div>
    </div>
  );
};

export const MetricsHistoryCharts = ({ baseId, metrics }) => {
  const [period, setPeriod] = useState('1h');
  const { history, loading } = useMetricsHistory(baseId, period);

  const handlePeriodChange = (value) => {
    setPeriod(value);
  };

  const getCpuLimit = () => {
    if (!metrics?.instance_type?.cpu_limit) return null;
    const limit = metrics.instance_type.cpu_limit;
    if (typeof limit === 'string') {
      if (limit.endsWith('m')) {
        const value = parseFloat(limit.replace('m', ''));
        return value;
      }
      const parsed = parseFloat(limit);
      if (!isNaN(parsed)) {
        return parsed * 1000;
      }
    }
    if (typeof limit === 'number') {
      if (limit < 10) {
        return limit * 1000;
      }
      return limit;
    }
    return null;
  };

  const getMemoryLimit = () => {
    if (!metrics?.instance_type?.memory_limit) return null;
    const limit = metrics.instance_type.memory_limit;
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
      const parsed = parseFloat(limit);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    if (typeof limit === 'number') {
      if (limit > 1000000) {
        const value = limit / (1024 * 1024);
        return value;
      }
      return limit;
    }
    return null;
  };

  const cpuLimit = getCpuLimit();
  const memoryLimit = getMemoryLimit();

  const cpuChartData =
    history?.cpu_usage_history?.map((item) => ({
      timestamp: formatTimestamp(item.timestamp, period),
      fullTimestamp: item.timestamp,
      cpu: item.value,
      limit: cpuLimit,
    })) || [];

  const memoryChartData =
    history?.memory_usage_history?.map((item) => ({
      timestamp: formatTimestamp(item.timestamp, period),
      fullTimestamp: item.timestamp,
      memory: parseFloat((item.value / (1024 * 1024)).toFixed(0)),
      limit: memoryLimit,
    })) || [];

  const cpuAvg =
    cpuChartData.length > 0
      ? (cpuChartData.reduce((sum, item) => sum + item.cpu, 0) / cpuChartData.length).toFixed(0)
      : '0';
  const cpuMax = cpuChartData.length > 0 ? Math.max(...cpuChartData.map((item) => item.cpu)) : 0;

  const memoryAvg =
    memoryChartData.length > 0
      ? (memoryChartData.reduce((sum, item) => sum + item.memory, 0) / memoryChartData.length).toFixed(0)
      : '0';
  const memoryMax = memoryChartData.length > 0 ? Math.max(...memoryChartData.map((item) => item.memory)) : 0;

  const cpuDomain = cpuLimit ? [0, Math.max(cpuMax * 1.1, cpuLimit * 1.1)] : [0, cpuMax * 1.1 || 100];
  const memoryDomain = memoryLimit ? [0, Math.max(memoryMax * 1.1, memoryLimit * 1.1)] : [0, memoryMax * 1.1 || 100];

  if (loading && !history) {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 backdrop-blur-sm p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 backdrop-blur-sm p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Metrics History</h2>
              <p className="text-sm text-muted-foreground">Real-time monitoring and performance insights</p>
            </div>
          </div>

          <Tabs value={period} onValueChange={handlePeriodChange}>
            <TabsList>
              {PERIODS.map((p) => (
                <TabsTrigger key={p.value} value={p.value}>
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              CPU Usage
            </h3>
            {cpuLimit && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle size={14} />
                <span>
                  Limit: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cpuLimit}m</span>
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatsCard label="Average CPU" value={`${cpuAvg}m`} icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400" />
            <StatsCard label="Peak CPU" value={`${cpuMax.toFixed(0)}m`} icon={AlertCircle} color="text-teal-600 dark:text-teal-400" />
          </div>

          <div className="h-72 bg-background/40 rounded-lg p-3 border border-border/60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cpuChartData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" style={{ fontSize: '11px', fontWeight: '500' }} tickLine={false} axisLine={{ stroke: '#E5E7EB', opacity: 0.5 }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '11px', fontWeight: '500' }} tickLine={false} axisLine={{ stroke: '#E5E7EB', opacity: 0.5 }} label={{ value: 'millicores', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#9CA3AF' } }} domain={cpuDomain} tickFormatter={(value) => Math.round(value)} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} iconType="line" />
                {cpuLimit && <ReferenceLine y={cpuLimit} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} label={{ value: `Limit (${cpuLimit}m)`, position: 'right', fill: '#ef4444', fontSize: 11, fontWeight: 600 }} />}
                <Area type="monotone" dataKey="cpu" fill="url(#colorCpu)" stroke="none" />
                <Line type="monotone" dataKey="cpu" name="CPU (m)" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              Memory Usage
            </h3>
            {memoryLimit && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle size={14} />
                <span>
                  Limit: <span className="font-semibold text-blue-600 dark:text-blue-400">{memoryLimit} MB</span>
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatsCard label="Average Memory" value={`${memoryAvg} MB`} icon={TrendingUp} color="text-blue-600 dark:text-blue-400" />
            <StatsCard label="Peak Memory" value={`${memoryMax.toFixed(0)} MB`} icon={AlertCircle} color="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="h-72 bg-background/40 rounded-lg p-3 border border-border/60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={memoryChartData}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="timestamp" stroke="#9CA3AF" style={{ fontSize: '11px', fontWeight: '500' }} tickLine={false} axisLine={{ stroke: '#E5E7EB', opacity: 0.5 }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '11px', fontWeight: '500' }} tickLine={false} axisLine={{ stroke: '#E5E7EB', opacity: 0.5 }} label={{ value: 'MB', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#9CA3AF' } }} domain={memoryDomain} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} iconType="line" />
                {memoryLimit && <ReferenceLine y={memoryLimit} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} label={{ value: `Limit (${memoryLimit} MB)`, position: 'right', fill: '#ef4444', fontSize: 11, fontWeight: 600 }} />}
                <Area type="monotone" dataKey="memory" fill="url(#colorMemory)" stroke="none" />
                <Line type="monotone" dataKey="memory" name="Memory (MB)" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </m.div>
  );
};
