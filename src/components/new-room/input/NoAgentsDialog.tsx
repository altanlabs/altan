import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NoAgentsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const NoAgentsDialog: React.FC<NoAgentsDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">No Agent Added Yet</DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p className="text-sm">
              Your app needs an AI agent to operate in Run Mode. Agents are the intelligence that powers your application.
            </p>
            <p className="text-sm font-medium text-foreground">
              Ask Altan to create an operator agent for this project.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose} className="w-full sm:w-auto px-8">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

