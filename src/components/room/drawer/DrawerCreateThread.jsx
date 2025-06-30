import { Stack, TextField, useTheme } from '@mui/material';
import { debounce } from 'lodash';
import { memo, useCallback, useRef, useState } from 'react';

import { selectNewThreadPlaceholder, selectThreadDrawerDetails, setThreadDrawer } from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.js';
import Thread from '../thread/Thread.jsx';

const debouncedDispatch = debounce((value) => {
  dispatch(setThreadDrawer({ threadName: value }));
}, 500);

const DrawerCreateThread = () => {
  const containerRef = useRef(null);
  const theme = useTheme();
  const drawer = useSelector(selectThreadDrawerDetails);
  const newThreadPlaceholder = useSelector(selectNewThreadPlaceholder);
  const [threadName, setThreadName] = useState('');

  const handleChangeThreadName = useCallback((e) => {
    const value = e.target.value;
    setThreadName(value);
    debouncedDispatch(value);
  }, []);

  return (
    <div
      ref={containerRef} 
      className="h-full w-full flex flex-col"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {
        !!drawer.isCreation && (
          <Stack
            padding={2}
            alignItems="start"
            sx={{
              position: 'relative',
              top: 0,
              right: 0,
              left: 0,
              zIndex: 99999,
              flex: '0 0 auto',
            }}
          >
            <span
              className="text-sm leading-relaxed"
            >
              THREAD NAME {drawer.messageId ? '(OPTIONAL)' : ''}
            </span>
            <TextField
              size="small"
              fullWidth
              placeholder={newThreadPlaceholder}
              sx={{
                backgroundColor: theme.palette.background.default,
                borderRadius: 1,
                maxWidth: 300,
              }}
              value={threadName}
              onChange={handleChangeThreadName}
            />
          </Stack>
        )
      }
      <div
        className="flex-grow flex flex-col overflow-auto"
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '200px',
          height: 'calc(100% - 100px)',
        }}
      >
        <Thread
          mode="drawer"
          key="thread-drawer"
          containerRef={containerRef}
        />
      </div>
    </div>
  );
};

export default memo(DrawerCreateThread);
