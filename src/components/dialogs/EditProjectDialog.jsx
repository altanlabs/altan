import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Trash2, Pin, PinOff, Loader2 } from 'lucide-react';

import { updateAltanerById, deleteAltanerById } from '../../redux/slices/altaners';
import { deleteAccountAltaner } from '../../redux/slices/general/index.ts';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const EditProjectDialog = ({ open, onClose, project }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_pinned: false,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        is_pinned: project.is_pinned || false,
      });
      setErrors({});
    }
  }, [project]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!project?.id) {
      console.error('No project ID available');
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateAltanerById(project.id, formData));
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
      setErrors({ submit: 'Failed to update project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project?.id) {
      console.error('No project ID available');
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteAltanerById(project.id));
      dispatch(deleteAccountAltaner(project.id));
      setShowDeleteConfirm(false);
      onClose();
      // Navigate to dashboard after deletion
      history.push('/');
    } catch (error) {
      console.error('Failed to delete project:', error);
      setErrors({ submit: 'Failed to delete project. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!loading && !deleting) {
      setErrors({});
      onClose();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSave();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white/95 to-white/90 dark:from-zinc-950/95 dark:to-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details, toggle pinning, or delete the project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Enter project name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={loading}
                placeholder="Enter project description"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-white/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                {formData.is_pinned ? (
                  <Pin className="h-5 w-5 text-primary" />
                ) : (
                  <PinOff className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="space-y-0.5">
                  <Label htmlFor="pinned" className="text-base cursor-pointer">
                    Pin Project
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pinned projects appear first in your dashboard
                  </p>
                </div>
              </div>
              <Switch
                id="pinned"
                checked={formData.is_pinned}
                onCheckedChange={(checked) => handleInputChange('is_pinned', checked)}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || deleting}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading || deleting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={loading || !formData.name.trim() || deleting}
                className="flex-1 sm:flex-none min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-gradient-to-br from-white/95 to-white/90 dark:from-zinc-950/95 dark:to-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>"{project?.name}"</strong>?
              </p>
              <p className="text-red-600 dark:text-red-400 font-medium">
                This action cannot be undone. All project data will be permanently deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditProjectDialog;
