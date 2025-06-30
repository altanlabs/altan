import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';

import Iconify from '../../../components/iconify';

const RevenueMetricsDialog = ({ open, onClose, arr, isVerified }) => {
  const theme = useTheme();

  if (!arr) return null;

  const formattedArr = (arr / 100000000).toFixed(2);
  const formattedMrr = (arr / 100000 / 12).toFixed(2);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>Revenue Metrics</DialogTitle>
      <DialogContent>
        <Stack
          spacing={3}
          sx={{ pt: 1 }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{ color: '#54d62c', mb: 1 }}
            >
              ${formattedArr}M
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
            >
              Annual Recurring Revenue
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="h3"
              sx={{ color: '#54d62c', mb: 1 }}
            >
              ${formattedMrr}k
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
            >
              Monthly Recurring Revenue
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor:
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Iconify
                icon={isVerified ? 'mdi:check-circle' : 'mdi:information-outline'}
                sx={{
                  color: isVerified ? '#54d62c' : theme.palette.warning.main,
                  width: 20,
                  height: 20,
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {isVerified
                  ? 'Revenue verified by Altan'
                  : 'Revenue reported by owner (not verified)'}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RevenueMetricsDialog;
