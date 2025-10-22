import { Snackbar, Alert } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
} from './components';
import { PRODUCTS } from './constants';
import { useMetrics, useInstanceOperations, useInstanceTypes, useProductStats } from './hooks';
import { selectBaseById } from '../../../../../redux/slices/bases';
import { selectAccountId } from '../../../../../redux/slices/general';
import { optimai_cloud } from '../../../../../utils/axios';

function BaseOverview({ baseId, onNavigate }) {
  const base = useSelector((state) => selectBaseById(state, baseId));
  const accountId = useSelector(selectAccountId);
  const { componentId: altanerComponentId } = useParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [upgradeDialog, setUpgradeDialog] = useState({ open: false, targetTier: null });
  const [activating, setActivating] = useState(false);

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
  } = useMetrics(baseId);

  const { instanceTypes } = useInstanceTypes();

  const isPaused = metrics?.pods?.[0]?.status !== 'Running' && !metricsLoading;

  const { operating, upgrading, snackbar, setSnackbar, handleToggleStatus, handleUpgrade } =
    useInstanceOperations(baseId, isPaused);

  const { getProductStats } = useProductStats(baseId, base, isPaused);

  const currentTierData = instanceTypes.find((t) => t.id === currentTier);

  // Handlers
  const handleActivateCloud = async () => {
    if (activating) return;

    if (!altanerComponentId) {
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
      await optimai_cloud.post(
        `/v1/instances?altaner_component_id=${altanerComponentId}`,
        {
          account_id: accountId,
          name: 'New database',
          icon: 'material-symbols:database',
        },
      );

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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
        base={base}
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
          base={base}
          isPaused={isPaused}
          metrics={metrics}
          onClick={handleStatusClick}
        />
      </div>

      <div className="space-y-6">
        {/* Product Shortcuts */}
        <ProductShortcuts
          products={PRODUCTS}
          base={base}
          getProductStats={getProductStats}
          onNavigate={onNavigate}
        />

        {/* Compute Configuration */}
        <ComputeConfiguration
          base={base}
          metrics={metrics}
          currentTier={currentTier}
          currentTierData={currentTierData}
          instanceTypes={instanceTypes}
          upgrading={upgrading}
          onTierClick={handleTierClick}
        />

        {/* Infrastructure Activity */}
        {base && (
          <InfrastructureActivity
            cpuUsage={cpuUsage}
            memoryUsage={memoryUsage}
            storageUsage={storageUsage}
            metrics={metrics}
            currentTierData={currentTierData}
          />
        )}
        <DataApiConfiguration metrics={metrics} />

        {/* Metrics History Charts */}
        {base && <MetricsHistoryCharts baseId={baseId} metrics={metrics} />}
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

      {/* Snackbar */}
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
}

export default BaseOverview;
