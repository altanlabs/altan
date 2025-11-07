import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  AlertBanners,
  OverviewHeader,
  StatusBadge,
  ProductShortcuts,
  ComputeConfiguration,
  InfrastructureActivity,
  ConfirmationPopover,
  CloudUpgradeDialog,
  DataApiConfiguration,
  MetricsHistoryCharts,
} from './overview/components';
import { useToast } from '../../../hooks/use-toast';
import { selectCloudById } from '../../../redux/slices/cloud';
import { selectAccountId } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';
import { optimai_cloud } from '../../../utils/axios';
import { PRODUCTS } from '../../databases/base/sections/overview/constants';
import { useMetrics, useInstanceOperations, useInstanceTypes, useProductStats } from '../hooks';

const CloudOverview = ({ onNavigate }) => {
  const { cloudId } = useParams();
  const cloud = useSelector((state) => selectCloudById(state, cloudId));
  const accountId = useSelector(selectAccountId);
  const [anchorEl, setAnchorEl] = useState(null);
  const [upgradeDialog, setUpgradeDialog] = useState({ open: false, targetTier: null });
  const [activating, setActivating] = useState(false);
  const { toast } = useToast();

  // Custom hooks
  const {
    metrics,
    metricsLoading,
    lastRefresh,
    cpuUsage,
    memoryUsage,
    storageUsage,
    currentTier,
    setCurrentTier,
    fetchMetrics,
  } = useMetrics(cloudId);

  const { instanceTypes } = useInstanceTypes();
  const isPaused = metrics?.pods?.[0]?.status !== 'Running' && !metricsLoading;

  const { operating, upgrading, snackbar, setSnackbar, handleToggleStatus, handleUpgrade } =
    useInstanceOperations(cloudId, isPaused);

  const { getProductStats } = useProductStats(cloudId, cloud, isPaused);

  const currentTierData = instanceTypes.find((t) => t.id === currentTier);

  // Handlers
  const handleActivateCloud = async () => {
    if (activating) return;

    if (!cloudId) {
      setSnackbar({
        open: true,
        message: 'Missing component ID. Please try again.',
        severity: 'error',
      });
      return;
    }

    if (!accountId) {
      setSnackbar({
        open: true,
        message: 'Missing account ID. Please try again.',
        severity: 'error',
      });
      return;
    }

    try {
      setActivating(true);
      await optimai_cloud.post(`/v1/instances?altaner_component_id=${cloudId}`, {
        account_id: accountId,
        name: 'New database',
        icon: 'material-symbols:database',
      });

      setSnackbar({
        open: true,
        message: 'Cloud database activated successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to activate cloud database',
        severity: 'error',
      });
    } finally {
      setActivating(false);
    }
  };

  const handleStatusClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleConfirmToggle = async () => {
    setAnchorEl(null);
    await handleToggleStatus(fetchMetrics);
  };

  const handleCancelToggle = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (snackbar?.open) {
      toast({
        title: snackbar.severity === 'error' ? 'Error' : 'Info',
        description: snackbar.message || '',
      });
      setSnackbar({ ...snackbar, open: false });
    }
  }, [snackbar, toast, setSnackbar]);

  const handleTierClick = (tier) => {
    if (tier.id === currentTier || upgrading) {
      return;
    }
    setUpgradeDialog({ open: true, targetTier: tier });
  };

  const handleUpgradeCancel = () => {
    setUpgradeDialog({ open: false, targetTier: null });
  };

  const handleUpgradeConfirm = async () => {
    const targetTier = upgradeDialog.targetTier;
    setUpgradeDialog({ open: false, targetTier: null });

    await handleUpgrade(targetTier, (newTierId) => {
      setCurrentTier(newTierId);
      setTimeout(() => {
        fetchMetrics();
      }, 2000);
    });
  };

  const popoverOpen = Boolean(anchorEl);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Alert Banners */}
      <AlertBanners
        base={cloud}
        isPaused={isPaused}
        onActivate={handleActivateCloud}
        activating={activating}
      />

      {/* Header with Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <OverviewHeader
          lastRefresh={lastRefresh}
          metricsLoading={metricsLoading}
          operating={operating}
          onRefresh={fetchMetrics}
        />
        <StatusBadge
          base={cloud}
          isPaused={isPaused}
          metrics={metrics}
          onClick={handleStatusClick}
        />
      </div>

      <div className="space-y-6">
        {/* Product Shortcuts */}
        <ProductShortcuts
          products={PRODUCTS}
          base={cloud}
          getProductStats={getProductStats}
          onNavigate={onNavigate}
        />

        {/* Compute Configuration */}
        <ComputeConfiguration
          base={cloud}
          metrics={metrics}
          currentTier={currentTier}
          currentTierData={currentTierData}
          instanceTypes={instanceTypes}
          upgrading={upgrading}
          onTierClick={handleTierClick}
        />

        {/* Infrastructure Activity */}
        {cloud && (
          <InfrastructureActivity
            cpuUsage={cpuUsage}
            memoryUsage={memoryUsage}
            storageUsage={storageUsage}
            metrics={metrics}
            currentTierData={currentTierData}
          />
        )}

        {/* Data API Configuration */}
        <DataApiConfiguration metrics={metrics} />

        {/* Metrics History Charts */}
        {cloud && <MetricsHistoryCharts baseId={cloudId} metrics={metrics} />}
      </div>

      {/* Confirmation Popover */}
      <ConfirmationPopover
        open={popoverOpen}
        anchorEl={anchorEl}
        isPaused={isPaused}
        operating={operating}
        onConfirm={handleConfirmToggle}
        onCancel={handleCancelToggle}
      />

      {/* Cloud Upgrade Dialog */}
      <CloudUpgradeDialog
        open={upgradeDialog.open}
        targetTier={upgradeDialog.targetTier}
        currentPlan={currentTierData}
        instanceTypes={instanceTypes}
        upgrading={upgrading}
        onConfirm={handleUpgradeConfirm}
        onCancel={handleUpgradeCancel}
      />
    </div>
  );
};

export default CloudOverview;
