import { useState, useEffect, useCallback } from 'react';
import { optimai_cloud } from '../../../../../../utils/axios';
import { setSession } from '../../../../../../utils/auth';

export const useMetricsHistory = (baseId, period = '1h') => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetricsHistory = useCallback(async () => {
    if (!baseId) return;

    setLoading(true);
    setError(null);
    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch {
          // Ignore parse errors
        }
      }

      const response = await optimai_cloud.get(
        `/v1/instances/metrics/cloud/${baseId}/history?period=${period}`,
      );
      setHistory(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load metrics history');
    } finally {
      setLoading(false);
    }
  }, [baseId, period]);

  useEffect(() => {
    fetchMetricsHistory();
  }, [fetchMetricsHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchMetricsHistory,
  };
};
