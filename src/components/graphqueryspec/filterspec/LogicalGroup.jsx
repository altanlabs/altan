// LogicalGroup.js
import { Stack, Tooltip } from '@mui/material';
import React, { memo, useCallback } from 'react';

import { cn } from '@lib/utils';

import FilterSpec from './FilterSpec';
import { MovingComponent } from '../../aceternity/buttons/moving-border';
import Iconify from '../../iconify';

const LogicalGroup = ({ logicop, value, onChange, depth = 0, disabled = false }) => {
  // const handleLogicOpChange = (e) => {
  //   onChange({ logicop: e.target.value, value });
  // };

  const handleValueChange = useCallback(
    (index, newValue) => {
      const newValueArray = [...value];
      newValueArray[index] = newValue;
      onChange({ logicop, value: newValueArray });
    },
    [logicop, onChange, value],
  );

  const addCondition = useCallback(() => {
    onChange({
      logicop,
      value: [...value, { param: '', operation: { operator: '_eq', value: '' } }],
    });
  }, [logicop, onChange, value]);

  const removeCondition = useCallback(
    (index) => {
      console.log('removeCondition at index', index);
      const newValueArray = value.filter((_, i) => i !== index);
      console.log('removeCondition. newValueArray:', newValueArray);
      onChange({ logicop, value: newValueArray });
    },
    [logicop, onChange, value],
  );

  return (
    <Stack
      spacing={1}
      width="100%"
    >
      {/* <TextField
        size="small"
        select
        label="Logical Operator"
        value={logicop}
        onChange={handleLogicOpChange}
        fullWidth
      >
        {Object.values(LogicalType).map((op) => (
          <MenuItem key={op} value={op}>
            {op}
          </MenuItem>
        ))}
      </TextField> */}
      {logicop !== '@not' &&
        value.map((condition, index) => (
          <FilterSpec
            key={index}
            value={condition}
            onChange={(newCondition) => handleValueChange(index, newCondition)}
            depth={depth + 1}
            onDelete={() => removeCondition(index)}
            disabled={disabled}
          />
        ))}
      {logicop === '@not' && (
        <FilterSpec
          value={value}
          onChange={(newCondition) => onChange({ logicop, value: newCondition })}
          depth={depth + 1}
          disabled={disabled}
        />
      )}
      {logicop !== '@not' && (
        <Tooltip
          arrow
          followCursor
          title={`Add condition inside ${logicop}`}
        >
          <span>
            <MovingComponent
              onClick={addCondition}
              borderRadius="0.75rem"
              containerClassName={cn(
                'h-8 w-full transform hover:opacity-100 transition-opacity duration-300 ease-in-out opacity-75 border border-transparent hover:border-gray-300 dark:hover:border-gray-700',
                disabled && "border-gray-300 'dark:border-gray-700 pointer-events-none",
              )}
              borderClassName="h-[40px] w-[250px]"
              enableBorder={!value?.length && !disabled}
              className="p-2 bg-white dark:bg-black overflow-hidden border border-transparent group-hover:border-slate-700 relative z-20"
            >
              <Iconify
                icon="mdi:plus"
                width={18}
              />
            </MovingComponent>
          </span>
        </Tooltip>
      )}
    </Stack>
  );
};

export default memo(LogicalGroup);
