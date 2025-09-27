import { Tooltip } from '@mui/material';
import { differenceInMilliseconds } from 'date-fns';
import { AnimatePresence, m } from 'framer-motion';
import { truncate } from 'lodash';
import React, { memo, useMemo } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import { makeSelectMessagePartById } from '../../redux/slices/room';
import { useSelector } from '../../redux/store.js';
import IconRenderer from '../icons/IconRenderer.jsx';

function getBorderColor(status, isStreaming) {
  if (isStreaming) {
    return 'border-blue-500 animate-pulse';
  }
  
  switch (status) {
    case 'preparing':
      return 'border-orange-500 animate-pulse';
    case 'running':
      return 'border-blue-500 animate-pulse';
    case 'success':
      return 'border-green-500';
    case 'error':
      return 'border-red-500';
    default:
      return 'border-gray-300';
  }
}

function getTaskIcon(status, hasResult, hasError) {
  if (hasError) {
    return 'fluent-mdl2:status-error-full';
  }
  if (hasResult) {
    return 'ep:success-filled';
  }
  return 'ri:hammer-fill';
}

function getTaskIconColor(status, hasResult, hasError, isStreaming) {
  if (hasError) {
    return 'text-red-400';
  }
  if (hasResult) {
    return 'text-green-400';
  }
  if (isStreaming) {
    return 'text-blue-400';
  }
  
  switch (status) {
    case 'preparing':
      return 'text-orange-400';
    case 'running':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
}

function extractAndCapitalize(str) {
  if (!str) return 'Tool';
  const lastSubstring = str.split('.').pop();
  return lastSubstring
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDuration(start, end = null) {
  const startDate = new Date(`${start}Z`);
  const endDate = end ? new Date(`${end}Z`) : new Date(new Date().toISOString()); // Ensure UTC

  const diff = differenceInMilliseconds(endDate, startDate);
  const seconds = (diff / 1000).toFixed(2);
  return `${seconds}s`;
}

function parseArguments(argumentsStr) {
  if (!argumentsStr) return null;
  try {
    return JSON.parse(argumentsStr);
  } catch (e) {
    return argumentsStr; // Return raw string if not valid JSON
  }
}

function formatArgumentsPreview(argumentsStr) {
  if (!argumentsStr) return 'Preparing...';
  
  const parsed = parseArguments(argumentsStr);
  if (typeof parsed === 'object' && parsed !== null) {
    // Show a preview of the object
    const keys = Object.keys(parsed);
    if (keys.length === 0) return '{}';
    if (keys.length === 1) {
      const value = parsed[keys[0]];
      if (typeof value === 'string') {
        return truncate(value, { length: 50 });
      }
    }
    return `{${keys.slice(0, 2).join(', ')}${keys.length > 2 ? '...' : ''}}`;
  }
  
  return truncate(String(parsed), { length: 50 });
}

const variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const ToolPartCard = ({
  partId,
  noBorder = false,
  noClick = false,
  noDuration = false,
  children,
}) => {
  const partSelector = useMemo(() => makeSelectMessagePartById(), []);
  const part = useSelector((state) => partSelector(state, partId));

  const textContent = useMemo(() => extractAndCapitalize(part?.name), [part?.name]);
  
  const isStreaming = !part?.is_done && part?.arguments !== undefined;
  const hasResult = !!part?.result;
  const hasError = !!part?.error;
  const hasInput = !!part?.input;

  if (!part) {
    return null;
  }

  const borderColor = getBorderColor(part.status, isStreaming);
  const duration = part.created_at ? formatDuration(part.created_at, part.finished_at) : null;
  const isExecuting = isStreaming || ['running', 'preparing'].includes(part.status);

  const argumentsPreview = formatArgumentsPreview(part.arguments);

  return (
    <m.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={noClick ? undefined : undefined} // No click handler for now
      className={cn(
        'relative p-3 w-full min-w-[200px] rounded-lg',
        !noClick && 'transition-transform hover:shadow-lg',
        !noBorder && 'border border-dashed',
        !noBorder && borderColor,
      )}
    >
      {/* Status Icon */}
      <AnimatePresence>
        {
          !noBorder && (hasError || hasResult) ? (
            <Tooltip
              placement="right"
              arrow
              enterDelay={500}
              title={
                <p
                  className={cn('text-xs font-bold uppercase', {
                    'text-red-500': hasError,
                    'text-green-500': hasResult,
                  })}
                >
                  {hasError ? 'error' : 'completed'}
                </p>
              }
            >
              <m.div
                className="absolute -top-2 -left-1 rounded-full shadow"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={variants}
              >
                <IconRenderer
                  icon={getTaskIcon(part.status, hasResult, hasError)}
                  className={getTaskIconColor(part.status, hasResult, hasError, isStreaming)}
                />
              </m.div>
            </Tooltip>
          ) : null
        }
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <IconRenderer
              icon="ri:hammer-fill"
              className="text-lg text-gray-600"
            />
            {
              isExecuting ? (
                <TextShimmer className="text-sm font-semibold truncate" duration={2}>
                  {textContent}
                </TextShimmer>
              ) : (
                <p className="text-sm font-semibold truncate">
                  {textContent}
                </p>
              )
            }
          </div>
          {
            !noDuration && !isExecuting && duration && (
              <span className="text-xs text-gray-400">Duration: {duration}</span>
            )
          }
          {
            isExecuting && duration && (
              <span className="text-xs text-gray-400">{duration}...</span>
            )
          }
        </div>

        {/* Arguments Preview */}
        {part.arguments && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Arguments: </span>
            {isStreaming ? (
              <TextShimmer className="inline" duration={1.5}>
                {argumentsPreview}
              </TextShimmer>
            ) : (
              <span>{argumentsPreview}</span>
            )}
          </div>
        )}

        {/* Input Preview */}
        {hasInput && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Input: </span>
            <span>{truncate(JSON.stringify(part.input), { length: 100 })}</span>
          </div>
        )}

        {/* Error Display */}
        {hasError && (
          <p className="text-xs text-red-500 max-h-[55px] overflow-y-auto">
            {truncate(part.error?.content || part.error?.message || 'An error occurred', { length: 200 })}
          </p>
        )}

        {/* Result Preview */}
        {hasResult && !hasError && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Result: </span>
            <span>{truncate(JSON.stringify(part.result), { length: 100 })}</span>
          </div>
        )}

        {children}
      </div>
    </m.div>
  );
};

export default memo(ToolPartCard);
