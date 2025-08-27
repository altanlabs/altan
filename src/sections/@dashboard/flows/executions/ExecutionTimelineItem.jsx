import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Typography, Chip, Stack } from '@mui/material';
import { parseISO, differenceInSeconds } from 'date-fns';
import React, { memo } from 'react';

import { cn } from '@lib/utils';

import SetExecutionRenderer from './SetExecutionRenderer';
import { fToNow } from '../../../../utils/formatTime';

const getStatusColor = (status) => {
  switch (status) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'running':
      return 'warning';
    default:
      return 'default';
  }
};

const calculateDuration = (start, end) => {
  const startDate = parseISO(start);
  const endDate = end ? parseISO(end) : new Date();
  const durationInSeconds = differenceInSeconds(endDate, startDate);
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const ExecutionTimelineItem = ({
  execution,
  showConnector = false,
  isAvailableExecution = false,
  onClose = null,
}) => {
  return (
    <TimelineItem
      className={cn('rounded-lg', isAvailableExecution ? 'bg-[#44ff4444]' : 'bg-transparent')}
    >
      <TimelineOppositeContent className="flex flex-col align-right p-0">
        <Stack
          alignItems="center"
          justifyContent="right"
          spacing={1}
          paddingY={1}
        >
          <Typography variant="body2">{fToNow(execution.date_creation)}</Typography>
          {!!execution.credits && (
            <Chip
              label={`$ ${Number(execution.credits * 0.3 / 100).toFixed(6)}`}
              size="small"
            />
          )}
        </Stack>
        {/* {isAvailableExecution && (
                    <Chip
                      label="New"
                      color="info"
                      size="small"
                      sx={{ ml: 0.5, mt: 0.5 }}
                    />
                  )} */}
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color={getStatusColor(execution.status)} />
        {showConnector && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <SetExecutionRenderer
          data={execution}
          onClose={onClose}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5 }}
        >
          Duration: {calculateDuration(execution.date_creation, execution.finished_at)}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
};

export default memo(ExecutionTimelineItem);
