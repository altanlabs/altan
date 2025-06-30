import { Box, useTheme, Stack } from '@mui/material';
import React, { useState } from 'react';

import { CustomAvatar } from '../avatars';

const RoomAvatar = ({ room, isSelected, onSelect }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" sx={{ p: 0, m: 0 }}>

      {isSelected &&
      (<Box
        sx={{
          width: 3,
          height: 46,
          mt: 2,
          mr: .5,
          bgcolor: 'grey',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

        }}
      />)}

      <Box
        key={room.id}
        sx={{ mt: 1,
          background: isSelected ? theme.palette.background.neutral : theme.palette.background.default,
          px: 1, py: .1, borderRadius: '1rem' }}
      >
        <CustomAvatar
          sx={{
            borderRadius: '8px',
            margin: '10px 0',
            transition: 'filter 0.3s',
            cursor: 'pointer',
            transform: isSelected ? 'scale(1.125)' : 'scale(1)',
          }}
          src={room.iconSrc}
          onClick={() => onSelect(room)}
          name={room?.name || 'Room'}
        />
      </Box>

    </Stack>
  );
};

// RoomsList Component
const RoomsList = ({ rooms }) => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const handleRoomSelect = (room) => {
    setSelectedRoomId(room.id);
  };

  return (
    <Box sx={{ mt: '65px' }}>
      {rooms.map((room) => (
          <RoomAvatar
            key={room.id}
            room={room}
            isSelected={room.id === selectedRoomId}
            onSelect={handleRoomSelect}
          />
      ))}
      {/* <ChatsCollection/> */}
    </Box>
  );
};

export default RoomsList;
