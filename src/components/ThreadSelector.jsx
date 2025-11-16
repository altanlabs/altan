import {
  Stack,
  Typography,
  TextField,
  Autocomplete,
} from '@mui/material';
import { useState, useEffect } from 'react';

import { CustomAvatar } from './custom-avatar';
import { useSelector } from '../redux/store.ts';

export default function ThreadSelector({ value, onChange }) {
  console.log('value', value);
  const rooms = useSelector((state) => state.general.account.rooms);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
    if (value && rooms.length > 0) {
      const foundRoom = rooms.find((room) =>
        room.threads.items.some((thread) => thread.id === value),
      );
      const foundThread = foundRoom
        ? foundRoom.threads.items.find((thread) => thread.id === value)
        : null;
      setSelectedRoom(foundRoom);
      setThreads(foundRoom ? foundRoom.threads.items : []);
      setSelectedThread(foundThread);
    }
  }, [value, rooms]);

  const handleRoomChange = (_, room) => {
    setSelectedRoom(room);
    setThreads(room ? room.threads.items : []);
    setSelectedThread(null);
  };

  const handleThreadChange = (_, newThread) => {
    setSelectedThread(newThread);
    if (newThread) {
      onChange(newThread.id);
      console.log('VALUE', value);
    } else {
      onChange(null);
    }
  };

  console.log('selected', selectedThread);
  return (
    <Stack
      spacing={1}
      sx={{ width: '100%' }}
    >
      <Autocomplete
        size="small"
        id="room-autocomplete"
        options={rooms}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select a Room"
            variant="outlined"
          />
        )}
        value={selectedRoom}
        onChange={handleRoomChange}
        renderOption={(props, option) => (
          <li
            {...props}
            key={option.id}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <CustomAvatar
                name={option.name}
                src={option.avatar_url}
                sx={{ width: 24, height: 24 }}
              />
              <Typography color={'text.primary'}>{option.name}</Typography>
            </Stack>
          </li>
        )}
      />
      {selectedRoom && (
        <Autocomplete
          size="small"
          id="thread-autocomplete"
          options={threads}
          getOptionLabel={(option) => (option.is_main ? 'Main Thread' : option.name)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select a Thread"
              variant="outlined"
            />
          )}
          value={selectedThread}
          onChange={handleThreadChange}
          renderOption={(props, option) => (
            <li
              {...props}
              key={option.id}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                {option.is_main ? (
                  <Typography color={'text.secondary'}>Main Thread</Typography>
                ) : (
                  <>
                    <Typography color={'text.primary'}>{option.name}</Typography>
                    <Typography color={'text.secondary'}>
                      {new Date(option.date_creation).toLocaleDateString()}
                    </Typography>
                  </>
                )}
              </Stack>
            </li>
          )}
        />
      )}
    </Stack>
  );
}
