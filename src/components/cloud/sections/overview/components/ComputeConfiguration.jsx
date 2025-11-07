import React, { useState } from 'react';
import { Server, ChevronDown, ChevronUp, Cpu, HardDrive, Crown, Loader2 } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../ui/button.tsx';

import analytics from '../../../../../lib/analytics';

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

  const handleToggleExpanded = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    if (newExpandedState) {
      analytics.track('viewed_cloud_plans', {
        current_tier: currentTier,
        available_plans: instanceTypes?.length || 0,
      });
    }
  };

  const handleTierClickInternal = (tier) => {
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
      className={`rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 backdrop-blur-sm p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5 ${
        !base && 'opacity-60'
      }`}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-background/60 to-muted/50 border border-border/60 flex items-center justify-center shadow-sm">
                <Server size={18} className="text-foreground/80" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Compute Configuration
              </h2>
              {upgrading && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-muted-foreground break-words">
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
                <p className="text-xs text-muted-foreground">
                  ${metrics.instance_type.price_per_hour.toFixed(4)}/hour • ${(metrics.instance_type.price_per_hour * 730).toFixed(2)}/month (approx.)
                </p>
              )}
            </div>
          </div>
          <Button
            disabled={!base || upgrading}
            onClick={handleToggleExpanded}
            variant="secondary"
            size="sm"
            className="flex-shrink-0 rounded-md border border-border/60 bg-background/50 hover:bg-accent/40 shadow-sm"
          >
            <Crown className="h-4 w-4 mr-2" />
            {expanded ? 'Hide' : 'View'} Plans
            {expanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
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
                      onClick={() => !isDisabled && handleTierClickInternal(tier)}
                      className={`group relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      } ${
                        isSelected
                          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20'
                          : 'border-border/70 bg-gradient-to-br from-muted/40 to-background/20 hover:border-primary/40 hover:shadow-xl'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
                      )}
                      
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-md transition-transform group-hover:scale-105 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                              : 'bg-background/60 border border-border/60 text-foreground/80'
                          }`}>
                            {tier.name}
                          </span>
                          {tier.is_recommended && (
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md border border-emerald-500/60 bg-emerald-500/10 text-emerald-500 whitespace-nowrap">
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
  );
};


