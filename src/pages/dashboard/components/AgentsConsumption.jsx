import React, { memo, useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  // BarChart,
  // Bar,
  // PieChart,
  // Pie,
  // Cell,
  // Legend,
} from 'recharts';

import UsageToggle from './UsageToggle';
// import Iconify from '../../../components/iconify';
import { updateAgentsUsage } from '../../../redux/slices/general';
import { useSelector, dispatch } from '../../../redux/store';
import { optimai } from '../../../utils/axios';
// import { fToNow } from '../../../utils/formatTime';

// Selectors
const selectAgents = (state) => state.general.account?.agents;
const selectAccountId = (state) => state.general.account?.id;

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TIME_RANGES = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  All: null,
};

const AGGREGATION_PERIODS = {
  hour: 'Hourly',
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
};

// Helper function for formatting credits
const formatCredits = (credits) => {
  if (credits >= 1000) return `${(credits / 1000).toFixed(2)}k`;
  if (credits >= 1) return credits.toFixed(2);
  return credits.toFixed(3);
};

// Helper functions for date aggregation
const getPeriodKey = (date, aggregation) => {
  const d = new Date(date);
  switch (aggregation) {
    case 'hour':
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
    case 'day':
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    case 'week':
      const week = Math.floor(d.getDate() / 7);
      return `${d.getFullYear()}-${d.getMonth()}-${week}`;
    case 'month':
      return `${d.getFullYear()}-${d.getMonth()}`;
    default:
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
};

const getPeriodStart = (date, aggregation) => {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);

  switch (aggregation) {
    case 'hour':
      return d;
    case 'day':
      d.setHours(0);
      return d;
    case 'week':
      d.setHours(0);
      const day = d.getDate() - d.getDay();
      d.setDate(day);
      return d;
    case 'month':
      d.setHours(0);
      d.setDate(1);
      return d;
    default:
      d.setHours(0);
      return d;
  }
};

