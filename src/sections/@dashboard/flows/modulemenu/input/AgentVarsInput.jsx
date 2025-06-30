import { Stack, Typography, Box } from '@mui/material';
import React, { memo } from 'react';

import { VarOption } from '../../../../../components/lexical/nodes/VarNode.tsx';

const AGENT_MODULE_VARS = {
  inputs: {
    account_id: {
      type: 'string',
      label: 'Workspace ID',
      value: '[$vars].account_id',
      description: 'The unique identifier for the workspace',
      required: true,
    },
    workflow_id: {
      type: 'string',
      label: 'Workflow ID',
      value: '[$vars].workflow_id',
      description: 'The workflow identifier',
      required: false,
    },
    thread_id: {
      type: 'string',
      label: 'Thread ID',
      value: '[$vars].thread_id',
      description: 'The thread identifier',
      required: false,
    },
    room_id: {
      type: 'string',
      label: 'Room ID',
      value: '[$vars].room_id',
      description: 'The room identifier',
      required: false,
    },
    message_id: {
      type: 'string',
      label: 'Message ID',
      value: '[$vars].message_id',
      description: 'The message identifier',
      required: false,
    },
  },
};

const AgentVarsInput = ({ searchTerm, onSelect }) => {
  const filteredVars = Object.entries(AGENT_MODULE_VARS.inputs).filter(([, { label }]) =>
    label.toLowerCase().includes((searchTerm || '').toLowerCase()),
  );

  const handleSelect = (label, value) => {
    const varOption = new VarOption(value, 'string', label);
    onSelect(varOption);
  };

  return (
    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
      <Stack spacing={1}>
        {filteredVars.map(([key, { label, description, value }]) => (
          <Stack
            key={key}
            onClick={() => handleSelect(label, value)}
            sx={{
              cursor: 'pointer',
              px: 2,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Typography variant="subtitle2">{label}</Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {description}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default memo(AgentVarsInput);
