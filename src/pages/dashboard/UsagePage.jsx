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
import { Button } from '../../components/ui/Button';
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
import { selectAccountId, selectAccountSubscriptions } from '../../redux/slices/general';
import { useSelector as useReduxSelector } from '../../redux/store';
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
