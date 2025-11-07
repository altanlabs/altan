import React from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../ui/alert-dialog';
import { Button } from '../../../../ui/button.tsx';

export const ConfirmationPopover = ({
  open,
  anchorEl, // not used in shadcn version
  isPaused,
  operating,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel?.()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isPaused ? 'Resume Database?' : 'Pause Database?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {isPaused ? 'The database will be resumed and become available.' : 'The database will be paused and unavailable.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" size="sm" onClick={onCancel} disabled={operating}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button size="sm" onClick={onConfirm} disabled={operating}>
              {operating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
              {operating ? 'Processing...' : isPaused ? 'Resume' : 'Pause'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


