import { useTheme } from '@mui/material';
import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  isValid,
  isWithinInterval,
  subMonths,
  subWeeks,
} from 'date-fns';
import { TrendingUp, Zap, Cloud, DollarSign } from 'lucide-react';
import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { CustomAvatar } from '../../components/custom-avatar';
import StaticGradientAvatar from '../../components/agents/StaticGradientAvatar';
import Iconify from '../../components/iconify/Iconify';
import { selectAccountId, selectAccountSubscriptions, selectSortedAgents } from '../../redux/slices/general/index.ts';
import { useSelector as useReduxSelector } from '../../redux/store.ts';
import { optimai } from '../../utils/axios';

// Simplified credit types - only AI and Cloud
const CREDIT_TYPES = {
  ai: {
    color: '#00E559',
    lightColor: '#00E55930',
    label: 'AI Credits',
    description: 'LLM calls, embeddings, and AI operations',
    icon: Zap,
  },
  cloud: {
    color: '#3B82F6',
    lightColor: '#3B82F630',
    label: 'Cloud Credits',
    description: 'Infrastructure, storage, and compute',
    icon: Cloud,
  },
};

// Helper to aggregate data by timeframe
const aggregateData = (data, groupBy) => {
  if (!data || data.length === 0) return [];

  const grouped = data.reduce((acc, item) => {
    const itemDate = parseISO(item.date);
    if (!isValid(itemDate)) return acc;

    let key;
    try {
      key =
        groupBy === 'week'
          ? format(startOfWeek(itemDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
          : groupBy === 'month'
            ? format(startOfMonth(itemDate), 'yyyy-MM')
            : item.date;
    } catch {
      return acc;
    }

    if (!acc[key]) {
      acc[key] = { 
        date: key, 
        ai: 0, 
        cloud: 0,
        ai_input_tokens: 0,
        ai_output_tokens: 0,
      };
    }

    // Aggregate AI and Cloud credits plus token data
    acc[key].ai += (item.ai_credits || 0);
    acc[key].cloud += (item.cloud_credits || 0);
    acc[key].ai_input_tokens += (item.ai_input_tokens || 0);
    acc[key].ai_output_tokens += (item.ai_output_tokens || 0);

    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    if (!isValid(dateA) || !isValid(dateB)) return 0;
    return dateA - dateB;
  });
};

const UsagePage = () => {
  const accountId = useSelector(selectAccountId);
  const history = useHistory();
  const theme = useTheme();
  const activeSubscriptions = useReduxSelector(selectAccountSubscriptions);
  const agents = useReduxSelector(selectSortedAgents) || [];
  const isDarkMode = theme.palette.mode === 'dark';

  // State
  const [rawUsageData, setRawUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('day');
  const [period, setPeriod] = useState('30d');
  
  // Transaction table state
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total_count: 0,
    current_page: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Entity usage state
  const [entityUsage, setEntityUsage] = useState([]);
  const [entityUsageLoading, setEntityUsageLoading] = useState(false);
  const [entityFilter, setEntityFilter] = useState(null); // null, 'ai', or 'cloud'
  const [projectsMap, setProjectsMap] = useState({}); // Map of cloud_id -> {altaner, component}

  // Get subscription data
  const subscriptionData = useMemo(() => {
    if (!activeSubscriptions?.[0]) {
      return {
        totalCredits: 1000,
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

    return { totalCredits, remainingCredits, planName, usagePercentage, usedCredits };
  }, [activeSubscriptions]);

  // Fetch usage data
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!accountId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await optimai.get(`/account/${accountId}/usage`);
        const processed = Object.entries(response.data.daily_usage || {}).map(([date, types]) => ({
          date,
          ai_credits: types.ai?.credits || 0,
          cloud_credits: types.cloud?.credits || 0,
          ai_input_tokens: types.ai?.input_tokens || 0,
          ai_output_tokens: types.ai?.output_tokens || 0,
        }));
        setRawUsageData(processed);
      } catch {
        setRawUsageData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [accountId]);

  // Fetch transaction history with pagination
  const fetchTransactions = useCallback(async (page = 1) => {
    if (!accountId) return;
    
    setTransactionsLoading(true);
    try {
      const offset = (page - 1) * itemsPerPage;
      const response = await optimai.get(
        `/account/${accountId}/usage?raw=true&limit=${itemsPerPage}&offset=${offset}`
      );
      setTransactions(response.data.usage || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [accountId, itemsPerPage]);

  // Fetch transactions on mount and when page changes
  useEffect(() => {
    fetchTransactions(currentPage);
  }, [fetchTransactions, currentPage]);

  // Fetch entity usage data
  const fetchEntityUsage = useCallback(async () => {
    if (!accountId) return;
    
    setEntityUsageLoading(true);
    try {
      const params = entityFilter ? `?credit_type=${entityFilter}` : '';
      const response = await optimai.get(`/account/${accountId}/usage-by-entity${params}`);
      const usageData = response.data.usage_by_entity || [];
      setEntityUsage(usageData);
      setEntityUsageLoading(false); // Stop loading, show table immediately

      // Fetch project data for cloud entities in the background
      const cloudEntityIds = usageData
        .filter(entity => entity.by_type?.cloud && entity.entity_id !== 'unassigned')
        .map(entity => entity.entity_id);

      if (cloudEntityIds.length > 0) {
        // Fetch projects one by one and update state as they come in
        cloudEntityIds.forEach(async (cloudId) => {
          try {
            const projectResponse = await optimai.get(`/altaner/find?cloud_id=${cloudId}`);
            setProjectsMap(prev => ({
              ...prev,
              [cloudId]: {
                altaner: projectResponse.data.altaner,
                component: projectResponse.data.component,
              }
            }));
          } catch (error) {
            console.error(`Failed to fetch project for cloud ${cloudId}:`, error);
            // Mark as failed so we don't show loading indefinitely
            setProjectsMap(prev => ({
              ...prev,
              [cloudId]: null
            }));
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch entity usage:', error);
      setEntityUsage([]);
      setEntityUsageLoading(false);
    }
  }, [accountId, entityFilter]);

  // Fetch entity usage when filters change
  useEffect(() => {
    // Clear projects map when fetching new data
    setProjectsMap({});
    fetchEntityUsage();
  }, [fetchEntityUsage]);

  // Helper: Get agent by ID
  const getAgentById = useCallback((entityId) => {
    return agents.find(agent => agent.id === entityId);
  }, [agents]);

  // Helper: Get project by cloud ID
  const getProjectByCloudId = useCallback((cloudId) => {
    return projectsMap[cloudId];
  }, [projectsMap]);

  // Helper: Check if project is loading
  const isProjectLoading = useCallback((entity) => {
    // If it's not a cloud entity, it's not loading
    if (!entity.by_type?.cloud) return false;
    // If we have an agent for this ID, it's not a project loading
    if (getAgentById(entity.entity_id)) return false;
    // If entity is unassigned, it's not loading
    if (entity.entity_id === 'unassigned') return false;
    // If we don't have project data yet (undefined), it's loading
    // If it's null, it failed to load
    return projectsMap[entity.entity_id] === undefined;
  }, [projectsMap, getAgentById]);

  // Helper: Navigate to entity (agent or project)
  const handleEntityClick = useCallback((entity) => {
    const agent = getAgentById(entity.entity_id);
    const project = getProjectByCloudId(entity.entity_id);
    
    if (agent) {
      history.push(`/agent/${agent.id}`);
    } else if (project) {
      history.push(`/project/${project.altaner.id}/c/${project.component.id}`);
    }
  }, [getAgentById, getProjectByCloudId, history]);

  // Helper: Render agent avatar
  const renderAgentAvatar = useCallback((agent, size = 32) => {
    const hasAvatarUrl = agent.avatar_url && agent.avatar_url.trim() !== '';

    if (hasAvatarUrl) {
      return (
        <CustomAvatar
          src={agent.avatar_url}
          alt={agent.name}
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
          }}
          name={agent.name}
        />
      );
    }

    return (
      <StaticGradientAvatar
        size={size}
        colors={agent?.meta_data?.avatar_orb?.colors || ['#CADCFC', '#A0B9D1']}
      />
    );
  }, []);

  // Filter data by period
  const filteredData = useMemo(() => {
    if (!rawUsageData.length) return [];

    const now = new Date();
    let startDate;

    switch (period) {
      case '7d':
        startDate = subWeeks(now, 1);
        break;
      case '30d':
        startDate = subMonths(now, 1);
        break;
      case '90d':
        startDate = subMonths(now, 3);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    return rawUsageData.filter((item) => {
      const itemDate = parseISO(item.date);
      if (!isValid(itemDate)) return false;
      return isWithinInterval(itemDate, { start: startDate, end: now });
    });
  }, [rawUsageData, period]);

  // Process data for charts
  const chartData = useMemo(() => {
    return aggregateData(filteredData, timeframe);
  }, [filteredData, timeframe]);

  // Calculate statistics including token data
  const stats = useMemo(() => {
    const totals = filteredData.reduce(
      (acc, item) => ({
        ai: acc.ai + (item.ai_credits || 0),
        cloud: acc.cloud + (item.cloud_credits || 0),
        aiInputTokens: acc.aiInputTokens + (item.ai_input_tokens || 0),
        aiOutputTokens: acc.aiOutputTokens + (item.ai_output_tokens || 0),
      }),
      { ai: 0, cloud: 0, aiInputTokens: 0, aiOutputTokens: 0 },
    );

    const total = totals.ai + totals.cloud;
    const totalTokens = totals.aiInputTokens + totals.aiOutputTokens;

    return {
      ai: Math.round(totals.ai),
      cloud: Math.round(totals.cloud),
      total: Math.round(total),
      aiPercentage: total > 0 ? Math.round((totals.ai / total) * 100) : 0,
      cloudPercentage: total > 0 ? Math.round((totals.cloud / total) * 100) : 0,
      costEuro: Math.round(total / 100),
      // Token stats
      aiInputTokens: Math.round(totals.aiInputTokens),
      aiOutputTokens: Math.round(totals.aiOutputTokens),
      totalTokens: Math.round(totalTokens),
      inputTokenPercentage: totalTokens > 0 ? Math.round((totals.aiInputTokens / totalTokens) * 100) : 0,
      outputTokenPercentage: totalTokens > 0 ? Math.round((totals.aiOutputTokens / totalTokens) * 100) : 0,
    };
  }, [filteredData]);

  // Pie chart data
  const pieData = [
    { name: 'AI', value: stats.ai, color: CREDIT_TYPES.ai.color },
    { name: 'Cloud', value: stats.cloud, color: CREDIT_TYPES.cloud.color },
  ].filter(item => item.value > 0);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const date = payload[0]?.payload?.date;
    const formattedDate = date ? format(parseISO(date), 'MMM dd, yyyy') : '';

    return (
      <div
        className={`rounded-lg border p-3 shadow-lg ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <p className="mb-2 text-sm font-medium">{formattedDate}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-semibold">{Math.round(entry.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full w-full overflow-y-auto mt-12">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto mt-12">
      <div className="container mx-auto p-6 space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usage & Billing</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your AI and Cloud credit consumption
            </p>
          </div>
          <Button onClick={() => history.push('/pricing')} variant="default">
            <TrendingUp className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>

        {/* Plan Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  {subscriptionData.planName.startsWith('Growth ')
                    ? 'Growth'
                    : subscriptionData.planName}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {subscriptionData.usagePercentage}% Used
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={subscriptionData.usagePercentage} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {Math.round(subscriptionData.usedCredits / 100).toLocaleString()}€ used
                </span>
                <span className="text-muted-foreground">
                  {Math.round(subscriptionData.totalCredits / 100).toLocaleString()}€ total
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits Used</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">≈ €{stats.costEuro}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
              <Zap className="h-4 w-4" style={{ color: CREDIT_TYPES.ai.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ai.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.aiPercentage}% of total usage
              </p>
              {stats.totalTokens > 0 && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Input tokens:</span>
                    <span className="font-medium">{stats.aiInputTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Output tokens:</span>
                    <span className="font-medium">{stats.aiOutputTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold pt-1">
                    <span>Total tokens:</span>
                    <span>{stats.totalTokens.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cloud Credits</CardTitle>
              <Cloud className="h-4 w-4" style={{ color: CREDIT_TYPES.cloud.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cloud.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.cloudPercentage}% of total usage
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Usage Over Time</CardTitle>
                <CardDescription>Credit consumption breakdown</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Period selector */}
                <div className="flex rounded-lg border p-1">
                  {[
                    { value: '7d', label: '7 Days' },
                    { value: '30d', label: '30 Days' },
                    { value: '90d', label: '90 Days' },
                  ].map((p) => (
                  <Button
                    key={p.value}
                    variant={period === p.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPeriod(p.value)}
                    className="h-8"
                  >
                    {p.label}
                  </Button>
                ))}
                </div>

                {/* Timeframe selector */}
                <div className="flex rounded-lg border p-1">
                  {[
                    { value: 'day', label: 'Daily' },
                    { value: 'week', label: 'Weekly' },
                    { value: 'month', label: 'Monthly' },
                  ].map((t) => (
                  <Button
                    key={t.value}
                    variant={timeframe === t.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeframe(t.value)}
                    className="h-8"
                  >
                    {t.label}
                  </Button>
                ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="area" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="area">Area Chart</TabsTrigger>
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="pie">Distribution</TabsTrigger>
                <TabsTrigger value="tokens">AI Tokens</TabsTrigger>
              </TabsList>

              <TabsContent value="area" className="h-80">
                {chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No usage data available for this period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CREDIT_TYPES.ai.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CREDIT_TYPES.ai.color} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CREDIT_TYPES.cloud.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={CREDIT_TYPES.cloud.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                        const parsed = parseISO(date);
                        return isValid(parsed) ? format(parsed, 'MMM dd') : '';
                      }}
                        stroke={isDarkMode ? '#888' : '#666'}
                      />
                      <YAxis stroke={isDarkMode ? '#888' : '#666'} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="ai"
                        name="AI"
                        stroke={CREDIT_TYPES.ai.color}
                        fillOpacity={1}
                        fill="url(#colorAi)"
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="cloud"
                        name="Cloud"
                        stroke={CREDIT_TYPES.cloud.color}
                        fillOpacity={1}
                        fill="url(#colorCloud)"
                        stackId="1"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>

              <TabsContent value="bar" className="h-80">
                {chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No usage data available for this period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                        const parsed = parseISO(date);
                        return isValid(parsed) ? format(parsed, 'MMM dd') : '';
                      }}
                        stroke={isDarkMode ? '#888' : '#666'}
                      />
                      <YAxis stroke={isDarkMode ? '#888' : '#666'} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="ai" name="AI" fill={CREDIT_TYPES.ai.color} stackId="stack" />
                      <Bar dataKey="cloud" name="Cloud" fill={CREDIT_TYPES.cloud.color} stackId="stack" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>

              <TabsContent value="pie" className="h-80">
                {pieData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No usage data available for this period
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tokens" className="h-80">
                {chartData.length === 0 || stats.totalTokens === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No AI token data available for this period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                          const parsed = parseISO(date);
                          return isValid(parsed) ? format(parsed, 'MMM dd') : '';
                        }}
                        stroke={isDarkMode ? '#888' : '#666'}
                      />
                      <YAxis stroke={isDarkMode ? '#888' : '#666'} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const date = payload[0]?.payload?.date;
                          const formattedDate = date ? format(parseISO(date), 'MMM dd, yyyy') : '';
                          return (
                            <div
                              className={`rounded-lg border p-3 shadow-lg ${
                                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                              }`}
                            >
                              <p className="mb-2 text-sm font-medium">{formattedDate}</p>
                              {payload.map((entry) => (
                                <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="capitalize">{entry.name}:</span>
                                  <span className="font-semibold">{Math.round(entry.value).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ai_input_tokens"
                        name="Input Tokens"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorInput)"
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="ai_output_tokens"
                        name="Output Tokens"
                        stroke="#ec4899"
                        fillOpacity={1}
                        fill="url(#colorOutput)"
                        stackId="1"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Entity Usage Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Usage by Entity</CardTitle>
                <CardDescription>See which agents and services are consuming credits</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={entityFilter === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEntityFilter(null)}
                >
                  All
                </Button>
                <Button
                  variant={entityFilter === 'ai' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEntityFilter('ai')}
                >
                  AI Credits
                </Button>
                <Button
                  variant={entityFilter === 'cloud' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEntityFilter('cloud')}
                >
                  Cloud Credits
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {entityUsageLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : entityUsage.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No entity usage data available
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top Consumers Summary */}
                {entityUsage.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <h4 className="text-sm font-semibold">Top Consumers</h4>
                    <div className="grid gap-3 md:grid-cols-3">
                      {entityUsage.slice(0, 3).map((entity, idx) => {
                        const agent = entity.entity_id !== 'unassigned' ? getAgentById(entity.entity_id) : null;
                        const project = entity.entity_id !== 'unassigned' ? getProjectByCloudId(entity.entity_id) : null;
                        const loading = isProjectLoading(entity);
                        const isClickable = agent || project;

                        return (
                          <div 
                            key={entity.entity_id || idx}
                            className={`flex flex-col gap-2 p-3 rounded-md bg-muted/50 ${isClickable ? 'cursor-pointer hover:bg-muted/70 transition-colors' : ''}`}
                            onClick={isClickable ? () => handleEntityClick(entity) : undefined}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                              <Badge variant="secondary" className="text-xs">
                                {(entity.proportion * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            {agent ? (
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex-shrink-0">
                                  {renderAgentAvatar(agent, 28)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="font-semibold text-sm truncate">
                                    {agent.name}
                                  </div>
                                  <div className="font-mono text-xs text-muted-foreground truncate">
                                    {entity.entity_id}
                                  </div>
                                </div>
                              </div>
                            ) : loading ? (
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted animate-pulse" />
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                  <div className="h-3.5 bg-muted rounded w-3/4 animate-pulse" />
                                  <div className="h-2.5 bg-muted rounded w-full animate-pulse" />
                                </div>
                              </div>
                            ) : project ? (
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <Iconify icon="mdi:cloud" width={16} className="text-blue-500" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="font-semibold text-sm truncate">
                                    {project.altaner.name}
                                  </div>
                                  <div className="font-mono text-xs text-muted-foreground truncate">
                                    {entity.entity_id}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="font-mono text-xs truncate">
                                {entity.entity_id === 'unassigned' ? 'Unassigned' : entity.entity_id}
                              </div>
                            )}
                            <div className="text-sm font-semibold">
                              {entity.total_credits.toLocaleString()} credits
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity ID</TableHead>
                      <TableHead className="text-right">Total Credits</TableHead>
                      <TableHead className="text-right">Proportion</TableHead>
                      <TableHead className="text-right">AI Credits</TableHead>
                      <TableHead className="text-right">Cloud Credits</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entityUsage.map((entity, index) => {
                      const aiData = entity.by_type?.ai || {};
                      const cloudData = entity.by_type?.cloud || {};
                      const totalTransactions = (aiData.transaction_count || 0) + (cloudData.transaction_count || 0);
                      const agent = entity.entity_id !== 'unassigned' ? getAgentById(entity.entity_id) : null;
                      const project = entity.entity_id !== 'unassigned' ? getProjectByCloudId(entity.entity_id) : null;
                      const loading = isProjectLoading(entity);
                      const isClickable = agent || project;
                      
                      return (
                        <TableRow 
                          key={entity.entity_id || index}
                          className={isClickable ? 'cursor-pointer hover:bg-accent/30' : ''}
                          onClick={isClickable ? () => handleEntityClick(entity) : undefined}
                        >
                          <TableCell className="font-medium text-sm">
                            {entity.entity_id === 'unassigned' ? (
                              <span className="text-muted-foreground italic">Unassigned</span>
                            ) : agent ? (
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {renderAgentAvatar(agent, 32)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-foreground truncate">
                                    {agent.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono truncate">
                                    {entity.entity_id}
                                  </span>
                                </div>
                              </div>
                            ) : loading ? (
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted animate-pulse" />
                                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                                  <div className="h-3 bg-muted rounded w-48 animate-pulse" />
                                </div>
                              </div>
                            ) : project ? (
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <Iconify icon="mdi:cloud" width={20} className="text-blue-500" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-foreground truncate">
                                    {project.altaner.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono truncate">
                                    {entity.entity_id}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="font-mono">{entity.entity_id}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {entity.total_credits.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress 
                                value={entity.proportion * 100} 
                                className="h-2 w-20"
                              />
                              <span className="text-sm font-medium min-w-[4ch]">
                                {(entity.proportion * 100).toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {aiData.credits ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-mono font-medium">
                                  {aiData.credits.toLocaleString()}
                                </span>
                                {aiData.input_tokens && aiData.output_tokens ? (
                                  <span className="text-xs text-muted-foreground">
                                    {(aiData.input_tokens + aiData.output_tokens).toLocaleString()} tokens
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {cloudData.credits ? (
                              <span className="font-medium">
                                {cloudData.credits.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {totalTransactions.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Detailed breakdown of all credit usage</CardDescription>
              </div>
              <Badge variant="outline">
                {pagination.total_count || 0} total transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, index) => {
                      const isAI = transaction.credit_type === 'ai';
                      const isCloud = transaction.credit_type === 'cloud';
                      
                      return (
                        <TableRow key={transaction.id || index}>
                          <TableCell className="font-medium">
                            {transaction.date_creation
                              ? format(parseISO(transaction.date_creation), 'MMM dd, yyyy HH:mm')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="capitalize"
                              style={{
                                borderColor: CREDIT_TYPES[transaction.credit_type]?.color || '#ccc',
                                color: CREDIT_TYPES[transaction.credit_type]?.color || '#666',
                              }}
                            >
                              {transaction.credit_type || 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {transaction.altan_credits?.toFixed(3) || '0.000'}
                          </TableCell>
                          <TableCell className="text-right">
                            {isAI ? (
                              <div className="flex flex-col gap-0.5 text-xs font-mono">
                                <div className="text-muted-foreground">
                                  In: {transaction.input_tokens?.toLocaleString() || '0'}
                                </div>
                                <div className="text-muted-foreground">
                                  Out: {transaction.output_tokens?.toLocaleString() || '0'}
                                </div>
                              </div>
                            ) : isCloud && transaction.meta_data ? (
                              <div className="flex flex-col gap-0.5 text-xs">
                                <div className="font-medium">
                                  {transaction.meta_data.instance_type || 'Unknown'}
                                </div>
                                <div className="text-muted-foreground">
                                  {transaction.meta_data.charge_type === 'full_instance' 
                                    ? 'Running' 
                                    : transaction.meta_data.charge_type || '-'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, pagination.total_count)} of{' '}
                    {pagination.total_count} transactions
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.has_prev || transactionsLoading}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 px-3">
                      <span className="text-sm font-medium">{currentPage}</span>
                      <span className="text-sm text-muted-foreground">of</span>
                      <span className="text-sm font-medium">{pagination.total_pages || 1}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.has_next || transactionsLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default memo(UsagePage);
