import { Tooltip } from '@mui/material';
import { differenceInMilliseconds } from 'date-fns';
import { AnimatePresence, m } from 'framer-motion';
import { truncate } from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';

import { TextShimmer } from '@components/aceternity/text/text-shimmer.tsx';
import { cn } from '@lib/utils';

import { useExecutionDialog } from '../../providers/ExecutionDialogProvider.jsx';
import { makeSelectExecution } from '../../redux/slices/room/selectors/messageSelectors';
import { useSelector } from '../../redux/store.ts';
import IconRenderer from '../icons/IconRenderer.jsx';

function getBorderColor(status) {
  switch (status) {
    case 'preparing':
      // Slower or same speed pulse – you can define custom classes if you prefer
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

function getTaskIcon(status) {
  switch (status) {
    case 'error':
      return 'fluent-mdl2:status-error-full';
    case 'success':
      return 'ep:success-filled';
    default:
      return 'ri:hammer-fill';
  }
}

function getTaskIconColor(status) {
  switch (status) {
    case 'preparing':
      return 'text-orange-400';
    case 'running':
      return 'text-blue-400';
    case 'error':
      return 'text-red-400';
    case 'success':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
}

function extractAndCapitalize(str) {
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

const variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const ExecutionCard = ({
  executionId,
  noBorder = false,
  noClick = false,
  noDuration = false,
  children,
}) => {
  const { setExecutionId } = useExecutionDialog();
  const executionSelector = useMemo(makeSelectExecution, []);
  const execution = useSelector((state) => executionSelector(state, executionId));

  const onClick = useCallback(() => setExecutionId(executionId), [executionId, setExecutionId]);

  const textContent = useMemo(() => extractAndCapitalize(
    execution?.tool?.name ||
    execution?.tool_name ||
    execution?.tool?.action_type?.name ||
    'Tool',
  ), [execution?.tool?.action_type?.name, execution?.tool?.name, execution?.tool_name]);

  if (!execution) {
    return null;
  }

  const executionBorderColor = getBorderColor(execution.status);
  const duration = formatDuration(execution.date_creation, execution.finished_at);
  const isExecuting = ['running', 'preparing'].includes(execution.status);

  return (
    <m.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={noClick ? undefined : onClick}
      className={cn(
        'relative p-3 w-full min-w-[200px] rounded-lg',
        !noClick && 'transition-transform hover:shadow-lg cursor-pointer',
        !noBorder && 'border border-dashed',
        !noBorder && executionBorderColor,
      )}
    >
      {/* Status Icon */}
      <AnimatePresence>
        {
          !noBorder && ['error', 'success'].includes(execution?.status) ? (
            <Tooltip
              placement="right"
              arrow
              enterDelay={500}
              title={
                <p
                  className={cn('text-xs font-bold uppercase', {
                    'text-red-500': execution?.status === 'error',
                    'text-green-500': execution?.status === 'success',
                  })}
                >
                  {execution?.status}
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
                  icon={getTaskIcon(execution.status)}
                  className={getTaskIconColor(execution.status)}
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
            {/* <AnimatePresence>
              {
                isExecuting ? (
                  <span
                    className="w-[20px] h-[20px] flex items-center justify-center rounded-full
                animate-spin
                bg-gradient-to-br from-purple-500 via-blue-500 to-transparent
                [mask-image:radial-gradient(circle,transparent 60%,white 65%)]
                shadow-[0_0_15px_5px_rgba(102,126,234,0.8)]
                before:absolute before:inset-0 before:rounded-full
                before:border-2 before:border-t-purple-500 before:border-transparent
              "
                  >
                  </span>
                ) : null
              }
            </AnimatePresence> */}
            <IconRenderer
              icon={execution?.tool?.icon || execution?.tool?.action_type?.connection_type?.icon || 'ri:hammer-fill'}
              className="text-lg text-gray-600"
            />
            {
              isExecuting ? (

                <TextShimmer className="text-sm font-semibold truncate" duration={2}>
                  {textContent}
                </TextShimmer>
              ) : (
                <p className="text-sm font-semibold truncate" >
                  {textContent}
                </p>

              )
            }
          </div>
          {
            !noDuration && !isExecuting && (
              <span className="text-xs text-gray-400">Duration: {duration}</span>
            )
          }
          {
            isExecuting && (
              <span className="text-xs text-gray-400">{duration}...</span>
            )
          }
        </div>

        {/* Error / Additional Info */}
        {execution?.status === 'error' && (
          <p className="text-xs text-red-500 max-h-[55px] overflow-y-auto">
            {truncate(execution?.error?.content ?? '', { length: 200 })}
          </p>
        )}

        {/* Optional: Show a small note if still preparing */}
        {/* {execution?.status === 'preparing' && (
          <p className="text-xs italic text-orange-500">
            Preparing resources...
          </p>
        )} */}
        {children}
      </div>
    </m.div>
  );
};

export default memo(ExecutionCard);
