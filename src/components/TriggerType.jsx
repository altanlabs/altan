import { Schedule, Bolt, PlayArrow } from '@mui/icons-material';
import { Stack, Radio, Box } from '@mui/material';
import React, { memo } from 'react';

import { cn } from '@lib/utils';

import { CardDescription, CardTitle } from './aceternity/cards/card-hover-effect';

const TriggerType = ({ onChange, value }) => {
  const triggerTypes = [
    {
      value: 'scheduled',
      title: 'Scheduled Trigger',
      icon: <Schedule fontSize="large" />,
      description: 'Execute the workflow automatically at specified time intervals',
      examples: 'Examples: Every hour, daily at 9 AM, every Monday',
    },
    {
      value: 'instant',
      title: 'Instant Trigger',
      icon: <Bolt fontSize="large" />,
      description: 'Execute when specific events occur in real-time',
      examples: 'Examples: Webhook calls, asset updates, external events',
    },
    {
      value: 'internal',
      title: 'Internal Trigger',
      icon: <PlayArrow fontSize="large" />,
      description: 'Manual execution or workflow chaining',
      examples: 'Examples: Manual execution, called from other workflows',
    },
  ];
  return (
    <Stack width="100%">
      {triggerTypes.map((type) => (
        <div
          key={type.value}
          onClick={() => onChange(type.value)}
          className={cn(
            'p-2 cursor-pointer overflow-hidden border border-transparent hover:border-slate-700 relative rounded-lg',
            value === type.value ? 'opacity-100' : 'opacity-65',
          )}
        >
          <Stack
            width="100%"
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="start"
          >
            <Radio checked={value === type.value} />
            <Box sx={{ color: 'primary.main' }}>{type.icon}</Box>
            <Stack alignItems="flex-start">
              <CardTitle className="text-left">{type.title}</CardTitle>
              <CardDescription className="text-xs text-left">{type.description}</CardDescription>
            </Stack>
          </Stack>
        </div>
      ))}
    </Stack>
  );
};

export default memo(TriggerType);
