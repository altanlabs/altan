import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography, Button, Card, Stack } from '@mui/material';
import { useState } from 'react';

import PayAsYouGoDialog from './PayAsYouGoDialog';

// Compact display for pay-as-you-go auto-recharge settings

export default function PayAsYouGoOptions({ compact = false }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock data - in real app, this would come from props or API
  const [settings, setSettings] = useState({
    enabled: true,
    threshold: 5,
    rechargeAmount: 50,
    monthlyLimit: null,
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    setDialogOpen(false);
  };

  const content = (
    <Box sx={{ p: compact ? 2 : 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon
            sx={{
              color: settings.enabled ? 'success.main' : 'text.disabled',
              mr: 2,
              fontSize: 24,
            }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              {settings.enabled ? 'Pay as you go is on' : 'Pay as you go is off'}
            </Typography>
            {settings.enabled && (
              <Typography
                variant="body2"
                sx={{ color: 'success.main', mt: 0.5 }}
              >
                When your credit balance reaches €{settings.threshold}, your payment method will be
                charged to bring the balance up to €{settings.rechargeAmount}.
              </Typography>
            )}
            {!settings.enabled && (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.5 }}
              >
                Set up automatic credit top-ups when your balance gets low.
              </Typography>
            )}
          </Box>
        </Box>

        <Button
          variant="outlined"
          onClick={handleOpenDialog}
          sx={{
            minWidth: 100,
            fontWeight: 500,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
            },
          }}
        >
          Modify
        </Button>
      </Stack>

      <PayAsYouGoDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />
    </Box>
  );

  if (compact) {
    return content;
  }

  return <Card>{content}</Card>;
}
