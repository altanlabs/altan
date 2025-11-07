import { m } from 'framer-motion';
import { Server, Cpu, HardDrive, Loader2, ArrowRight } from 'lucide-react';
import React from 'react';

import { Button } from '../../../../ui/button.tsx';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '../../../../ui/dialog';

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

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onCancel?.()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade Instance</DialogTitle>
          <DialogDescription>
            You're upgrading from {currentPlan?.name} to {targetTier.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Comparison */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Current</div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                <div className="w-10 h-10 rounded-md bg-background border flex items-center justify-center">
                  <Server className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{currentPlan?.name}</div>
                  <div className="text-xs text-muted-foreground">{currentPlan?.display_name}</div>
                </div>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

            <div className="flex-1 space-y-2">
              <div className="text-xs text-primary font-medium">New</div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/5 border-primary/20">
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{targetTier.name}</div>
                  <div className="text-xs text-muted-foreground">{targetTier.display_name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground font-medium">New Configuration</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border bg-card space-y-1">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">CPU</span>
                </div>
                <div className="text-sm font-semibold">{targetTier.cpu_cores}</div>
              </div>
              <div className="p-3 rounded-lg border bg-card space-y-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Memory</span>
                </div>
                <div className="text-sm font-semibold">{targetTier.memory_gb}</div>
              </div>
              <div className="p-3 rounded-lg border bg-card space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">$</span>
                  <span className="text-xs text-muted-foreground">Price</span>
                </div>
                <div className="text-sm font-semibold">${targetTier.price_per_hour.toFixed(4)}/hr</div>
              </div>
            </div>
            
            {/* Monthly estimate */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <span className="text-sm text-muted-foreground">Estimated monthly</span>
              <span className="text-sm font-semibold">~${(targetTier.price_per_hour * 730).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
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
            {upgrading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Upgrading...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
