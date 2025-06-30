import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

const FAQ_DATA = [
  {
    id: 1,
    question: 'Where can I view my usage?',
    answer: 'You can track your credit usage and see detailed analytics in the usage dashboard.',
    link: '/usage',
    linkText: 'View usage dashboard',
  },
  {
    id: 2,
    question: 'How can I manage billing, invoices and my subscription?',
    answer:
      'Access your billing settings to manage your subscription, view invoices, and update payment methods.',
    link: '/account/settings?tab=billing',
    linkText: 'Go to billing settings',
  },
  {
    id: 3,
    question: 'What are credits and what do they mean?',
    answer:
      'Credits are our unified billing unit that simplifies usage across different features. Each credit represents a specific amount of processing power, and different operations consume different amounts of credits based on their complexity and resource requirements.',
  },
  {
    id: 4,
    question: 'What happens when I upgrade my subscription?',
    answer:
      "When you upgrade, your remaining credits will be transferred to your new plan. Your old subscription will end immediately, and your new subscription will start right away with a fresh billing cycle. You'll only be charged for the new plan, and your billing date will reset to today.",
  },
];

export default function PricingFAQ() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Stack spacing={2} sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Frequently Asked Questions
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Everything you need to know about our credit-based pricing
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {FAQ_DATA.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              '&:before': { display: 'none' },
              boxShadow: 'none',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              '&.Mui-expanded': {
                margin: '0 0 16px 0',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<Iconify icon="eva:chevron-down-fill" />}
              sx={{
                px: 3,
                py: 2,
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0',
                },
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  );
} 