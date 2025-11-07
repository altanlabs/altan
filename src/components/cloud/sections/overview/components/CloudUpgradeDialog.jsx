import { m } from 'framer-motion';
import { Server, Cpu, HardDrive, Loader2 } from 'lucide-react';
import React from 'react';

import { Button } from '../../../../ui/button.tsx';
import { Dialog, DialogContent, DialogTitle } from '../../../../ui/dialog';

export const CloudUpgradeDialog = ({
  open,
  targetTier,
  currentPlan,
  instanceTypes,
  upgrading,
  onConfirm,
  onCancel,
}) => {
  if (!targetTier) return null;

  const getTierSize = (tier) => {
    const index = instanceTypes.findIndex((t) => t.id === tier?.id);
    return 48 + index * 12;
  };

  const currentSize = getTierSize(currentPlan);
  const targetSize = getTierSize(targetTier);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onCancel?.()}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl">
        <div className="px-8 pt-8">
          <DialogTitle className="sr-only">Upgrade plan</DialogTitle>
          <div className="space-y-6">
            <div className="relative py-4">
              <div className="flex items-center justify-between gap-8">
                <m.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col items-center gap-4"
                >
                  <div
                    className="relative rounded-3xl bg-gradient-to-br from-gray-200/60 to-gray-300/60 dark:from-gray-700/60 dark:to-gray-800/60 backdrop-blur-xl flex items-center justify-center transition-all duration-500 border border-white/30 dark:border-white/10"
                    style={{ width: currentSize, height: currentSize }}
                  >
                    <Server
                      size={currentSize * 0.45}
                      className="text-gray-600 dark:text-gray-300"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Current
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentPlan?.display_name}
                    </p>
                  </div>
                </m.div>

                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex-shrink-0 relative flex items-center justify-center"
                  style={{ width: 180, height: 80 }}
                >
                  {[0, 0.35, 0.7].map((delay, i) => (
                    <m.div
                      key={i}
                      className="absolute left-1/2 top-1/2"
                      style={{ transform: 'translate(-50%, -50%)' }}
                      animate={{
                        x: [-90, 90],
                        y: [
                          Math.sin((i * Math.PI) / 3) * 4,
                          -Math.sin((i * Math.PI) / 3) * 4,
                          Math.sin((i * Math.PI) / 3) * 4,
                        ],
                        opacity: [0, 0.3, 1, 1, 0.3, 0],
                        scale: [0, 0.8, 1.4, 1.4, 0.8, 0],
                      }}
                      transition={{
                        duration: 3,
                        delay,
                        repeat: Infinity,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <div
                        className="rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400"
                        style={{
                          width: '12px',
                          height: '12px',
                          boxShadow:
                            '0 0 25px rgba(99, 102, 241, 0.9), 0 0 50px rgba(168, 85, 247, 0.6), 0 0 75px rgba(99, 102, 241, 0.3)',
                          filter: 'blur(0.5px)',
                        }}
                      />
                    </m.div>
                  ))}
                  <m.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div
                      className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/20 dark:to-purple-400/20"
                      style={{ filter: 'blur(8px)' }}
                    />
                  </m.div>
                </m.div>

                <m.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col items-center gap-4"
                >
                  <div
                    className="relative rounded-3xl bg-gradient-to-br from-blue-500/40 to-purple-600/40 dark:from-blue-400/40 dark:to-purple-500/40 backdrop-blur-xl flex items-center justify-center transition-all duration-500 border border-white/40 dark:border-white/20 shadow-xl"
                    style={{ width: targetSize, height: targetSize }}
                  >
                    <Server
                      size={targetSize * 0.45}
                      className="text-white"
                      strokeWidth={1.5}
                    />
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      New
                    </p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {targetTier.display_name}
                    </p>
                  </div>
                </m.div>
              </div>
            </div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="p-4 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Cpu
                    size={16}
                    className="text-gray-700 dark:text-gray-300"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">CPU</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {targetTier.cpu_cores}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10">
                <div className="flex flex-col items-center gap-2 text-center">
                  <HardDrive
                    size={16}
                    className="text-gray-700 dark:text-gray-300"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Memory</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {targetTier.memory_gb}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="text-gray-700 dark:text-gray-300 text-base font-bold">$</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${targetTier.price_per_hour.toFixed(4)}/hr
                    </p>
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </div>
        <div className="px-8 pb-6 flex gap-3">
          <Button
            onClick={onCancel}
            disabled={upgrading}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={upgrading}
            className="flex-1"
          >
            {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {upgrading ? 'Applying...' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
