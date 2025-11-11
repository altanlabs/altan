import React, { useState, useMemo } from 'react';
import { CircularProgress, Chip } from '@mui/material';
import { Server, ChevronDown, ChevronUp, Cpu, HardDrive, Wrench, Rocket } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

import Iconify from '../../../../../iconify';
import analytics from '../../../../../../lib/analytics';

export const ComputeConfiguration = ({
  base,
  metrics,
  currentTier,
  currentTierData,
  instanceTypes,
  upgrading,
  onTierClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Group instance types by tier_type
  const groupedInstanceTypes = useMemo(() => {
    const development = instanceTypes.filter(t => t.tier_type === 'Development');
    const production = instanceTypes.filter(t => t.tier_type === 'Production');
    return { development, production };
  }, [instanceTypes]);

  const handleToggleExpanded = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    
    // Track when user views cloud plans
    if (newExpandedState) {
      analytics.track('viewed_cloud_plans', {
        current_tier: currentTier,
        available_plans: instanceTypes?.length || 0,
      });
    }
  };

  const handleTierClick = (tier) => {
    // Track cloud plan upgrade
    analytics.track('upgraded_cloud_plan', {
      from_tier: currentTier,
      to_tier: tier.id,
      from_tier_name: currentTierData?.name,
      to_tier_name: tier.name,
      price_per_hour: tier.price_per_hour,
      cpu_cores: tier.cpu_cores,
      memory_gb: tier.memory_gb,
    });
    
    onTierClick(tier);
  };

  return (
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!base || upgrading}
            onClick={handleToggleExpanded}
            className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-blue-50/80 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/60 text-sm font-medium text-blue-700 dark:text-blue-300 hover:border-blue-300 dark:hover:border-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
          >
            <Iconify icon="material-symbols:crown" width={16} className="text-blue-600 dark:text-blue-400" />
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
              className="overflow-hidden space-y-6 pt-4"
            >
                    {/* Development Tier Section */}
                    {groupedInstanceTypes.development.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                          <Wrench size={16} className="text-indigo-600 dark:text-indigo-400" />
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Development
                          </h3>
                          <Chip 
                            label="DEV" 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '11px',
                              fontWeight: 600,
                              bgcolor: 'rgb(79 70 229 / 0.12)',
                              color: 'rgb(79 70 229)',
                              border: '1px solid rgb(79 70 229 / 0.25)',
                            }} 
                          />
                        </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {groupedInstanceTypes.development.map((tier, index) => {
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
                              ? 'border-indigo-500 dark:border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100/40 dark:from-indigo-950/30 dark:to-indigo-900/20 shadow-lg shadow-indigo-500/25'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-transparent to-blue-500/5 pointer-events-none" />
                          )}
                          
                          <div className="relative space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-md transition-transform group-hover:scale-105 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50'
                              }`}>
                                {tier.display_name || tier.name}
                              </span>
                              {tier.is_recommended && (
                                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                  Recommended
                                </span>
                              )}
                            </div>

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
                </div>
              )}

                    {/* Production Tier Section */}
                    {groupedInstanceTypes.production.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                          <Rocket size={16} className="text-emerald-600 dark:text-emerald-400" />
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Production
                          </h3>
                          <Chip 
                            label="PROD" 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '11px',
                              fontWeight: 600,
                              bgcolor: 'rgb(5 150 105 / 0.12)',
                              color: 'rgb(5 150 105)',
                              border: '1px solid rgb(5 150 105 / 0.25)',
                            }} 
                          />
                        </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {groupedInstanceTypes.production.map((tier, index) => {
                      const isSelected = tier.id === currentTier;
                      const isDisabled = upgrading || !base;
                      return (
                        <m.div
                          key={tier.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (groupedInstanceTypes.development.length + index) * 0.05 }}
                          whileHover={!isDisabled ? { y: -4, scale: 1.01 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          onClick={() => !isDisabled && handleTierClick(tier)}
                          className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          } ${
                            isSelected
                              ? 'border-emerald-500 dark:border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/30 dark:to-emerald-900/20 shadow-lg shadow-emerald-500/25'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-teal-500/5 pointer-events-none" />
                          )}
                          
                          <div className="relative space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-md transition-transform group-hover:scale-105 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/35'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                              }`}>
                                {tier.display_name || tier.name}
                              </span>
                              {tier.is_recommended && (
                                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                  Recommended
                                </span>
                              )}
                            </div>

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

                            {isSelected && (
                              <m.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg"
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
                </div>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
};

