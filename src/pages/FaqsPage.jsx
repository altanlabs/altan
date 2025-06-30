import { Box, Container, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';

// @mui
// sections
import { FaqsHero, FaqsList, FaqsForm } from '../sections/faqs';

// ----------------------------------------------------------------------

export default function FaqsPage() {
  return (
    <>
      <Helmet>
        <title> Faqs · Altan</title>
      </Helmet>

      <FaqsHero />

      <Container sx={{ pt: 15, pb: 10, position: 'relative' }}>
        {/* <FaqsCategory /> */}

        <Typography
          variant="h3"
          sx={{ mb: 5, ml: 2 }}
        >
          Frequently asked questions
        </Typography>

        <Box
          gap={10}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          }}
        >
          <FaqsList />

          <FaqsForm />
        </Box>
      </Container>
    </>
  );
}
