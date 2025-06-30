import { Stack, Typography, IconButton } from '@mui/material';

import Iconify from '../../../../../components/iconify/Iconify';

const Header = ({ altaner, onClose }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 1 }}
    >
      <Stack>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600 }}
        >
          Template Settings
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
        >
          {altaner?.id && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: 'monospace' }}
              >
                App Id: {altaner.id.slice(0, 5)}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(altaner.id);
                }}
              >
                <Iconify
                  icon="mdi:content-copy"
                  width={12}
                />
              </IconButton>
            </>
          )}
        </Stack>
      </Stack>

      <IconButton
        onClick={onClose}
        sx={{
          '&:hover': {
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
          },
        }}
      >
        <Iconify icon="mdi:close" />
      </IconButton>
    </Stack>
  );
};

export default Header;
