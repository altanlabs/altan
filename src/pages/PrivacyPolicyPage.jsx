import { Helmet } from 'react-helmet-async';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Stack, 
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Iconify from '../components/iconify';

// ----------------------------------------------------------------------

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
}));

// ----------------------------------------------------------------------

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Altan</title>
        <meta name="description" content="Learn how Altan collects, uses, and protects your personal information." />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack spacing={4}>
          <Box textAlign="center">
            <Typography variant="h2" gutterBottom>
              Privacy Policy
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              This Privacy Policy describes how Altan collects, uses, and protects your information 
              when you use our service.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>

          <StyledPaper>
            <Typography variant="h4" gutterBottom>
              Cookie Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We use cookies and similar tracking technologies to enhance your experience on our platform. 
              Here's what you need to know about our cookie usage:
            </Typography>

            <Stack spacing={3} sx={{ mt: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}>
                  <Typography variant="h6">Necessary Cookies</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    These cookies are essential for the website to function properly. They enable basic 
                    functions like page navigation, access to secure areas, and user authentication. 
                    The website cannot function properly without these cookies.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Examples:</strong> Session cookies, authentication tokens, security cookies
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}>
                  <Typography variant="h6">Functional Cookies</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    These cookies enable enhanced functionality and personalization. They may be set by us 
                    or by third-party providers whose services we have added to our pages.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Examples:</strong> Language preferences, theme settings, chat widgets
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}>
                  <Typography variant="h6">Analytics Cookies</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously. This helps us improve our website and services.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Examples:</strong> Google Analytics, Microsoft Clarity, PostHog
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}>
                  <Typography variant="h6">Marketing Cookies</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" paragraph>
                    These cookies are used to deliver relevant advertisements and track ad performance. 
                    They help us show you ads that are more relevant to your interests.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting pixels
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </StyledPaper>

          <StyledPaper>
            <Typography variant="h4" gutterBottom>
              Your Rights
            </Typography>
            <Typography variant="body1" paragraph>
              Under GDPR and other privacy regulations, you have several rights regarding your personal data:
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Right to Access
                </Typography>
                <Typography variant="body2">
                  You have the right to request copies of your personal data.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Right to Rectification
                </Typography>
                <Typography variant="body2">
                  You have the right to request correction of inaccurate or incomplete data.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Right to Erasure
                </Typography>
                <Typography variant="body2">
                  You have the right to request deletion of your personal data under certain conditions.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Right to Withdraw Consent
                </Typography>
                <Typography variant="body2">
                  You can withdraw your consent for cookie usage at any time through our cookie banner 
                  or by contacting us directly.
                </Typography>
              </Box>
            </Stack>
          </StyledPaper>

          <StyledPaper>
            <Typography variant="h4" gutterBottom>
              Data Retention
            </Typography>
            <Typography variant="body1" paragraph>
              We retain your personal data only for as long as necessary to provide our services and 
              comply with legal obligations. Cookie consent preferences are stored locally in your 
              browser and can be cleared at any time.
            </Typography>
          </StyledPaper>

          <StyledPaper>
            <Typography variant="h4" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about this Privacy Policy or our cookie usage, please contact us:
            </Typography>
            <Typography variant="body2">
              Email: privacy@altan.com<br />
              Address: [Your Company Address]
            </Typography>
          </StyledPaper>
        </Stack>
      </Container>
    </>
  );
}

