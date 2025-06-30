import { Box, Typography, Tooltip, CardContent, Card, Stack } from '@mui/material';
import { styled } from '@mui/system';
import React, { memo, useMemo, useCallback } from 'react';

import {
  selectCurrentExecutionByModule,
  setModuleExecInMenu,
} from '../../../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../../../redux/store';
import Iconify from '../../../../iconify';

const STATUS_COLOR_MAP = {
  start: '#3498db',
  success: '#2ecc71',
  error: '#e74c3c',
};

const StyledBox = styled(Box)(({ statuscolor }) => ({
  background: `radial-gradient(circle, ${statuscolor} 30%, #fff 100%)`,
  height: 24,
  width: 24,
  borderRadius: '50%',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  top: -32,
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateX(-50%) scale(1.1)',
  },
}));

const StyledIconify = styled(Iconify)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

const formatPayloadSize = (sizeInKB) => {
  if (sizeInKB >= 1024 * 1024) {
    return `${(sizeInKB / (1024 * 1024)).toFixed(2)} GB`;
  } else if (sizeInKB >= 1024) {
    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  }
  return `${sizeInKB.toFixed(2)} KB`;
};

const ModuleExecutionsOverview = ({ status, moduleId }) => {
  const currentExecByModuleSelector = useMemo(() => {
    if (status === 'new') {
      return () => null;
    }
    return selectCurrentExecutionByModule(moduleId);
  }, [moduleId, status]);
  const moduleExecutions = useSelector(currentExecByModuleSelector);
  const handleOpen = useCallback(
    (e) => {
      e.stopPropagation();
      dispatch(setModuleExecInMenu(moduleId));
    },
    [moduleId],
  );

  const executionArrayLength = useMemo(
    () => Object.keys(moduleExecutions?.details ?? {}).length,
    [moduleExecutions?.details],
  );

  const stats = useMemo(() => {
    if (!executionArrayLength) {
      return null;
    }
    const stats = [
      {
        icon: 'eva:clock-outline',
        message:
          moduleExecutions.status === 'start'
            ? `${((Date.now() - new Date(moduleExecutions.details.timestamp).getTime()) / 1000).toFixed(2)} seconds running...`
            : `Elapsed time: ${Number(moduleExecutions.elapsedTime).toFixed(2)} seconds`,
      },
      {
        icon: 'mdi:currency-usd',
        message: `Task Credits consumed: ${Number(moduleExecutions.credits * 0.3).toFixed(2)}`,
      },
    ];
    if (!!moduleExecutions.llm_credits) {
      stats.push({
        icon: 'mdi:currency-usd',
        message: `AI credits consumed: ${Number(moduleExecutions.llm_credits).toFixed(4)}`,
      });
    }
    if (!!moduleExecutions.api_credits) {
      stats.push({
        icon: 'mdi:currency-usd',
        message: `API credits consumed: ${Number(moduleExecutions.llm_credits).toFixed(2)}`,
      });
    }
    stats.push({
      icon: 'carbon:data-base-alt',
      message: `Payload size: ${formatPayloadSize(Number(moduleExecutions.payloadSize))}`,
    });
    return stats;
  }, [
    executionArrayLength,
    moduleExecutions?.details?.timestamp,
    moduleExecutions?.credits,
    moduleExecutions?.llm_credits,
    moduleExecutions?.elapsedTime,
    moduleExecutions?.payloadSize,
    moduleExecutions?.status,
    moduleExecutions?.api_credits,
  ]);

  if (!executionArrayLength) {
    return null;
  }

  return (
    <>
      <Tooltip
        arrow
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: 'transparent',
            },
          },
        }}
        title={
          <Card>
            <CardContent>
              <Stack
                spacing={0.5}
                width="100%"
              >
                {stats.map((stat, i) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    key={`mexec-stat-${i}`}
                  >
                    <Iconify
                      icon={stat.icon}
                      width={15}
                    />
                    <Typography variant="body2">{stat.message}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        }
        placement="top"
      >
        <StyledBox
          onClick={handleOpen}
          statuscolor={STATUS_COLOR_MAP[moduleExecutions.status]}
        >
          {moduleExecutions.status === 'start' && (
            <StyledIconify
              icon="line-md:loading-twotone-loop"
              width={40}
            />
          )}

          <Typography variant="caption">{moduleExecutions.total}</Typography>
        </StyledBox>
      </Tooltip>
    </>
  );
};

export default memo(ModuleExecutionsOverview);
