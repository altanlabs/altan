import { Box, Container, Typography, Stack, Divider, Chip } from '@mui/material';
import { useSelector } from 'react-redux';

import { CompactLayout } from '../layouts/dashboard';
import Footer from '../layouts/main/Footer';
import { selectIsAccountFree } from '../redux/slices/general';
import { NewPricing, PricingFAQ } from '../sections/pricing';
import SubscribedPricing from '../sections/pricing/SubscribedPricing';

// ----------------------------------------------------------------------

export default function PricingPage() {
  const isAccountFree = useSelector(selectIsAccountFree);

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
            {isAccountFree ? 'Pricing' : 'Manage Your Plan'}
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'text.secondary', fontWeight: 400 }}
          >
            {isAccountFree
              ? 'Access pro features and get monthly credits to spend across AI agents, database and tasks.'
              : 'Upgrade your plan or purchase additional credits for your AI agents and workflows.'}
          </Typography>
        </Stack>

        {/* Conditionally render based on account type */}
        {isAccountFree ? <NewPricing /> : <SubscribedPricing />}

        <Divider sx={{ my: 10 }} />

        <PricingFAQ />

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            Auto-recharge available • Cancel anytime • Soft-stop protection
          </Typography>
        </Box>
      </Container>
      <Footer />
    </CompactLayout>
  );
}
