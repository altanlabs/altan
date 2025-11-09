import { m } from 'framer-motion';
import { Activity, TrendingUp, AlertCircle, Server, Cpu, HardDrive, Database, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { UsageMetric } from './UsageMetric';
import { useMetricsHistory } from '../../../../databases/base/sections/overview/hooks';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../../../elevenlabs/ui/chart';
import { Card, CardContent } from '../../../../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../../../ui/tabs';

const PERIODS = [
  { value: '1h', label: '1H' },
  { value: '6h', label: '6H' },
  { value: '12h', label: '12H' },
  { value: '24h', label: '24H' },
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

const getHealthStatus = (cpuUsage, memoryUsage, storageUsage) => {
  const parseUsage = (usage) => {
    if (typeof usage === 'string') {
      return parseFloat(usage.replace('%', ''));
    }
    return usage || 0;
  };

  const cpu = parseUsage(cpuUsage);
  const memory = parseUsage(memoryUsage);
  const storage = parseUsage(storageUsage);

  const maxUsage = Math.max(cpu, memory, storage);

  if (maxUsage >= 75) {
    return {
      status: 'Critical',
      label: 'Critical / Increase instance',
      subtitle: 'Your infrastructure is under heavy load. Immediate scaling recommended.',
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10 dark:bg-red-500/20',
      borderColor: 'border-red-500/30',
      ringColor: 'ring-red-500/30',
    };
  }

  if (maxUsage >= 50) {
    return {
      status: 'Stressed',
      label: 'Stressed / Consider upgrading',
      subtitle: 'Performance may degrade soon. Consider upgrading your instance.',
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      ringColor: 'ring-amber-500/30',
    };
  }

  return {
    status: 'Healthy',
    label: 'Healthy',
    subtitle: 'All systems operating normally. Performance is optimal.',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    ringColor: 'ring-emerald-500/30',
  };
};

// Skeleton Loading Component
const MetricsSkeleton = () => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 backdrop-blur-sm p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
    >
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted/60 animate-pulse rounded" />
            </div>
          </div>
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Current Status Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted/40 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Charts Skeleton */}
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 bg-muted/40 animate-pulse rounded-lg" />
              <div className="h-16 bg-muted/40 animate-pulse rounded-lg" />
            </div>
            <div className="h-72 bg-muted/20 animate-pulse rounded-lg" />
          </div>
        ))}
      </div>
    </m.div>
  );
};

export const MetricsHistoryCharts = ({ baseId, metrics, cpuUsage, memoryUsage, storageUsage }) => {
  const [period, setPeriod] = useState('24h');
  const { history, loading } = useMetricsHistory(baseId, period);

  const healthStatus = getHealthStatus(cpuUsage, memoryUsage, storageUsage);
  const StatusIcon = healthStatus.icon;

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

  // Show skeleton if no metrics available
  if (!metrics || (loading && !history)) {
    return <MetricsSkeleton />;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 backdrop-blur-sm p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center ring-1 ring-primary/20 dark:ring-primary/30">
              <Activity size={22} className="text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">Infrastructure Monitoring</h2>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${healthStatus.bgColor} ${healthStatus.borderColor} ring-1 ${healthStatus.ringColor}`}>
                  <StatusIcon size={14} className={healthStatus.color} strokeWidth={2.5} />
                  <span className={`text-xs font-semibold ${healthStatus.color}`}>
                    {healthStatus.label}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{healthStatus.subtitle}</p>
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

        {/* Current Infrastructure Health Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Server size={16} className="text-muted-foreground" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-foreground">Current Status</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <UsageMetric
              icon={Cpu}
              title="CPU Usage"
              value={cpuUsage}
              delay={0.6}
              gradientColors="bg-gradient-to-r from-emerald-500 to-teal-500"
              iconColors={{
                bg: 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30',
                text: 'text-emerald-600 dark:text-emerald-400',
                hover: 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5',
              }}
            />
            <UsageMetric
              icon={HardDrive}
              title="Memory Usage"
              value={memoryUsage}
              delay={0.7}
              gradientColors="bg-gradient-to-r from-blue-500 to-indigo-500"
              iconColors={{
                bg: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
                text: 'text-blue-600 dark:text-blue-400',
                hover: 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5',
              }}
            />
            <UsageMetric
              icon={Database}
              title="Storage Usage"
              value={storageUsage}
              delay={0.8}
              gradientColors="bg-gradient-to-r from-purple-500 to-pink-500"
              iconColors={{
                bg: 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
                text: 'text-purple-600 dark:text-purple-400',
                hover: 'bg-gradient-to-br from-purple-500/5 to-pink-500/5',
              }}
            />
          </div>
        </div>

        {/* CPU Chart */}
        <Card>
          <CardContent className="p-4">
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

              <ChartContainer
                config={{
                  cpu: {
                    label: 'CPU (m)',
                    color: 'hsl(142.1 76.2% 36.3%)',
                  },
                }}
                className="h-64 w-full"
              >
                <AreaChart data={cpuChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="timestamp" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="var(--color-cpu)"
                    fill="var(--color-cpu)"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Memory Chart */}
        <Card>
          <CardContent className="p-4">
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

              <ChartContainer
                config={{
                  memory: {
                    label: 'Memory (MB)',
                    color: 'hsl(217.2 91.2% 59.8%)',
                  },
                }}
                className="h-64 w-full"
              >
                <AreaChart data={memoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="timestamp" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="var(--color-memory)"
                    fill="var(--color-memory)"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </m.div>
  );
};
