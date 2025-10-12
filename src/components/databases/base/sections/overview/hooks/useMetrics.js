import { useState, useEffect } from 'react';
import { optimai_cloud } from '../../../../../../utils/axios';
import { setSession } from '../../../../../../utils/auth';

export const useMetrics = (baseId) => {
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [storageUsage, setStorageUsage] = useState(0);
  const [currentTier, setCurrentTier] = useState(null);

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

      // Update usage percentages from real data using pod's actual limits
      if (response.data?.pods?.[0]) {
        const pod = response.data.pods[0];
        const instanceType = response.data.instance_type;
        
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
          } else if (memoryLimitStr.endsWith('Ki')) {
            memoryLimitBytes = parseFloat(memoryLimitStr.replace('Ki', '')) * 1024;
          }
          const memoryPercent = (pod.memory_usage_bytes / memoryLimitBytes) * 100;
          setMemoryUsage(Math.min(100, Math.max(0, memoryPercent)));
        }

        // Storage usage
        if (Array.isArray(pod.storage_usage) && pod.storage_usage.length > 0) {
          let totalCapacityGi = 0;
          
          pod.storage_usage.forEach(volume => {
            if (volume.type === 'PersistentVolumeClaim' && volume.capacity) {
              const capacityStr = volume.capacity;
              if (capacityStr.endsWith('Gi')) {
                totalCapacityGi += parseFloat(capacityStr.replace('Gi', ''));
              }
            }
          });

          if (totalCapacityGi > 0 && instanceType.storage_gb) {
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

  useEffect(() => {
    fetchMetrics();
  }, [baseId]);

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

