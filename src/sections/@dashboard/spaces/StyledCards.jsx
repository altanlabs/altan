import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { m } from 'framer-motion';
import React from 'react';

import Iconify from '@components/iconify';
import { Badge } from '@components/ui/badge';
import { Card } from '@components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { cn } from '@lib/utils';
import {
  setDialogActive,
  deleteToolLink,
} from '@redux/slices/spaces';
import { dispatch } from '@redux/store';

import IconRenderer from '../../../components/icons/IconRenderer';

export function BaseCard({
  item,
  mode = 'space',
  children,
  onDelete = null,
  onEdit = null,
  onSettings = null,
  isEditMode,
  isEditLayout,
  draggable = true,
  content = null,
  viewFile = null,
  onClick = null,
  onDoubleClick = null,
  buttonsChildren = null,
  dragOnButton = false,
}) {
  const { active, isDragging, attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item?.id,
      transition: {
        duration: 250,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    });

  const updatedTransform = active
    ? { ...transform, scaleY: isDragging ? 1.05 : 1, scaleX: isDragging ? 1.05 : 1 }
    : transform;

  const draggableActive = isEditLayout && draggable && !!item && item.id !== 'new';

  return (
    <div
      ref={draggableActive ? setNodeRef : null}
      style={{ transform: CSS.Transform.toString(updatedTransform), transition }}
      className={cn(
        'relative flex items-center gap-3 p-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        'transition-all duration-200 ease-in-out',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600',
        'active:translate-y-0 active:shadow-sm',
        draggableActive ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'opacity-70 shadow-lg scale-[1.02]' : '',
        onClick ? 'cursor-pointer' : '',
      )}
      {...(draggableActive ? attributes : {})}
      {...(draggableActive && !dragOnButton ? listeners : {})}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {draggableActive && (
        <Iconify
          icon="mdi:drag"
          className={cn(
            'text-gray-500 dark:text-gray-400',
            dragOnButton ? 'cursor-grab active:cursor-grabbing' : '',
          )}
          {...(draggableActive && dragOnButton ? listeners : {})}
        />
      )}

      {children}

      {(!draggableActive || dragOnButton) && (
        <div className="absolute top-1/2 -translate-y-1/2 right-2 z-10 flex items-center gap-1.5 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          {buttonsChildren}
          {viewFile && (
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-50 hover:opacity-100"
              onClick={() => viewFile()}
              disabled={content !== null && !content.length}
            >
              <Iconify
                icon="carbon:view"
                className="text-blue-500"
              />
            </button>
          )}
          {onEdit && (
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-50 hover:opacity-100"
              onClick={() =>
                !(isEditMode && mode === 'widget' && item.type !== 'custom_message') &&
                onEdit(item.id)}
              disabled={content !== null && !content.length}
            >
              <Iconify
                icon={
                  isEditMode
                    ? !content || content !== item.name
                        ? 'mdi:tick'
                        : 'mdi:close'
                    : 'material-symbols:edit'
                }
                className="text-green-500"
              />
            </button>
          )}
          {!item?.type && onSettings && (
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-50 hover:opacity-100"
              onClick={() =>
                mode === 'attribute'
                  ? onSettings()
                  : dispatch(
                      setDialogActive({ item: { id: item.id, type: mode }, dialog: 'settings' }),
                    )}
            >
              <Iconify
                icon="solar:settings-bold-duotone"
                className="text-yellow-500"
              />
            </button>
          )}
          {onDelete && (
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 opacity-50 hover:opacity-100"
              onClick={() => onDelete(item.id)}
            >
              <Iconify
                icon="ic:twotone-delete"
                className="text-red-500"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Tool configuration helpers - Single Responsibility Principle
const getToolIcon = (tool) => {
  const isClientTool = tool?.tool_type === 'client';
  return isClientTool
    ? 'mdi:desktop-classic'
    : tool?.action_type?.connection_type?.icon ||
      tool?.action_type?.connection_type?.external_app?.icon ||
      'ri:hammer-fill';
};

const getToolType = (tool) => {
  const isClientTool = tool?.tool_type === 'client';
  return isClientTool
    ? 'Client'
    : tool?.action_type?.connection_type?.name || 'Server';
};

// Animated Icon Component - DRY principle
const ToolIcon = ({ icon }) => (
  <div className="w-9 h-9 rounded-md border bg-muted/50 flex items-center justify-center flex-shrink-0">
    <IconRenderer icon={icon} className="w-4 h-4" />
  </div>
);

// Delete Button Component - Single Responsibility
const DeleteButton = ({ onClick }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <m.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
      >
        <Iconify icon="ph:trash" width={14} />
      </m.button>
    </TooltipTrigger>
    <TooltipContent side="left">
      <p className="text-xs">Remove tool</p>
    </TooltipContent>
  </Tooltip>
);

// Main Card Component - Open/Closed Principle
export const SpaceToolCard = ({ item, onEdit, spaceId }) => {
  const tool = item.tool;
  const toolIcon = getToolIcon(tool);
  const toolType = getToolType(tool);

  const handleClick = () => onEdit(item);
  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteToolLink(item.id, tool.id, spaceId));
  };

  return (
    <TooltipProvider delayDuration={300}>
      <m.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="group"
      >
        <Card
          className="relative cursor-pointer border hover:border-foreground/20 hover:shadow-sm transition-all duration-150 bg-card"
          onClick={handleClick}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3">
            <ToolIcon icon={toolIcon} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                <Badge
                  variant="outline"
                  className="text-[9px] sm:text-[10px] h-3.5 sm:h-4 px-1 sm:px-1.5 font-medium border-muted-foreground/20"
                >
                  {toolType}
                </Badge>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-xs sm:text-sm font-medium truncate leading-tight">
                    {tool.name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">{tool.name}</p>
                  {tool.description && (
                    <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                  )}
                </TooltipContent>
              </Tooltip>

              {tool.description && (
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
                  {tool.description}
                </p>
              )}
            </div>

            <DeleteButton onClick={handleDelete} />
          </div>
        </Card>
      </m.div>
    </TooltipProvider>
  );
};
