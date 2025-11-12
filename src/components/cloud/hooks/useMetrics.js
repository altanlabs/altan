import { useState, useEffect, useCallback } from 'react';

import { setSession } from '../../../utils/auth';
import { optimai_cloud } from '../../../utils/axios';

export const useMetrics = (cloudId) => {
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [storageUsage, setStorageUsage] = useState(0);
  const [currentTier, setCurrentTier] = useState(null);

  const fetchMetrics = useCallback(async () => {
    if (!cloudId) return;

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

      const response = await optimai_cloud.get(`/v1/instances/metrics/cloud/${cloudId}`);
      setMetrics(response.data);
      setLastRefresh(new Date());

      // Update current tier from instance_type ID
      if (response.data?.instance_type?.id) {
        setCurrentTier(response.data.instance_type.id);
      }

      // Update usage percentages
      if (response.data?.pods?.[0]) {
        const pod = response.data.pods[0];

        // CPU usage percentage
        if (pod.cpu_usage_millicores && pod.cpu_limit) {
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

        // Memory usage percentage
        if (pod.memory_usage_bytes && pod.memory_limit) {
          const memoryLimitStr = pod.memory_limit;
          let memoryLimitBytes = 0;
          if (memoryLimitStr.endsWith('Mi')) {
            memoryLimitBytes = parseFloat(memoryLimitStr.replace('Mi', '')) * 1024 * 1024;
          } else if (memoryLimitStr.endsWith('Gi')) {
            memoryLimitBytes = parseFloat(memoryLimitStr.replace('Gi', '')) * 1024 * 1024 * 1024;
          }
          const memoryPercent = (pod.memory_usage_bytes / memoryLimitBytes) * 100;
          setMemoryUsage(Math.min(100, Math.max(0, memoryPercent)));
        }

        // Storage usage
        setStorageUsage(15); // Default estimate
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setMetricsLoading(false);
    }
  }, [cloudId]);

  useEffect(() => {
    fetchMetrics();
    // Poll metrics every 10 seconds
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    metricsLoading,
    lastRefresh,
    cpuUsage,
    memoryUsage,
    storageUsage,
    currentTier,
    setCurrentTier,
    fetchMetrics,
  };
};
