import {
  Stack,
  TextField,
  Autocomplete,
  Divider,
  Tooltip,
} from '@mui/material';
import { useState, memo, useCallback } from 'react';

import { useSelector } from '../redux/store';
import { CardTitle } from './aceternity/cards/card-hover-effect';
import InteractiveButton from './buttons/InteractiveButton';
import FlowStatusBadge from './flows/canvas/nodes/modulenode/FlowStatusBadge';

const selectAccountFlows = (state) => state.flows.flows;

const renderOption = ({ key, ...props }, option) => (
  <li
    key={key}
    {...props}
  >
    <Tooltip
      arrow
      placement="top"
      title={option.description}
    >
      <Stack
        className="antialiased"
        direction="row"
        spacing={1}
        alignItems="center"
        width="100%"
      >
        <FlowStatusBadge
          status={option.is_active}
          size={12}
        />
        <CardTitle>{option.name}</CardTitle>
      </Stack>
    </Tooltip>
  </li>
);

function FlowAutocomplete({ onChange, value, multiple = false }) {
  const [open, setOpen] = useState(false);
  const flows = useSelector(selectAccountFlows);

  const handleChange = useCallback(
    (event, newValue) => {
      if (multiple) {
        onChange(newValue.map((e) => e.id));
      } else {
        onChange(newValue ? newValue.id : null);
      }
    },
    [multiple, onChange],
  );

  const handleClose = useCallback(
    (flowId) => {
      setOpen(false);
      if (!!flowId) {
        if (!multiple) {
          onChange(flowId);
        } else {
          onChange([...(value || []), flowId]);
        }
      }
    },
    [multiple, onChange, value],
  );

  const selectedValue = multiple
    ? flows?.filter((flow) => value?.includes(flow.id))
    : flows?.find((flow) => flow.id === value) || null;

  const openCreate = useCallback(() => setOpen(true), []);

  // Prevent event bubbling when clicking on chips
  const handleMouseDown = useCallback((event) => {
    // Stop propagation to prevent dialog from closing when clicking on chips
    event.stopPropagation();
  }, []);

  return (
    <>
      <Stack
        spacing={0.5}
        width="100%"
        alignItems="center"
      >
        {flows && flows.length > 0 ? (
          <>
            <div
              onMouseDown={handleMouseDown}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%' }}
            >
              <Autocomplete
                fullWidth
                multiple={multiple}
                size="small"
                id="flow-autocomplete"
                options={flows}
                isOptionEqualToValue={(option, value) =>
                  option.id === (typeof value === 'string' ? value : value.id)}
                getOptionLabel={(option) => option.name}
                renderOption={renderOption}
                getOptionKey={(option) => option.id}
                renderInput={({ key, ...params }) => (
                  <TextField
                    key={key}
                    {...params}
                    placeholder={multiple ? 'Select Flows' : 'Select a Flow'}
                    variant="filled"
                    hiddenLabel
                  />
                )}
                value={selectedValue}
                onChange={handleChange}
                PopperProps={{
                  style: {
                    zIndex: 99999,
                  },
                  placement: 'bottom-start',
                }}
                slotProps={{
                  popper: {
                    style: {
                      zIndex: 99999,
                    },
                  },
                }}
              />
            </div>
            <Divider className="w-full">or</Divider>
          </>
        ) : null}
        <InteractiveButton
          icon="mdi:plus"
          title="Create Flow"
          onClick={openCreate}
          duration={9000}
          containerClassName="h-[40]"
          enableBorder={!flows?.length}
          // className={cn(
          //   "p-2",
          //   !!flows?.length ? 'bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-700' : 'px-4'
          // )}
        />
      </Stack>
      <CreateFlowDialog
        open={open}
        handleClose={handleClose}
        redirect={false}
      />
    </>
  );
}

export default memo(FlowAutocomplete);
