import { useState } from 'react';
import { optimai_cloud } from '../../../../../../utils/axios';
import { setSession } from '../../../../../../utils/auth';
import { dispatch } from '../../../../../../redux/store.ts';
import { fetchTables } from '../../../../../../redux/slices/bases';

export const useInstanceOperations = (baseId, isPaused) => {
  const [operating, setOperating] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggleStatus = async (onSuccess) => {
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

      const wasStarting = isPaused;

      setSnackbar({
        open: true,
        message: wasStarting
          ? 'Cloud is starting up. This may take a few moments...'
          : 'Cloud has been paused successfully.',
        severity: 'success',
      });

      // Reload base data after a delay
      if (wasStarting) {
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
              message: 'Cloud is now active!',
              severity: 'success',
            });
            onSuccess?.();
          } catch (err) {
            if (attempts >= maxAttempts) {
              clearInterval(retryInterval);
              setOperating(false);
              onSuccess?.();
            }
          }
        }, 3000);
      } else {
        setTimeout(async () => {
          try {
            await dispatch(fetchTables(baseId));
          } catch (err) {
            // Expected to fail when paused
          }
          setOperating(false);
          onSuccess?.();
        }, 2000);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to change cloud state',
        severity: 'error',
      });
      setOperating(false);
    }
  };

  const handleUpgrade = async (targetTier, onSuccess) => {
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
          instance_type: targetTier.tier_type?.toLowerCase(),
        }
      );

      setSnackbar({
        open: true,
        message: `Successfully upgraded to ${targetTier.display_name || targetTier.name}. ${response.data.restart_required ? 'Instance restart required.' : ''}`,
        severity: 'success',
      });

      onSuccess?.(targetTier.id);
    } catch (error) {
      console.error('Error upgrading cloud:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to upgrade cloud',
        severity: 'error',
      });
    } finally {
      setUpgrading(false);
    }
  };

  return {
    operating,
    upgrading,
    snackbar,
    setSnackbar,
    handleToggleStatus,
    handleUpgrade,
  };
};