const getTooltipLabel = (timestamp, aggregation) => {
  const date = new Date(timestamp);
  switch (aggregation) {
    case 'hour':
      return date.toLocaleString();
    case 'day':
      return date.toLocaleDateString();
    case 'week':
      const endDate = new Date(date);
      endDate.setDate(date.getDate() + 6);
      return `Week of ${date.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    case 'month':
      return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    default:
      return date.toLocaleDateString();
  }
};

const fetchAgentUsage = async (memberId) => {
  try {
    const response = await optimai.get(`/agent/${memberId}/usage`);
    return response.data.usage;
  } catch (error) {
    console.error(`Error fetching usage for member ${memberId}:`, error);
    return null;
  }
};

const AgentsConsumption = () => {
  const agents = useSelector(selectAgents);
  const accountId = useSelector(selectAccountId);
  const agentsUsageData = useSelector((state) => state.general.agentsUsageData);
  const [timeRange, setTimeRange] = useState('30d');
  const [aggregation, setAggregation] = useState('day');
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [error, setError] = useState(null);
  // const [searchParams, setSearchParams] = useLocation();

  // Fetch usage data only if we don't have it yet
  useEffect(() => {
    const fetchAllAgentsUsage = async () => {
      if (!agents?.length) {
        setIsLoadingUsage(false);
        return;
      }

      // Check if we already have usage data for all agents
      const hasAllAgentsData = agents.every(
        (agent) => agent.member?.id && agentsUsageData[agent.id],
      );
      if (hasAllAgentsData) {
        setIsLoadingUsage(false);
        return;
      }

      setIsLoadingUsage(true);
      setError(null);

      try {
        const validAgents = agents.filter((agent) => agent.member?.id);
        const usagePromises = validAgents.map((agent) =>
          // Only fetch for agents we don't have data for
          agentsUsageData[agent.id]
            ? Promise.resolve({ agent_id: agent.id, ...agentsUsageData[agent.id] })
            : fetchAgentUsage(agent.member.id),
        );

        const usageResults = await Promise.allSettled(usagePromises);

        // Process results
        const usageData = {};
        usageResults.forEach((result, index) => {
          const agent = validAgents[index];
          if (result.status === 'fulfilled' && result.value) {
            usageData[agent.id] = {
              ...result.value,
              agent_name: agent.name,
              agent_id: agent.id,
            };
          }
        });

        // Update Redux store with new usage data
        dispatch(updateAgentsUsage(usageData));
      } catch (error) {
        console.error('Error fetching agents usage:', error);
        setError(error.message);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    fetchAllAgentsUsage();
  }, [agents, accountId]);

  const chartData = useMemo(() => {
    if (!Object.keys(agentsUsageData).length) {
      return {
        timeSeriesData: [],
        stats: {
          totalTokens: 0,
          totalCredits: 0,
          totalMessages: 0,
          totalExecutions: 0,
        },
        topAgents: [],
      };
    }

    const timeSeriesMap = new Map();
    const agentStats = new Map();
    let totalTokens = 0;
    let totalCredits = 0;
    let totalMessages = 0;
    let totalExecutions = 0;

    Object.values(agentsUsageData).forEach((agent) => {
      agent.room_memberships.items.forEach((room) => {
        room.messages.items.forEach((message) => {
          totalMessages++;

          // Count executions
          const executionsCount = message.executions?.items?.length || 0;
          totalExecutions += executionsCount;

          // Get tokens from meta_data
          const metaDataTokens = message.meta_data?.tokens || 0;
          const credits = (message.tokens || 0) * 0.001;
          const date = new Date(message.date_creation);

          // Update total stats
          totalTokens += metaDataTokens;
          totalCredits += credits;

          // Aggregate by period
          const periodKey = getPeriodKey(date, aggregation);
          const periodStart = getPeriodStart(date, aggregation).getTime();

          if (!timeSeriesMap.has(periodKey)) {
            timeSeriesMap.set(periodKey, {
              date: periodStart,
              tokens: 0,
              credits: 0,
              messages: 0,
            });
          }
          const periodData = timeSeriesMap.get(periodKey);
          periodData.tokens += metaDataTokens;
          periodData.credits += credits;
          periodData.messages += 1;

          // Update agent stats
          if (!agentStats.has(agent.agent_id)) {
            agentStats.set(agent.agent_id, {
              id: agent.agent_id,
              name: agent.agent_name,
              total_credits: 0,
              total_tokens: 0,
              messages_count: 0,
            });
          }
          const stat = agentStats.get(agent.agent_id);
          stat.total_credits += credits;
          stat.total_tokens += metaDataTokens;
          stat.messages_count += 1;
        });
      });
    });

    // Convert time series map to sorted array
    const timeSeriesData = Array.from(timeSeriesMap.values()).sort((a, b) => a.date - b.date);

    // Filter data based on selected time range
    const daysToInclude = TIME_RANGES[timeRange];
    const cutoffDate = daysToInclude
      ? new Date(Date.now() - daysToInclude * 24 * 60 * 60 * 1000)
      : new Date(0);

    const filteredTimeSeriesData = timeSeriesData.filter(
      (data) => new Date(data.date) >= cutoffDate,
    );

    return {
      timeSeriesData: filteredTimeSeriesData,
      stats: {
        totalTokens,
        totalCredits,
        totalMessages,
        totalExecutions,
      },
      topAgents: Array.from(agentStats.values()).sort((a, b) => b.total_credits - a.total_credits),
    };
  }, [agentsUsageData, timeRange, aggregation]);

  // Show loading state
  if (isLoadingUsage) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-48 mb-4"></div>
        <div className="h-[400px] bg-gray-800 rounded"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="text-red-500">Error loading agents usage: {error}</div>
      </div>
    );
  }

  // Show empty state
  if (!agents?.length) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="text-gray-400">No agents found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <UsageToggle />

        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
          {/* Time Range Selector */}
          <div className="flex rounded-md overflow-hidden w-full sm:w-auto">
            {Object.entries(TIME_RANGES).map(([key]) => (
              <button
                key={key}
                onClick={() => setTimeRange(key.toLowerCase())}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-sm ${timeRange === key.toLowerCase() ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Aggregation Selector */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Total Tokens</div>
          <div className="text-2xl font-semibold text-white">
            {chartData.stats.totalTokens.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Total Credits</div>
          <div className="text-2xl font-semibold text-white">
            {formatCredits(chartData.stats.totalCredits)}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Total Messages</div>
          <div className="text-2xl font-semibold text-white">
            {chartData.stats.totalMessages.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 text-sm">Agent Tasks</div>
          <div className="text-2xl font-semibold text-white">
            {chartData.stats.totalExecutions.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Usage Timeline */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="h-[400px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={chartData.timeSeriesData}
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
                tickFormatter={formatCredits}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#D1D5DB',
                }}
                formatter={(value, name) => [
                  name === 'credits' ? formatCredits(value) : value.toLocaleString(),
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
                labelFormatter={(timestamp) => getTooltipLabel(timestamp, aggregation)}
              />
              <Line
                type="monotone"
                dataKey="credits"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Agents */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Top Agents by Usage</h3>
          <div className="space-y-4">
            {chartData.topAgents.slice(0, 5).map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-sm font-medium text-white">{agent.name}</div>
                    <div className="text-sm text-gray-400">{agent.messages_count} messages</div>
                  </div>
                </div>
                <div className="text-sm text-white">
                  {formatCredits(agent.total_credits)} credits
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {chartData.timeSeriesData
              .slice(-5)
              .reverse()
              .map((msg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <div className="text-sm font-medium text-white">{msg.agent}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(msg.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-white">{formatCredits(msg.credits)} credits</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AgentsConsumption);
