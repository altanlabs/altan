import React, { useState, useMemo } from 'react';
import { Server, ChevronDown, ChevronUp, Cpu, HardDrive, Loader2, Key, Globe, Copy, Eye, EyeOff, DollarSign, Wrench, Rocket } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../ui/button.tsx';
import { Input } from '../../../../ui/input';
import { Chip } from '@mui/material';

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
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Group instance types by tier_type and mark Medium as recommended
  const groupedInstanceTypes = useMemo(() => {
    const development = instanceTypes
      .filter(t => t.tier_type === 'Development')
      .map(tier => ({
        ...tier,
        is_recommended: (tier.display_name || tier.name || '').toLowerCase() === 'medium'
      }));
    const production = instanceTypes
      .filter(t => t.tier_type === 'Production')
      .map(tier => ({
        ...tier,
        is_recommended: (tier.display_name || tier.name || '').toLowerCase() === 'medium'
      }));
    return { development, production };
  }, [instanceTypes]);


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

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 20) return '•'.repeat(key.length);
    return `${key.slice(0, 10)}${'•'.repeat(key.length - 20)}${key.slice(-10)}`;
  };

  const ApiField = ({ label, value, icon: Icon, showValue, onToggleShow, fieldKey }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 relative">
          <Input
            type="text"
            value={showValue !== undefined ? (showValue ? value : maskKey(value)) : value}
            readOnly
            className="font-mono text-xs"
          />
        </div>
        <div className="flex gap-1">
          {onToggleShow && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onToggleShow();
              }}
              title={showValue ? 'Hide' : 'Show'}
              className="h-8 w-8"
            >
              {showValue ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(value, fieldKey);
            }}
            title={copiedField === fieldKey ? 'Copied!' : 'Copy'}
            className="h-8 w-8"
          >
            <Copy size={18} className={copiedField === fieldKey ? 'text-green-500' : ''} />
          </Button>
        </div>
      </div>
    </div>
  );

  const instanceName = metrics?.instance_type?.display_name || metrics?.instance_type?.name || currentTierData?.display_name || currentTierData?.name || 'Cloud Instance';
  const cloudUrl = metrics?.cloud_url || '';
  const anonKey = metrics?.anon_key || '';
  const serviceRoleKey = metrics?.service_role_key || '';
  const cloudId = metrics?.cloud_id || '';

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      onClick={() => base && !upgrading && handleToggleExpanded()}
      className={`rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 backdrop-blur-sm p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5 transition-colors ${
        !base && 'opacity-60'
      } ${base && !upgrading ? 'cursor-pointer hover:bg-gradient-to-br hover:from-muted/50 hover:to-background/30' : ''}`}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Server size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {instanceName}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {metrics?.pods?.[0] ? (
                    <>
                      {metrics.pods[0].memory_limit} RAM • {metrics.pods[0].cpu_limit} CPU ({metrics.instance_type?.cpu_cores || 'CPU'})
                    </>
                  ) : (
                    <>
                      {currentTierData?.memory_gb} • {currentTierData?.cpu_cores}
                    </>
                  )}
                </p>
              </div>
              {upgrading && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
          </div>
          <Button
            disabled={!base || upgrading}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpanded();
            }}
            variant="outline"
            size="sm"
            className="flex-shrink-0 rounded-md shadow-sm"
          >
            {expanded ? (
              <>
                Hide Details
                <ChevronUp className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                View Details
                <ChevronDown className="h-4 w-4 ml-2" />
              </>
            )}
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
              <div className="space-y-6 pt-4">
                {/* Pricing Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Pricing & Plans
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Choose the right plan for your needs
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Development Tier Section */}
                    {groupedInstanceTypes.development.length > 0 && (
                      <div className="space-y-3">
                        <div className="space-y-2">
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
                          <div className="px-2 py-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              💡 <span className="font-medium">Save on costs:</span> Dev instances may pause during low usage and restart when needed. Perfect for testing and development work.
                            </p>
                          </div>
                        </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                          {groupedInstanceTypes.development.map((tier, index) => {
                      const isSelected = tier.id === currentTier;
                      const isDisabled = upgrading || !base;
                      return (
                        <m.div
                          key={tier.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={!isDisabled ? { y: -2, scale: 1.01 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          onClick={(e) => {
                            e.stopPropagation();
                            !isDisabled && handleTierClickInternal(tier);
                          }}
                          className={`group relative overflow-hidden rounded-lg border-2 p-3 transition-all ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                                } ${
                                  isSelected
                                    ? 'border-indigo-500 dark:border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100/40 dark:from-indigo-950/30 dark:to-indigo-900/20 shadow-lg shadow-indigo-500/25'
                                    : 'border-border/70 bg-gradient-to-br from-muted/40 to-background/20 hover:border-indigo-400 hover:shadow-lg'
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-transparent to-blue-500/5 pointer-events-none" />
                                )}

                                <div className="relative space-y-2">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded transition-transform group-hover:scale-105 ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35'
                                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50'
                                    }`}>
                                      {tier.display_name || tier.name}
                                    </span>
                                    {tier.is_recommended && (
                                      <span className="inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded border border-emerald-500/60 bg-emerald-500/10 text-emerald-500">
                                        ⭐
                                      </span>
                                    )}
                                  </div>

                                  <div className="py-1">
                                    <div className="flex items-baseline gap-0.5">
                                      <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                                        ${Math.round(tier.price_per_hour * 730)}
                                      </span>
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400">/mo</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                                      <Cpu size={12} className="text-gray-500 dark:text-gray-400" />
                                      <span className="truncate">{tier.cpu_cores}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                                      <HardDrive size={12} className="text-gray-500 dark:text-gray-400" />
                                      <span className="truncate">{tier.memory_gb}</span>
                                    </div>
                                  </div>
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
                        <div className="space-y-2">
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
                          <div className="px-2 py-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              🚀 <span className="font-medium">Always available:</span> Prod instances run 24/7 without interruption. Ideal for live applications and customer-facing services.
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                          {groupedInstanceTypes.production.map((tier, index) => {
                            const isSelected = tier.id === currentTier;
                            const isDisabled = upgrading || !base;
                            return (
                              <m.div
                                key={tier.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: (groupedInstanceTypes.development.length + index) * 0.05 }}
                                whileHover={!isDisabled ? { y: -2, scale: 1.01 } : {}}
                                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  !isDisabled && handleTierClickInternal(tier);
                                }}
                                className={`group relative overflow-hidden rounded-lg border-2 p-3 transition-all ${
                                  isDisabled
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                } ${
                                  isSelected
                                    ? 'border-emerald-500 dark:border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/30 dark:to-emerald-900/20 shadow-lg shadow-emerald-500/25'
                                    : 'border-border/70 bg-gradient-to-br from-muted/40 to-background/20 hover:border-emerald-400 hover:shadow-lg'
                                }`}
                        >
                                {isSelected && (
                                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-teal-500/5 pointer-events-none" />
                                )}

                                <div className="relative space-y-2">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded transition-transform group-hover:scale-105 ${
                                      isSelected
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/35'
                                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                                    }`}>
                                      {tier.display_name || tier.name}
                              </span>
                              {tier.is_recommended && (
                                <span className="inline-flex px-1.5 py-0.5 text-[9px] font-medium rounded border border-emerald-500/60 bg-emerald-500/10 text-emerald-500">
                                  ⭐
                                </span>
                              )}
                            </div>

                            <div className="py-1">
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                                  ${Math.round(tier.price_per_hour * 730)}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">/mo</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                                <Cpu size={12} className="text-gray-500 dark:text-gray-400" />
                                <span className="truncate">{tier.cpu_cores}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                                <HardDrive size={12} className="text-gray-500 dark:text-gray-400" />
                                <span className="truncate">{tier.memory_gb}</span>
                              </div>
                            </div>
                          </div>
                        </m.div>
                      );
                    })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data API Section */}
                {cloudUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                        <Key size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Data API Configuration
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          API credentials and endpoints
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <ApiField
                        label="Cloud URL"
                        value={cloudUrl}
                        icon={Globe}
                        fieldKey="url"
                      />
                      <ApiField
                        label="Anon Key"
                        value={anonKey}
                        icon={Key}
                        showValue={showAnonKey}
                        onToggleShow={() => setShowAnonKey(!showAnonKey)}
                        fieldKey="anon"
                      />
                      <ApiField
                        label="Service Role Key"
                        value={serviceRoleKey}
                        icon={Key}
                        showValue={showServiceKey}
                        onToggleShow={() => setShowServiceKey(!showServiceKey)}
                        fieldKey="service"
                      />
                      <ApiField
                        label="Cloud Id"
                        value={cloudId}
                        icon={Key}
                        fieldKey="cloud_id"
                      />
                    </div>
                  </div>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
};


