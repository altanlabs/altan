import { Box } from '@mui/material';
import { memo, useCallback } from 'react';

import useLongPress from '../../../hooks/useLongPress.jsx';
import useResponsive from '../../../hooks/useResponsive';
import { createMessageContextMenu, selectThreadDrawerDetails } from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store.js';

const MessageContainer = ({
  message,
  threadId,
  disableEndButtons,
  children,
}) => {
  const onContextMenu = useCallback((e) => {
    e.preventDefault();
    dispatch(createMessageContextMenu({ anchorEl: e.currentTarget, message, threadId, position: { top: e.pageY, left: e.pageX } }));
  }, [message, threadId]);

  const longPressParams = useLongPress(onContextMenu, { ms: 400 });
  const drawer = useSelector(selectThreadDrawerDetails);
  const isMessagePotentialParent = message.id === drawer.messageId;
  const isSmallScreen = useResponsive('down', 'sm');

  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        alignItems: 'start',
        width: '100%',
        padding: 0,
        ...!!message?.error && {
          border: '2px solid #ba2c2c',
        },
        transition: 'backdrop-filter 100ms ease, background-color 100ms ease',
        // ...(!isSmallScreen && {
        //   '&:hover': {
        //     ...bgBlur({ opacity: 0.05, color: theme.palette.mode === 'dark' ? '#fff' : '#222' }),
        //   },
        // }),
        ...!!message?.replied && {
          marginTop: 1,
        },
        ...(isMessagePotentialParent && !disableEndButtons) && {
          marginTop: 5,
          marginBottom: 5,
        },
        ...(!isSmallScreen && {
          '&:hover .hidden-child': {
            visibility: 'visible',
          },
        }),
        ...(!!isSmallScreen && {
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
        }),
      }}
      onContextMenu={onContextMenu}
      {...longPressParams}
    >
      {children}
    </Box>
  );
};

export default memo(MessageContainer);
