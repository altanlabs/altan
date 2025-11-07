import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '../../../ui/button.tsx';
import { Dialog, DialogContent, DialogTitle } from '../../../ui/dialog';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';

export const CreateSecretDialog = ({ open, onClose, onSubmit, editingSecret = null }) => {
  const [formData, setFormData] = useState(
    editingSecret || {
      key: '',
      value: '',
      description: '',
    }
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.key.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({ key: '', value: '', description: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="border-b px-6 py-4">
          <DialogTitle>{editingSecret ? 'Edit Secret' : 'Create Secret'}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Encrypted environment variables for your services
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label className="text-sm">Key *</Label>
            <Input
              placeholder="MY_API_KEY"
              value={formData.key}
              onChange={(e) => setFormData((p) => ({ ...p, key: e.target.value }))}
              disabled={!!editingSecret}
              className="font-mono"
            />
          </div>
          <div>
            <Label className="text-sm">Value</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.value}
              onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to keep current value when editing
            </p>
          </div>
          <div>
            <Label className="text-sm">Description</Label>
            <Textarea
              placeholder="What is this secret used for?"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !formData.key.trim()}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingSecret ? 'Save Changes' : 'Create Secret'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

