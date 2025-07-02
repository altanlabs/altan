import { Box, Container, Typography, Stack, Divider, Chip } from '@mui/material';

// sections
import { CompactLayout } from '../layouts/dashboard';
import { NewPricing, PricingFAQ } from '../sections/pricing';

// ----------------------------------------------------------------------

export default function PricingPage() {
  return (
    <CompactLayout title="Pricing · Altan">
      <Container
        maxWidth="lg"
        sx={{ pt: 4, pb: 5 }}
      >
        <Stack
          spacing={2}
          sx={{ mb: 5, textAlign: 'center' }}
        >
          <Typography
            variant="h2"
            sx={{ mb: 2 }}
          >
            Pricing
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'text.secondary', fontWeight: 400 }}
          >
            Access pro features and get monthly credits to spend across AI agents, database and tasks.
          </Typography>
          {/* Early Bird Discount Banner */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Chip
              label="🎉 Early Bird 20% Lifetime Discount on All Plans"
              color="primary"
              variant="filled"
              sx={{
                py: 2,
                px: 3,
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 2,
              }}
            />
          </Box>
        </Stack>

        <NewPricing />

        <Divider sx={{ my: 10 }} />

        <PricingFAQ />

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', mb: 2 }}
          >
            All plans include our wallet system for transparent usage tracking
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            Auto-recharge available • 24h grace period • Soft-stop protection
          </Typography>
        </Box>
      </Container>
    </CompactLayout>
  );
}
