import { Box, useTheme } from '@mui/material';

import { bgBlur } from '@utils/styleUtils';

export function PinnedMessage({
  right = 0,
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 50,
        background: 'red',
        left: 0,
        display: 'flex',
        zIndex: 99,
        justifyContent: 'flex-start',
        padding: '5px 15px',
        gap: '2px',
        alignItems: 'center',
        width: '-webkit-fill-available',
        mr: `${right}px`,
        height: '61px',
        flexGrow: -1,
        transition: 'backdrop-filter 100ms ease, background-color 100ms ease',
        ...bgBlur({ color: theme.palette.background.default, opacity: 0, blur: 2 }),
        '&:hover': {
          ...bgBlur({ color: theme.palette.background.default, opacity: 0.6, blur: 4 }),
        },
      }}
    >

      PINNED MESSAGE
    </Box>
  );
}
