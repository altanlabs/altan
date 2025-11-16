// import { cn } from '@lib/utils';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { m, AnimatePresence } from 'framer-motion';
import { memo, useCallback, useMemo, useState } from 'react';

import MorphingSpinner from './MorphingSpinner.jsx';
import { makeSelectMessageExecutions, makeSelectMessageRunning, selectExecutionsById, stopAgentResponse } from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.ts';
import Iconify from '../../iconify/Iconify.jsx';
import ExecutionCard from '../../tasks/ExecutionCard.jsx';

const usePrioritizeExecution = (executions) => {
  const executionsById = useSelector(selectExecutionsById);

  return useMemo(() => {
    if (!executions || !executions.length) {
      return {
        prioritizedExecution: null,
        statusCounts: {
          running: 0,
          preparing: 0,
          success: 0,
          error: 0,
        },
      };
    }

    const statusOrder = ['preparing', 'running', 'success', 'error'];

    const prioritizedExecutions = [...executions].sort((a, b) => {
      const execA = executionsById[a] || {};
      const execB = executionsById[b] || {};

      // 1. Compare by status order.
      const statusA = statusOrder.includes(execA.status) ? statusOrder.indexOf(execA.status) : statusOrder.length;
      const statusB = statusOrder.includes(execB.status) ? statusOrder.indexOf(execB.status) : statusOrder.length;
      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // 2. Compare finished_at in descending order (most recent first).
      const finishedAtA = execA.finished_at ? new Date(execA.finished_at).getTime() : 0;
      const finishedAtB = execB.finished_at ? new Date(execB.finished_at).getTime() : 0;
      if (finishedAtA !== finishedAtB) {
        return finishedAtB - finishedAtA;
      }

      // 3. Compare date_creation in descending order.
      const dateCreationA = execA.date_creation ? new Date(execA.date_creation).getTime() : 0;
      const dateCreationB = execB.date_creation ? new Date(execB.date_creation).getTime() : 0;
      return dateCreationB - dateCreationA;
    });

    // Count executions by status
    const statusCounts = executions.reduce(
      (acc, execId) => {
        const status = executionsById[execId]?.status;
        if (status && acc[status] !== undefined) {
          acc[status]++;
        }
        return acc;
      },
      {
        running: 0,
        preparing: 0,
        success: 0,
        error: 0,
      },
    );

    return {
      prioritizedExecutions,
      statusCounts,
    };
  }, [executions, executionsById]);
};

const MessageTaskExecutions = ({
  messageId,
  // date_creation
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const executionsSelector = useMemo(makeSelectMessageExecutions, []);
  const messageRunningSelector = useMemo(makeSelectMessageRunning, []);
  const executions = useSelector((state) => executionsSelector(state, messageId));
  const messageRunning = useSelector((state) => messageRunningSelector(state, messageId));
  const { prioritizedExecutions, statusCounts } = usePrioritizeExecution(executions);

  const toggleAccordion = useCallback(() => setIsAccordionOpen((prev) => !prev), []);

  const onStop = useCallback(() => {
    dispatch(stopAgentResponse(messageId));
  }, [messageId]);

  if (!executions || !executions.length) return null;

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      layout
      className="w-full"
    >
      <Accordion
        className="w-full"
        sx={{
          margin: 0,
          '&.MuiAccordion-root.Mui-expanded': { margin: 0 },
        }}
      >
        <AccordionSummary
          expandIcon={<Iconify icon="mdi:chevron-down" />}
          onClick={toggleAccordion}
          aria-controls="tasks-content"
          id="tasks-header"
          sx={{
            padding: 0,
            '& .MuiAccordionSummary-content': {
              margin: 0,
              '&.Mui-expanded': { margin: 0, padding: 1 },
            },
          }}
        >
          {/* Summary content */}
          <div
            className="flex flex-col w-full space-y-1"
          >
            {/* Header */}
            <div className="flex flex-row items-center space-x-4">
              <AnimatePresence>
                {!!messageRunning && (
                  <MorphingSpinner onClick={onStop} />
                )}
              </AnimatePresence>
              <span className="flex items-center gap-2 text-sm leading-relaxed font-semibold min-w-[100px]">
                Tasks ({prioritizedExecutions?.length ?? 0})
              </span>
            </div>
            <AnimatePresence>
              {(!prioritizedExecutions?.length || isAccordionOpen) ? null : (
                <m.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <ExecutionCard
                    executionId={prioritizedExecutions[0]}
                    noBorder
                    noClick
                    noDuration
                  />
                </m.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-1 text-sm">
              {
                !!statusCounts.preparing && (
                  <span className="border border-gray-400 border-opacity-40 rounded-xl text-xs px-2 py-1/2 text-orange-500">
                    Preparing: {statusCounts.preparing}
                  </span>
                )
              }
              {
                !!statusCounts.running && (
                  <span className="border border-gray-400 border-opacity-40 rounded-xl text-xs px-2 py-1/2 text-blue-500">
                    Running: {statusCounts.running}
                  </span>
                )
              }
              {
                !!statusCounts.success && (
                  <span className="border border-gray-400 border-opacity-40 rounded-xl text-xs px-2 py-1/2 text-green-500">
                    Success: {statusCounts.success}
                  </span>
                )
              }
              {
                !!statusCounts.error && (
                  <span className="border border-gray-400 border-opacity-40 rounded-xl text-xs px-2 py-1/2 text-red-500">
                    Error: {statusCounts.error}
                  </span>
                )
              }
            </div>
          </div>
        </AccordionSummary>

        {/* Accordion Details */}
        <AccordionDetails sx={{ padding: 1 }}>
          <AnimatePresence>
            <m.div layout className="flex flex-col space-y-2 w-full">
              {prioritizedExecutions.map((executionId) => (
                <ExecutionCard
                  key={`execution-card-${executionId}`}
                  executionId={executionId}
                />
              ))}
            </m.div>
          </AnimatePresence>
        </AccordionDetails>
      </Accordion>
    </m.div>
  );
};

export default memo(MessageTaskExecutions);
