// ConditionSelector.js
import { Menu, MenuItem, Stack } from '@mui/material';
import { capitalize } from 'lodash';
import React, { memo } from 'react';

import { cn } from '@lib/utils';

import { LogicalType } from './LogicalType';
import { MovingComponent } from '../../aceternity/buttons/moving-border';
import { CardTitle } from '../../aceternity/cards/card-hover-effect';
import Iconify from '../../iconify';

const ConditionType = {
  BASIC_CONDITION: {
    value: 'basic',
    icon: 'tabler:equal',
  },
  ...LogicalType,
};

const ICON_MAPPING = Object.values(ConditionType).reduce((acc, c) => {
  acc[c.value] = c.icon;
  return acc;
}, {});

const ConditionSelector = ({ selected, onSelect, disabled = false }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (type) => {
    setAnchorEl(null);
    if (type) {
      onSelect(type === 'delete' ? null : type);
    }
  };

  if (!(!disabled || (!!selected?.logicop && selected.logicop !== 'Basic Condition'))) {
    return null;
  }

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
      >
        <MovingComponent
          onClick={handleClick}
          borderRadius="0.75rem"
          duration={6000}
          containerClassName={cn(
            'h-8 w-full transform hover:opacity-100 transform transition-transform:opacity hover:scale-110 duration-300 ease-in-out opacity-75 border border-transparent hover:border-gray-300 dark:hover:border-gray-700',
            disabled && 'border-gray-300 dark:border-gray-700 pointer-events-none',
          )}
          borderClassName="h-[80px] w-[250px]"
          enableBorder={!selected && !disabled}
          className="p-2 bg-white dark:bg-black overflow-hidden border border-transparent group-hover:border-slate-700 relative z-20"
        >
          <Iconify
            icon={!selected ? 'mdi:plus' : ICON_MAPPING[selected.logicop ?? 'basic']}
            width={20}
          />
          <CardTitle className="text-left truncate w-full ml-2">
            {!!selected
              ? selected.logicop
                ? capitalize(selected.logicop.slice(1))
                : 'Basic Condition'
              : disabled
                ? 'No condition'
                : 'Add Condition'}
          </CardTitle>
        </MovingComponent>
        {/* <Button
          size="small"
          variant="soft"
          color="inherit"
          onClick={handleClick}
          disabled={disabled}
        >
        </Button> */}
      </Stack>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => handleClose(null)}
      >
        {Object.entries(ConditionType).map(([key, { value, icon }]) => (
          <MenuItem
            key={value}
            onClick={() => handleClose(value)}
          >
            <Iconify
              icon={icon}
              width={17}
            />
            <CardTitle className="text-left text-sm w-full ml-2">
              {capitalize(key.replace('_', ' '))}
            </CardTitle>
          </MenuItem>
        ))}
        {!!selected && (
          <MenuItem onClick={() => handleClose('delete')}>
            <Iconify
              icon="mdi:delete"
              color="red"
            />
            <CardTitle className="text-left text-sm w-full ml-2 text-red-500">Delete</CardTitle>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default memo(ConditionSelector);
