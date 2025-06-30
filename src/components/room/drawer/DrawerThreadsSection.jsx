import {
  InputAdornment,
  TextField,
} from '@mui/material';
import React, { memo, useState, useCallback } from 'react';

import DrawerThreads from './DrawerThreads.jsx';
import ThreadStatus from '../thread/ThreadStatus.jsx';

const DrawerThreadsSection = () => {
  // const isViewer = useIsViewer();
  const [status, setStatus] = useState('running');
  const [threadSearchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback((event) => setSearchTerm(event.target.value.toLowerCase()), []);

  return (
    <div className="flex flex-col h-full w-full">
      <TextField
        fullWidth
        value={threadSearchTerm}
        variant="filled"
        label="Search..."
        name="thread"
        size="small"
        sx={{ px: 1 }}
        onChange={handleSearchChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <ThreadStatus
                status={status}
                setStatus={setStatus}
                minimal
              />
            </InputAdornment>
          ),
        }}
      />
      <DrawerThreads
        searchTerm={threadSearchTerm}
        status={status}
      />
    </div>
  );
};

export default memo(DrawerThreadsSection);
