import { LoadingButton } from '@mui/lab';
import { Card, Stack, Typography } from '@mui/material';

import Iconify from '../../../../../../components/iconify/Iconify';

const TEXTS = [
  'Ready to take it to the next level?',
  "You've crafted something remarkable! Now, it's time to share and monetize your creation.",
];

const DistributionSetup = ({ onCreateTemplate, isSubmitting }) => (
  <Card
    sx={{
      p: 2,
      borderRadius: 1,
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
      border: '1px solid',
      borderColor: (theme) => (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'),
    }}
  >
    <Stack
      alignItems="center"
      spacing={2}
      sx={{ py: 5 }}
    >
      <Typography
        variant="h6"
        align="center"
      >
        {TEXTS[0]}
      </Typography>
      <Typography
        sx={{ maxWidth: 400 }}
        align="center"
        color="text.secondary"
      >
        {TEXTS[1]}
      </Typography>
      <LoadingButton
        variant="contained"
        color="primary"
        startIcon={<Iconify icon="mdi:template-plus" />}
        onClick={onCreateTemplate}
        loading={isSubmitting}
      >
        Start Distribution
      </LoadingButton>
    </Stack>
  </Card>
);

export default DistributionSetup;
