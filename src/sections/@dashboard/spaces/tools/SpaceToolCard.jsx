import { m } from 'framer-motion';
import React, { memo } from 'react';

import Iconify from '@components/iconify';
import { Badge } from '@components/ui/badge';
import { Card } from '@components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import {
  deleteToolLink,
} from '@redux/slices/spaces';
import { dispatch } from '@redux/store.ts';

import IconRenderer from '../../../../components/icons/IconRenderer.jsx';

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
const SpaceToolCard = ({ item, onEdit, spaceId }) => {
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

export default memo(SpaceToolCard);