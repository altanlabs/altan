import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
}

export const CreateWorkspaceDialog = ({
  open,
  onOpenChange,
  onCreate,
}: CreateWorkspaceDialogProps) => {
  const [workspaceName, setWorkspaceName] = useState('');

  const handleCreate = () => {
    if (workspaceName.trim()) {
      onCreate(workspaceName);
      setWorkspaceName('');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setWorkspaceName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            The new workspace will be associated with your user's organisation.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            autoFocus
            placeholder="Workspace name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreate();
              }
            }}
            className="focus-visible:ring-1"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!workspaceName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

