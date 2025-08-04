import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// components
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  padding: theme.spacing(8, 0),
}));

// ----------------------------------------------------------------------

export default function ContactSupport() {
  const supportOptions = [
    {
      icon: 'ri:discord-fill',
      title: 'Discord Community',
      description: 'Join our Discord community',
      href: 'https://discord.com/invite/2zPbKuukgx',
      iconColor: '#5865f2', // Discord brand color
    },
    {
      icon: 'ri:whatsapp-fill',
      title: 'Chat on WhatsApp',
      description: 'Get quick support via WhatsApp',
      href: 'https://chat.whatsapp.com/Jx3X3vP9A6i5pZerCq8xUl?mode=ac_t',
      iconColor: '#25d366', // WhatsApp green
    },
    {
      icon: 'mdi:book-open-page-variant',
      title: 'Docs & Guides',
      description: 'Browse our documentation and guides',
      href: 'https://docs.altan.ai',
      iconColor: '#ff9800', // Orange
    },
    {
      icon: 'mdi:calendar-clock',
      title: 'Book a Call',
      description: 'Schedule a free strategy call with our experts',
      href: 'https://calendar.app.google/WAMez8wYG6sHXQRD9',
      iconColor: '#2196f3', // Blue
    },
  ];

  return (
    <StyledRoot>
      <Container maxWidth="sm">
        <Typography
          variant="h3"
          sx={{ textAlign: 'center', mb: 2 }}
        >
          Get Support
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            mb: 6,
            color: 'text.secondary',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          Choose from multiple support channels to get the help you need
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {supportOptions.map((option, index) => (
            <Box
              key={index}
              component="a"
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                p: 2,
                textDecoration: 'none',
                border: 1,
                borderRadius: 2,
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Iconify
                  icon={option.icon}
                  width={24}
                  sx={{ color: option.iconColor }}
                />
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 0.5,
                    }}
                  >
                    {option.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary' }}
                  >
                    {option.description}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{ color: 'primary.main' }}
              >
                →
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Contact Information Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: 'medium' }}
          >
            Direct Contact
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary' }}
            >
              <strong>Email:</strong> contact@altan.ai
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary' }}
            >
              <strong>Address:</strong> 2055 Limestone Rd, Wilmington, Delaware 19808
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary' }}
            >
              <strong>Company:</strong> Altan Labs Inc.
            </Typography>
          </Box>
        </Box>
      </Container>
    </StyledRoot>
  );
}
