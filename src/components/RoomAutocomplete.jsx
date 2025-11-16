import { Stack, TextField, Autocomplete, Divider, Tooltip } from '@mui/material';
import { memo, useCallback } from 'react';

import { useSelector } from '../redux/store.ts';
import { CardTitle } from './aceternity/cards/card-hover-effect';
import { selectAccountRooms } from '../redux/slices/general/index.ts';

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
        <CardTitle>{option.name}</CardTitle>
      </Stack>
    </Tooltip>
  </li>
);

function RoomAutocomplete({ onChange, value, multiple = false }) {
  const rooms = useSelector(selectAccountRooms);

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

  const selectedValue = multiple
    ? rooms?.filter((room) => value?.includes(room.id))
    : rooms?.find((room) => room.id === value) || null;

  return (
    <>
      <Stack
        spacing={0.5}
        width="100%"
        alignItems="center"
      >
        {rooms && rooms.length > 0 ? (
          <>
            <Autocomplete
              fullWidth
              multiple={multiple}
              size="small"
              id="room-autocomplete"
              options={rooms}
              isOptionEqualToValue={(option, value) =>
                option.id === (typeof value === 'string' ? value : value.id)}
              getOptionLabel={(option) => option.name}
              renderOption={renderOption}
              getOptionKey={(option) => option.id}
              renderInput={({ key, ...params }) => (
                <TextField
                  key={key}
                  {...params}
                  placeholder={multiple ? 'Select Rooms' : 'Select a Room'}
                  variant="filled"
                  hiddenLabel
                />
              )}
              value={selectedValue}
              onChange={handleChange}
            />
            <Divider className="w-full">or</Divider>
          </>
        ) : null}
      </Stack>
    </>
  );
}

export default memo(RoomAutocomplete);
