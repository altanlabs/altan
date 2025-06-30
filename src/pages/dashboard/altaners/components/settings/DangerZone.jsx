import { Box, Card, Typography, Button } from '@mui/material';

import Iconify from '../../../../../components/iconify/Iconify';

const DangerZone = ({ altaner, onClickDelete }) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 600, fontSize: '0.875rem', color: 'error.main' }}
      >
        Danger Zone
      </Typography>

      <Card
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'error.900' : 'error.lighter'),
          border: '1px solid',
          borderColor: 'error.light',
        }}
      >
        <Button
          variant="soft"
          color="error"
          startIcon={<Iconify icon="mdi:trash" />}
          fullWidth
          onClick={onClickDelete}
        >
          {altaner?.cloned_template_id ? 'Uninstall App' : 'Delete App'}
        </Button>
      </Card>
    </Box>
  );
};

export default DangerZone;
