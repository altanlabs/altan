import { useState } from 'react';

import { setSession } from '../../../utils/auth';
import { optimai_cloud } from '../../../utils/axios';
import { dispatch } from '../../../redux/store';
import { fetchCloud } from '../../../redux/slices/cloud';

export const useInstanceOperations = (cloudId, isPaused) => {
  const [operating, setOperating] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggleStatus = async (onSuccess) => {
    setOperating(true);

    try {
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch (e) {
          // Ignore
        }
      }

      const endpoint = isPaused
        ? `/v1/instances/tenant/${cloudId}/scale/up`
        : `/v1/instances/tenant/${cloudId}/scale/down`;

      await optimai_cloud.post(endpoint);

      setSnackbar({
        open: true,
        message: isPaused
          ? 'Cloud is starting up. This may take a few moments...'
          : 'Cloud has been paused successfully.',
        severity: 'success',
      });

      // Refresh cloud data after delay
      setTimeout(async () => {
        try {
          await dispatch(fetchCloud(cloudId));
        } catch (err) {
          // Expected to fail when paused
        }
        setOperating(false);
        onSuccess?.();
      }, isPaused ? 3000 : 2000);
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
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch (e) {
          // Ignore
        }
      }

      const response = await optimai_cloud.put(
        `/v1/instances/tenant/${cloudId}/scale/resources`,
        {
          instance_type_name: targetTier.name,
        },
      );

      setSnackbar({
        open: true,
        message: `Successfully upgraded to ${targetTier.display_name || targetTier.name}. ${response.data.restart_required ? 'Instance restart required.' : ''}`,
        severity: 'success',
      });

      onSuccess?.(targetTier.id);
    } catch (error) {
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

