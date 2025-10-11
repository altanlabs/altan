import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Popover,
  Snackbar,
} from '@mui/material';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Code,
  Cpu,
  Database,
  FolderOpen,
  HardDrive,
  Key,
  Pause,
  Play,
  RefreshCw,
  Server,
  Users,
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectBaseById, fetchTables } from '../../../../redux/slices/bases';
import { dispatch } from '../../../../redux/store';
import { optimai_cloud, optimai_pg_meta } from '../../../../utils/axios';
import { setSession } from '../../../../utils/auth';

const PRODUCTS = [
  {
    id: 'database',
    name: 'Database',
    description: 'PostgreSQL database',
    icon: Database,
  },
  {
    id: 'users',
    name: 'Users',
    description: 'User management',
    icon: Users,
  },
  {
    id: 'storage',
    name: 'Storage',
    description: 'File storage',
    icon: FolderOpen,
  },
  {
    id: 'functions',
    name: 'Edge Functions',
    description: 'Serverless functions',
    icon: Code,
  },
  {
    id: 'secrets',
    name: 'Secrets',
    description: 'Environment variables',
    icon: Key,
  },
];

function BaseOverview({ baseId, onNavigate }) {
  const base = useSelector((state) => selectBaseById(state, baseId));
  const [expanded, setExpanded] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [storageUsage, setStorageUsage] = useState(0);
  const [currentTier, setCurrentTier] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [operating, setOperating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [instanceTypes, setInstanceTypes] = useState([]);
  const [instanceTypesLoading, setInstanceTypesLoading] = useState(true);
  const [upgradeDialog, setUpgradeDialog] = useState({ open: false, targetTier: null });
  const [upgrading, setUpgrading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [bucketCount, setBucketCount] = useState(0);

  // Detect if instance is stopped based on pod status
  const isPaused = metrics?.pods?.[0]?.status !== 'Running' && !metricsLoading;

  // Fetch instance types from API
  const fetchInstanceTypes = async () => {
    setInstanceTypesLoading(true);
    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      const response = await optimai_cloud.get('/v1/instances/types');
      setInstanceTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching instance types:', error);
      setInstanceTypes([]);
    } finally {
      setInstanceTypesLoading(false);
    }
  };

  // Fetch metrics from API
  const fetchMetrics = async () => {
    setMetricsLoading(true);
    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      const response = await optimai_cloud.get(`/v1/instances/metrics/tenant/${baseId}`);
      setMetrics(response.data);
      setLastRefresh(new Date());

      // Update current tier from instance_type ID
      if (response.data?.instance_type?.id) {
        setCurrentTier(response.data.instance_type.id);
      }

      // Update usage percentages from real data using pod's actual limits (not instance_type)
      if (response.data?.pods?.[0]) {
        const pod = response.data.pods[0];
        const instanceType = response.data.instance_type;
        
        // CPU usage percentage (use pod's actual cpu_limit, not instance_type)
        if (pod.cpu_usage_millicores && pod.cpu_limit) {
          // Parse cpu_limit: "400m" -> 400 millicores, "1" -> 1000 millicores
          const cpuLimitStr = pod.cpu_limit;
          let cpuLimitMillicores = 0;
          if (cpuLimitStr.endsWith('m')) {
            cpuLimitMillicores = parseFloat(cpuLimitStr.replace('m', ''));
          } else {
            cpuLimitMillicores = parseFloat(cpuLimitStr) * 1000;
          }
          const cpuPercent = (pod.cpu_usage_millicores / cpuLimitMillicores) * 100;
          setCpuUsage(Math.min(100, Math.max(0, cpuPercent)));
        }

        // Memory usage percentage (use pod's actual memory_limit, not instance_type)
        if (pod.memory_usage_bytes && pod.memory_limit) {
          // Parse memory_limit: "500Mi" -> bytes, "1Gi" -> bytes
          const memoryLimitStr = pod.memory_limit;
          let memoryLimitBytes = 0;
          if (memoryLimitStr.endsWith('Mi')) {
            memoryLimitBytes = parseFloat(memoryLimitStr.replace('Mi', '')) * 1024 * 1024;
          } else if (memoryLimitStr.endsWith('Gi')) {
            memoryLimitBytes = parseFloat(memoryLimitStr.replace('Gi', '')) * 1024 * 1024 * 1024;
          } else if (memoryLimitStr.endsWith('Ki')) {
            memoryLimitBytes = parseFloat(memoryLimitStr.replace('Ki', '')) * 1024;
          }
          const memoryPercent = (pod.memory_usage_bytes / memoryLimitBytes) * 100;
          setMemoryUsage(Math.min(100, Math.max(0, memoryPercent)));
        }

        // Storage usage (calculate from PVC usage in storage_usage array)
        if (Array.isArray(pod.storage_usage) && pod.storage_usage.length > 0) {
          // Sum up PVC capacities (in Gi)
          let totalCapacityGi = 0;
          let usedGi = 0;
          
          pod.storage_usage.forEach(volume => {
            if (volume.type === 'PersistentVolumeClaim' && volume.capacity) {
              const capacityStr = volume.capacity;
              if (capacityStr.endsWith('Gi')) {
                totalCapacityGi += parseFloat(capacityStr.replace('Gi', ''));
              }
            }
          });

          // For now, use pod memory as rough proxy for storage usage (real metrics would need more data)
          // Or set a default low percentage
          if (totalCapacityGi > 0 && instanceType.storage_gb) {
            // Simple estimate: assume 10-30% usage for active database
            const storagePercent = 15; // Default estimate
            setStorageUsage(storagePercent);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Fetch user count using SQL query via pg-meta
  const fetchUserCount = async () => {
    try {
      const response = await optimai_pg_meta.post(`/${baseId}/query`, {
        query: 'SELECT COUNT(*) as count FROM auth.users',
      });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setUserCount(parseInt(response.data[0].count, 10) || 0);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
      setUserCount(0);
    }
  };

  // Fetch bucket count using SQL query via pg-meta
  const fetchBucketCount = async () => {
    try {
      const response = await optimai_pg_meta.post(`/${baseId}/query`, {
        query: 'SELECT COUNT(*) as count FROM storage.buckets',
      });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setBucketCount(parseInt(response.data[0].count, 10) || 0);
      }
    } catch (error) {
      console.error('Error fetching bucket count:', error);
      setBucketCount(0);
    }
  };

  // Load instance types and metrics on mount
  useEffect(() => {
    fetchInstanceTypes();
    fetchMetrics();
    if (base && !isPaused) {
      fetchUserCount();
      fetchBucketCount();
    }
  }, [baseId, base, isPaused]);

  const currentTierData = instanceTypes.find((t) => t.id === currentTier);
  const tableCount = base?.tables?.items?.length || 0;

  const handleToggleStatus = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleConfirmToggle = async () => {
    setAnchorEl(null);
    setOperating(true);

    try {
      // Ensure token is set from localStorage
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      const endpoint = isPaused
        ? `/v1/instances/tenant/${baseId}/scale/up`
        : `/v1/instances/tenant/${baseId}/scale/down`;

      // Verify token is set
      const token = optimai_cloud.defaults.headers.common.Authorization;
      if (!token) {
        throw new Error('No authentication token found. Please refresh the page and try again.');
      }

      await optimai_cloud.post(endpoint);

      const wasStarting = isPaused; // Track if we're starting or stopping

      setSnackbar({
        open: true,
        message: wasStarting
          ? 'Database is starting up. This may take a few moments...'
          : 'Database has been paused successfully.',
        severity: 'success',
      });

      // Reload base data after a delay to reflect the new state
      if (wasStarting) {
        // When starting, retry multiple times as it takes longer
        let attempts = 0;
        const maxAttempts = 5;
        const retryInterval = setInterval(async () => {
          attempts++;
          try {
            await dispatch(fetchTables(baseId));
            clearInterval(retryInterval);
            setOperating(false);
                      setSnackbar({
                        open: true,
                        message: 'Database is now active!',
                        severity: 'success',
                      });
                      // Refresh metrics
                      fetchMetrics();
                    } catch (err) {
                      if (attempts >= maxAttempts) {
                        clearInterval(retryInterval);
                        setOperating(false);
                        // Refresh metrics even if fetchTables fails
                        fetchMetrics();
                      }
                    }
                  }, 3000);
                } else {
                  // When stopping, just reload once to clear the tables
                  setTimeout(async () => {
                    try {
                      await dispatch(fetchTables(baseId));
                    } catch (err) {
                      // Expected to fail when paused
                    }
                    setOperating(false);
                    // Refresh metrics
                    fetchMetrics();
                  }, 2000);
                }
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: error.response?.data?.message || error.message || 'Failed to change database state',
                  severity: 'error',
                });
                setOperating(false);
              }
            };

  const handleCancelToggle = () => {
    setAnchorEl(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTierClick = (tier) => {
    // If clicking on the same tier, do nothing
    if (tier.id === currentTier) {
      return;
    }

    // If currently upgrading, do nothing
    if (upgrading) {
      return;
    }

    // Show confirmation dialog
    setUpgradeDialog({ open: true, targetTier: tier });
  };

  const handleUpgradeCancel = () => {
    setUpgradeDialog({ open: false, targetTier: null });
  };

  const handleUpgradeConfirm = async () => {
    const targetTier = upgradeDialog.targetTier;
    setUpgradeDialog({ open: false, targetTier: null });
    setUpgrading(true);

    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      const response = await optimai_cloud.put(
        `/v1/instances/tenant/${baseId}/scale/resources`,
        {
          instance_type_name: targetTier.name,
        }
      );

      setSnackbar({
        open: true,
        message: `Successfully upgraded to ${targetTier.display_name || targetTier.name}. ${response.data.restart_required ? 'Instance restart required.' : ''}`,
        severity: 'success',
      });

      // Update current tier
      setCurrentTier(targetTier.id);

      // Refresh metrics after a delay
      setTimeout(() => {
        fetchMetrics();
      }, 2000);
    } catch (error) {
      console.error('Error upgrading instance:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to upgrade instance',
        severity: 'error',
      });
    } finally {
      setUpgrading(false);
    }
  };

  const popoverOpen = Boolean(anchorEl);

  const getProductStats = (productId) => {
    switch (productId) {
      case 'database':
        return `${tableCount} tables`;
      case 'users':
        return `${userCount} users`;
      case 'storage':
        return `${bucketCount} buckets`;
      case 'functions':
        return '0 functions';
      case 'secrets':
        return '0 secrets';
      default:
        return '';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* No Database Alert */}
      <AnimatePresence>
      {!base && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                  <Database size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
            No Database Yet
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200/80">
            Ask the AI in the chat to create and activate a database for you. This is a preview of what
            your database interface will look like.
                  </p>
                </div>
              </div>
            </div>
          </m.div>
      )}

      {/* Paused Database Alert */}
      {base && isPaused && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-amber-600 dark:text-amber-400">
                  <Database size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Database Instance is Paused
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200/80">
            This database instance is currently stopped. Click the "Resume" button to start it.
                  </p>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8"
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Overview
            </h1>
            <m.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchMetrics}
              disabled={metricsLoading || operating}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {metricsLoading ? (
                <CircularProgress size={20} />
              ) : (
                <RefreshCw size={20} className="text-gray-600 dark:text-gray-400" />
              )}
            </m.button>
            {lastRefresh && (
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                Last refresh: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor and configure compute resources for your database
          </p>
        </div>

        <m.div
          whileHover={base ? { scale: 1.05 } : {}}
          whileTap={base ? { scale: 0.98 } : {}}
          onClick={base ? handleToggleStatus : undefined}
          className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm self-start ${
            base ? 'cursor-pointer hover:shadow-lg transition-all' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isPaused ? (
            <Play size={16} className="text-red-500 flex-shrink-0" />
          ) : (
            <div className="relative w-2.5 h-2.5 flex-shrink-0">
              <div className={`absolute inset-0 rounded-full bg-emerald-500 ${base ? 'animate-pulse' : ''}`} />
              {base && (
                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className={`text-sm font-semibold ${isPaused ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isPaused ? 'Paused' : 'Active'}
            </span>
            {metrics?.pods?.[0]?.status && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Pod: {metrics.pods[0].status}
              </span>
            )}
          </div>
        </m.div>
      </m.div>

      <div className="space-y-6">
        {/* Product Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((product, index) => {
              const Icon = product.icon;
              return (
              <m.div
                  key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={base ? { y: -4 } : {}}
                    onClick={() => base && onNavigate?.(product.id === 'database' ? 'tables' : product.id)}
                className={`group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 backdrop-blur-sm transition-all ${
                  base ? 'cursor-pointer hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600' : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={20} className="text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {getProductStats(product.id)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {product.description}
                    </p>
                  </div>
                </div>
              </m.div>
              );
            })}
        </div>

        {/* Compute Size Card */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 ${
            !base && 'opacity-60'
          }`}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <Server size={18} className="text-gray-700 dark:text-gray-300" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Compute Configuration
                  </h2>
                  {upgrading && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <CircularProgress size={12} />
                      Updating...
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                    {metrics?.pods?.[0] ? (
                      <>
                        <span className="font-medium text-gray-900 dark:text-white">Current:</span> {metrics.instance_type?.display_name || metrics.instance_type?.name || 'Instance'} - {metrics.pods[0].memory_limit} RAM, {metrics.pods[0].cpu_limit} CPU ({metrics.instance_type?.cpu_cores || 'CPU'})
                        </>
                      ) : (
                        <>
                        <span className="font-medium text-gray-900 dark:text-white">Current:</span> {currentTierData?.display_name || currentTierData?.name} - {currentTierData?.memory_gb}, {currentTierData?.cpu_cores}
                        </>
                      )}
                  </p>
                    {metrics?.instance_type?.price_per_hour && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        ${metrics.instance_type.price_per_hour.toFixed(4)}/hour • ${(metrics.instance_type.price_per_hour * 730).toFixed(2)}/month (approx.)
                    </p>
                  )}
                </div>
              </div>
              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!base || upgrading}
                  onClick={() => setExpanded(!expanded)}
                className="flex-shrink-0 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {expanded ? 'Hide' : 'View'} Plans
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </m.button>
            </div>

            <AnimatePresence>
              {expanded && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
                    {instanceTypes.map((tier, index) => {
                      const isSelected = tier.id === currentTier;
                      const isDisabled = upgrading || !base;
                      return (
                        <m.div
                          key={tier.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={!isDisabled ? { y: -4, scale: 1.01 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          onClick={() => !isDisabled && handleTierClick(tier)}
                          className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          } ${
                            isSelected
                              ? 'border-blue-500 dark:border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 shadow-lg shadow-blue-500/20'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl'
                          }`}
                        >
                          {/* Decorative gradient overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                          )}
                          
                          <div className="relative space-y-3">
                            {/* Header with badge */}
                            <div className="flex items-center justify-between gap-2">
                              <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-md transition-transform group-hover:scale-105 ${
                                isSelected
                                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
                                {tier.name}
                              </span>
                              {tier.is_recommended && (
                                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                  Recommended
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="py-2">
                              <div className="flex items-baseline gap-1 flex-wrap">
                                <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                                  ${tier.price_per_hour.toFixed(4)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">/ hour</span>
                              </div>
                              <div className="mt-1">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                                  ~${(tier.price_per_hour * 730).toFixed(2)}/month
                                </span>
                              </div>
                            </div>

                            {/* Specs */}
                            <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <div className="flex-shrink-0 w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <Cpu size={10} className="text-gray-600 dark:text-gray-400" />
                                </div>
                                <span className="truncate">{tier.cpu_cores}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <div className="flex-shrink-0 w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <HardDrive size={10} className="text-gray-600 dark:text-gray-400" />
                                </div>
                                <span className="truncate">{tier.memory_gb} memory</span>
                              </div>
                            </div>

                            {/* Selection indicator */}
                            {isSelected && (
                              <m.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
                              >
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </m.div>
                            )}
                          </div>
                        </m.div>
                      );
                    })}
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </m.div>

        {/* Infrastructure Activity - Only show when base exists */}
        {base && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Server size={20} className="text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Infrastructure Activity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* CPU Usage */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 hover:shadow-xl transition-all"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Cpu size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                      {cpuUsage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cpuUsage}%` }}
                        transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                        className={`h-full rounded-full relative overflow-hidden ${
                          cpuUsage > 80
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : cpuUsage > 60
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </m.div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {metrics?.pods?.[0] ? (
                      <>
                          Using <span className="font-semibold text-gray-700 dark:text-gray-300">{metrics.pods[0].cpu_usage_millicores || 0}m</span> of {metrics.pods[0].cpu_limit} ({metrics.instance_type?.cpu_cores || 'CPU'})
                      </>
                    ) : (
                      `Current load on ${currentTierData?.cpu_cores || 'CPU'}`
                    )}
                    </p>
                  </div>
                </div>
              </m.div>

              {/* Memory Usage */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 hover:shadow-xl transition-all"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HardDrive size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                      {memoryUsage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${memoryUsage}%` }}
                        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full relative overflow-hidden ${
                          memoryUsage > 80
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : memoryUsage > 60
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </m.div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {metrics?.pods?.[0] ? (
                      <>
                          Using <span className="font-semibold text-gray-700 dark:text-gray-300">{metrics.pods[0].memory_usage || '0'}</span> of {metrics.pods[0].memory_limit} ({metrics.instance_type?.memory_gb || 'RAM'})
                      </>
                    ) : (
                      <>
                          Using <span className="font-semibold text-gray-700 dark:text-gray-300">{((memoryUsage / 100) * (parseFloat(currentTierData?.memory_gb?.replace(/[^\d.]/g, '')) || 0.5)).toFixed(2)} GB</span> of {currentTierData?.memory_gb}
                      </>
                    )}
                    </p>
                  </div>
                </div>
              </m.div>

              {/* Storage Usage */}
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 hover:shadow-xl transition-all"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Database size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Usage</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                      {storageUsage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${storageUsage}%` }}
                        transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                        className={`h-full rounded-full relative overflow-hidden ${
                          storageUsage > 80
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : storageUsage > 60
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </m.div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {metrics?.instance_type && metrics?.pods?.[0]?.storage_usage ? (
                      <>
                          Total capacity: <span className="font-semibold text-gray-700 dark:text-gray-300">{metrics.pods[0].storage_usage
                          .filter(v => v.type === 'PersistentVolumeClaim')
                            .reduce((sum, v) => sum + parseFloat(v.capacity?.replace('Gi', '') || 0), 0)} Gi</span>
                      </>
                    ) : (
                      'Disk space utilization'
                    )}
                    </p>
                  </div>
                </div>
              </m.div>
            </div>
          </m.div>
        )}
      </div>

      {/* Confirmation Popover */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleCancelToggle}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              mt: 1,
              borderRadius: 3,
              minWidth: 320,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <div className="p-6 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isPaused ? 'Resume Database?' : 'Pause Database?'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isPaused ? (
                  'The database will be resumed and become available.'
                ) : (
                  'The database will be paused and unavailable.'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                onClick={handleCancelToggle}
                variant="outlined"
                size="small"
                disabled={operating}
                className="normal-case"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmToggle}
                variant="contained"
                size="small"
                color={isPaused ? 'success' : 'error'}
                startIcon={operating ? <CircularProgress size={16} /> : (isPaused ? <Play size={16} /> : <Pause size={16} />)}
                disabled={operating}
                className="normal-case"
              >
                {operating ? 'Processing...' : (isPaused ? 'Resume' : 'Pause')}
              </Button>
            </div>
          </div>
        </div>
      </Popover>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Upgrade Confirmation Dialog - Jony Ive Inspired */}
      <Dialog
        open={upgradeDialog.open}
        onClose={handleUpgradeCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 6,
            background: 'transparent',
            backdropFilter: 'blur(80px)',
            boxShadow: 'none',
          },
        }}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <DialogContent className="p-8">
            {upgradeDialog.targetTier && (() => {
              const currentPlan = instanceTypes.find(t => t.id === currentTier);
              const targetPlan = upgradeDialog.targetTier;
              
              // Calculate proportional sizes based on tier index (40px to 120px range)
              const getTierSize = (tier) => {
                const index = instanceTypes.findIndex(t => t.id === tier?.id);
                return 48 + (index * 12);
              };
              
              const currentSize = getTierSize(currentPlan);
              const targetSize = getTierSize(targetPlan);
              
              return (
                <div className="space-y-6">
                  {/* Horizontal Transition Visualization */}
                  <div className="relative py-4">
                    <div className="flex items-center justify-between gap-8">
                      {/* Current Plan - Left */}
                      <m.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 flex flex-col items-center gap-4"
                      >
                        <div 
                          className="relative rounded-3xl bg-gradient-to-br from-gray-200/60 to-gray-300/60 dark:from-gray-700/60 dark:to-gray-800/60 backdrop-blur-xl flex items-center justify-center transition-all duration-500 border border-white/30 dark:border-white/10"
                          style={{ 
                            width: currentSize, 
                            height: currentSize,
                          }}
                        >
                          <Server 
                            size={currentSize * 0.45} 
                            className="text-gray-600 dark:text-gray-300" 
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Current
                          </p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">
                            {currentPlan?.display_name}
                          </p>
                        </div>
                      </m.div>

                      {/* Flow Animation - Creative Transition */}
                      <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-shrink-0 relative flex items-center justify-center"
                        style={{ width: 180, height: 80 }}
                      >
                        {/* Flowing particles - going from point to point */}
                        {[0, 0.35, 0.7].map((delay, i) => (
                          <m.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{
                              transform: 'translate(-50%, -50%)',
                            }}
                            animate={{
                              x: [-90, 90],
                              y: [
                                Math.sin(i * Math.PI / 3) * 4,
                                -Math.sin(i * Math.PI / 3) * 4,
                                Math.sin(i * Math.PI / 3) * 4,
                              ],
                              opacity: [0, 0.3, 1, 1, 0.3, 0],
                              scale: [0, 0.8, 1.4, 1.4, 0.8, 0],
                            }}
                            transition={{
                              duration: 3,
                              delay: delay,
                              repeat: Infinity,
                              ease: [0.25, 0.1, 0.25, 1],
                            }}
                          >
                            <div 
                              className="rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400"
                              style={{
                                width: '12px',
                                height: '12px',
                                boxShadow: `
                                  0 0 25px rgba(99, 102, 241, 0.9),
                                  0 0 50px rgba(168, 85, 247, 0.6),
                                  0 0 75px rgba(99, 102, 241, 0.3)
                                `,
                                filter: 'blur(0.5px)',
                              }}
                            />
                          </m.div>
                        ))}
                        
                        {/* Center glow effect */}
                        <m.div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <div 
                            className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20"
                            style={{
                              filter: 'blur(8px)',
                            }}
                          />
                        </m.div>
                      </m.div>

                      {/* Target Plan - Right */}
                      <m.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 flex flex-col items-center gap-4"
                      >
                        <div 
                          className="relative rounded-3xl bg-gradient-to-br from-blue-500/40 to-purple-600/40 dark:from-blue-400/40 dark:to-purple-500/40 backdrop-blur-xl flex items-center justify-center transition-all duration-500 border border-white/40 dark:border-white/20 shadow-xl"
                          style={{ 
                            width: targetSize, 
                            height: targetSize,
                          }}
                        >
                          <Server 
                            size={targetSize * 0.45} 
                            className="text-white" 
                            strokeWidth={1.5}
                          />
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            New
                          </p>
                          <p className="text-xl font-semibold text-gray-900 dark:text-white">
                            {targetPlan.display_name}
                          </p>
                        </div>
                      </m.div>
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div className="p-4 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Cpu size={16} className="text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">CPU</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {targetPlan.cpu_cores}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <HardDrive size={16} className="text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Memory</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {targetPlan.memory_gb}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="text-gray-700 dark:text-gray-300 text-base font-bold">$</div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${targetPlan.price_per_hour.toFixed(4)}/hr
                          </p>
                        </div>
                      </div>
                    </div>
                  </m.div>

                  {/* Warning */}
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 backdrop-blur-xl border border-amber-500/20 dark:border-amber-400/20"
                  >
                    <p className="text-xs text-center text-gray-700 dark:text-gray-300">
                      Instance restart may be required. Brief downtime expected.
                    </p>
                  </m.div>
                </div>
              );
            })()}
          </DialogContent>
          
          <DialogActions className="px-8 pb-6 bg-transparent">
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-3 w-full"
            >
              <Button
                onClick={handleUpgradeCancel}
                disabled={upgrading}
                className="normal-case flex-1 py-3 rounded-2xl backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/20 dark:border-white/10 text-gray-900 dark:text-white hover:bg-white/40 dark:hover:bg-black/40"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpgradeConfirm}
                disabled={upgrading}
                variant="contained"
                className="normal-case flex-1 py-3 rounded-2xl"
                startIcon={upgrading ? <CircularProgress size={16} /> : null}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #653a8c 100%)',
                  },
                }}
              >
                {upgrading ? 'Applying...' : 'Confirm'}
              </Button>
            </m.div>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
}

export default BaseOverview;
