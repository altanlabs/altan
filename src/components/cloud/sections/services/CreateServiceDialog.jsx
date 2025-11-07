import Editor from '@monaco-editor/react';
import { ChevronDown, ChevronUp, Loader2, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button.tsx';
import { Dialog, DialogContent, DialogTitle } from '../../../ui/dialog';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

const DEFAULT_CODE = `from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def hello():
    return {"message": "Hello from your service!"}
`;

export const CreateServiceDialog = ({ open, onClose, onSubmit, editingService = null }) => {
  const [formData, setFormData] = useState(
    editingService || {
      name: 'my_service',
      description: '',
      code: DEFAULT_CODE,
      requirements: [],
    },
  );
  const [newRequirement, setNewRequirement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Update form data when editingService changes
  useEffect(() => {
    if (open) {
      setFormData(
        editingService || {
          name: 'my_service',
          description: '',
          code: DEFAULT_CODE,
          requirements: [],
        },
      );
      setShowDetails(false); // Collapse details when opening
    }
  }, [open, editingService]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData((p) => ({
        ...p,
        requirements: [...p.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full h-screen p-0 overflow-hidden flex flex-col">
        <div className="border-b px-4 py-3 flex-shrink-0 flex items-center justify-between">
          <DialogTitle>{editingService ? 'Edit Service' : 'Create Service'}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="gap-2"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Details
              </>
            )}
          </Button>
        </div>
        <div className="p-0 overflow-y-auto flex-1 flex flex-col">
          {showDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Service Name *</Label>
                  <Input
                    placeholder="my_service"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    disabled={!!editingService}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use lowercase, numbers, and underscores
                  </p>
                </div>
                <div>
                  <Label className="text-sm">Description</Label>
                  <Input
                    placeholder="What does this service do?"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Python Requirements</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Python packages to install (e.g., requests, pandas)
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="package-name"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddRequirement}
                    disabled={!newRequirement.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {formData.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req) => (
                      <Badge key={req} variant="secondary" className="gap-1">
                        {req}
                        <button
                          className="ml-1 hover:text-destructive"
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              requirements: p.requirements.filter((r) => r !== req),
                            }))}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="overflow-hidden flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  value={formData.code}
                  onChange={(val) => setFormData((p) => ({ ...p, code: val || '' }))}
                  options={{ minimap: { enabled: true }, fontSize: 14 }}
                  theme="vs-dark"
                />
              </div>
            </div>
          )}
        </div>
        <div className="border-t px-6 py-4 flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.name.trim() || !formData.code.trim()}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingService ? 'Save Changes' : 'Create Service'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};