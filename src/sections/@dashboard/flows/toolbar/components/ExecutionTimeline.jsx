import Timeline from '@mui/lab/Timeline';
import { timelineContentClasses } from '@mui/lab/TimelineContent';
import Stack from '@mui/material/Stack';
import React, { useEffect, useCallback, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';

import VirtualizedList from '../../../../../components/virtualized/VirtualizedList.jsx';
import {
  getFlowExecutions,
  selectFlowExecutions,
  selectFlowId,
  selectCurrentExecution,
} from '../../../../../redux/slices/flows.js';
import { dispatch } from '../../../../../redux/store.ts';
import { bgBlur } from '../../../../../utils/cssStyles.js';
import ExecutionTimelineItem from '../../executions/ExecutionTimelineItem.jsx';

const selectExecutionsInitialized = (state) => state.flows.initialized.executions;
const selectExecutionsLoading = (state) => state.flows.isLoading.executions;

const ExecutionTimeline = ({ onClose }) => {
  // const theme = useTheme();
  const flowId = useSelector(selectFlowId);
  const flowExecutions = useSelector(selectFlowExecutions);
  const availableExecutions = useSelector(selectCurrentExecution);
  const initialized = useSelector(selectExecutionsInitialized);
  const isLoading = useSelector(selectExecutionsLoading);

  useEffect(() => {
    if (flowId && !initialized && !isLoading) {
      dispatch(getFlowExecutions(flowId));
    }
  }, [flowId, initialized, isLoading]);

  const availableExecutionsIds = useMemo(
    () => Object.keys(availableExecutions || {}),
    [availableExecutions],
  );

  const renderExec = useCallback(
    (index, exec) => {
      const isAvailableExecution = availableExecutionsIds.includes(exec.id);
      return (
        <ExecutionTimelineItem
          key={exec.id}
          execution={exec}
          isAvailableExecution={isAvailableExecution}
          showConnector={index !== (flowExecutions?.length ?? 0) - 1}
          onClose={onClose}
        />
      );
    },
    [availableExecutionsIds, flowExecutions?.length, onClose],
  );

  return (
    <Stack
      height="85vh"
      width={300}
      sx={{
        overflowY: 'auto',
        ...bgBlur({ opacity: 0.5 }),
        borderRadius: '10px',
      }}
    >
      <Timeline
        sx={{
          [`& .${timelineContentClasses.root}`]: {
            flex: 0.2,
          },
        }}
      >
        <VirtualizedList
          listId="execution-event-triggers"
          data={flowExecutions}
          renderItem={renderExec}
          initialized={initialized}
          noDataMessage="No previous executions found."
        />
      </Timeline>
    </Stack>
  );
};

export default memo(ExecutionTimeline);
