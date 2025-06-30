import { Stack, Box, Typography } from '@mui/material';
import { uniqueId } from 'lodash';
import React, { memo, useMemo, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import RouteCondition from './components/RouteCondition';

const RouterModule = () => {
  const { control, setValue } = useFormContext();
  const { fields, append, update, remove, swap, move, insert } = useFieldArray({
    control,
    name: 'route_conditions',
    keyName: 'key',
  });

  const lastConditionPriority = useMemo(
    () => Math.max(...fields.map((rc) => rc.priority), -1),
    [fields],
  );

  const addCondition = useCallback(
    () =>
      append({
        id: uniqueId(),
        priority: lastConditionPriority + 1,
        condition_logic: {},
        next_module_id: null,
        'x-is-new': true,
      }),
    [append, lastConditionPriority],
  );

  const onPriorityUp = useCallback(
    (conditionIndex) => {
      if (!conditionIndex) {
        return;
      }
      setValue(`route_conditions.[${conditionIndex}].priority`, conditionIndex - 1, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
      setValue(`route_conditions.[${conditionIndex - 1}].priority`, conditionIndex, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
      swap(conditionIndex, conditionIndex - 1);
    },
    [swap, setValue],
  );

  const onPriorityDown = useCallback(
    (conditionIndex) => {
      const numberRoutes = fields.length;
      if (conditionIndex === numberRoutes - 1) {
        return;
      }
      setValue(`route_conditions.${conditionIndex}.priority`, conditionIndex + 1, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
      setValue(`route_conditions.${conditionIndex + 1}.priority`, conditionIndex, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
      swap(conditionIndex, conditionIndex + 1);
    },
    [fields, swap, setValue],
  );

  const onDelete = useCallback(
    (conditionId) => {
      remove(fields.findIndex((c) => c.id === conditionId));
    },
    [remove, fields],
  );

  return (
    <Stack spacing={0.75}>
      {fields?.map((condition, index, arr) => (
        <RouteCondition
          key={`${condition.id}_${index}`}
          condition={condition}
          onLogicChange={(value) => update(index, { ...condition, condition_logic: value })}
          onPriorityUp={index ? () => onPriorityUp(index) : null}
          onPriorityDown={index === arr.length - 1 ? null : () => onPriorityDown(index)}
          onDelete={() => onDelete(condition.id)}
        />
      ))}
      {/* <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
      >
        <Tooltip
          title="Every added route becomes the origin of a subpath in the workflow"
          arrow
          followCursor
        >
          <Button
            size="small"
            onClick={addCondition}
            startIcon={
              <Iconify icon="mdi:plus" />
            }
          >
            Add route
          </Button>
        </Tooltip>
      </Stack> */}
      <Box
        sx={{
          border: '1px gray dashed',
          borderRadius: '10px',
          overflowY: 'auto',
          p: 1,
          px: 2,
        }}
      >
        <Typography variant="caption">Default</Typography>
      </Box>
    </Stack>
  );
};

export default memo(RouterModule);
