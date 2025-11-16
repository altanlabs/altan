/**
 * Task Details Dialog Component
 * Modal dialog for viewing and editing task details
 */

import { useState } from 'react';
import { Copy, Check, Trash2, X } from 'lucide-react';
import { TaskDetailsDialogProps, TaskStatus } from '../types';
import { TASK_STATUS_LABELS } from '../constants';
import { getTaskStatusConfig } from '../utils/taskStatusUtils';
import { AgentOrbAvatar } from '../../agents/AgentOrbAvatar';
import { agentColors } from '../../plan/planUtils';
import Iconify from '../../iconify/Iconify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Label } from '../../ui/label';

/**
 * Dialog component for task details
 * Follows Single Responsibility Principle - only handles task details UI
 */
export const TaskDetailsDialog = ({
  task,
  open,
  onClose,
  onUpdateTask,
  onDeleteTask,
}: TaskDetailsDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    task.status || TaskStatus.TODO
  );
  const [copySuccess, setCopySuccess] = useState(false);

  const statusConfig = getTaskStatusConfig(task.status);

  const handleCopyId = () => {
    navigator.clipboard.writeText(task.id);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleStatusChange = () => {
    if (selectedStatus !== task.status) {
      onUpdateTask(task.id, { status: selectedStatus });
    }
    onClose();
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">Task Details</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Task Name
            </Label>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {task.title || 'Untitled Task'}
            </p>
          </div>

          {/* Task ID */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Task ID
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 truncate bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {task.id}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className={`h-8 w-8 p-0 transition-colors ${
                  copySuccess
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Current Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Current Status
            </Label>
            <div className="flex items-center gap-2">
              <Iconify
                icon={statusConfig.icon}
                className={`w-4 h-4 ${statusConfig.iconColor}`}
              />
              <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                {task.status || 'to-do'}
              </span>
            </div>
          </div>

          {/* Assigned Agent */}
          {task.assigned_agent_name && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Assigned Agent
              </Label>
              <div className="flex items-center gap-2">
                {agentColors[task.assigned_agent_name] && (
                  <AgentOrbAvatar
                    size={20}
                    agentId={task.assigned_agent_name}
                    colors={agentColors[task.assigned_agent_name]}
                    isStatic
                  />
                )}
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {task.assigned_agent_name}
                </span>
              </div>
            </div>
          )}

          {/* Subthread ID */}
          {task.subthread_id && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Subthread ID
              </Label>
              <code className="block text-xs font-mono text-gray-700 dark:text-gray-300 truncate bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {task.subthread_id}
              </code>
            </div>
          )}

          {/* Change Status */}
          <div className="space-y-2">
            <Label htmlFor="status-select" className="text-sm font-medium">
              Change Status
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as TaskStatus)}
            >
              <SelectTrigger id="status-select" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:justify-between">
          {/* Delete Button */}
          <Button
            onClick={handleDelete}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Task
          </Button>

          <div className="flex gap-2">
            {/* Cancel Button */}
            <Button onClick={onClose} variant="outline" size="sm">
              Cancel
            </Button>

            {/* Save Button */}
            <Button
              onClick={handleStatusChange}
              size="sm"
              disabled={selectedStatus === task.status}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Status
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

