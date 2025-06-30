import { Stack, Box, IconButton, Tooltip, Typography, Button } from '@mui/material';
import React, { memo } from 'react';

import FilterSpec from '../../../graphqueryspec/filterspec/FilterSpec';
import Iconify from '../../../iconify';

const RouteCondition = ({ condition, onLogicChange, onPriorityUp, onPriorityDown, onDelete }) => (
  <Box
    sx={{
      border: '1px gray dashed',
      borderRadius: '10px',
      minHeight: '50px',
      maxHeight: '300px',
      overflowY: 'auto',
      padding: 1,
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
      >
        <Typography variant="caption">Route {condition.priority}</Typography>
        <Button
          size="small"
          startIcon={
            <Iconify
              icon="mdi:delete"
              sx={{
                width: 15,
              }}
            />
          }
          sx={{
            width: 15,
            height: 20,
            transition: 'width 300ms ease',
            '&:hover': {
              width: 125,
            },
          }}
          color="error"
          variant="soft"
          onClick={onDelete}
        >
          <Typography
            variant="caption"
            noWrap
          >
            Delete Route
          </Typography>
        </Button>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
      >
        <Tooltip
          title="Increase Priority"
          arrow
          followCursor
        >
          <span>
            <IconButton
              size="small"
              onClick={onPriorityUp}
              disabled={!onPriorityUp}
            >
              <Iconify
                icon="mdi:chevron-up"
                sx={{
                  width: 20,
                }}
              />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip
          title="Decrease Priority"
          arrow
          followCursor
        >
          <span>
            <IconButton
              size="small"
              onClick={onPriorityDown}
              disabled={!onPriorityDown}
            >
              <Iconify
                icon="mdi:chevron-down"
                sx={{
                  width: 20,
                }}
              />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
    <FilterSpec
      disabled
      onChange={onLogicChange}
      value={condition.condition_logic}
    />
  </Box>
);

export default memo(RouteCondition);
