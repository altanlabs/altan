import { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import CookieSettings from './CookieSettings';

// ----------------------------------------------------------------------

const StyledModal = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#2a2a2a',
  borderRadius: '16px',
  padding: '24px',
  maxWidth: '300px',
  width: '300px',
  zIndex: theme.zIndex.modal + 1,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100vw - 40px)',
    maxWidth: 'calc(100vw - 40px)',
    right: '20px',
  },
}));

// ----------------------------------------------------------------------

const COOKIE_CONSENT_KEY = 'altan-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'altan-cookie-preferences';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setIsVisible(false);
    
    // Trigger analytics and other cookie-dependent services
    window.dispatchEvent(new CustomEvent('cookieConsentGranted', { 
      detail: preferences 
    }));
  };

  const handleAcceptNecessary = () => {
    const preferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, 'necessary-only');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setIsVisible(false);
    
    window.dispatchEvent(new CustomEvent('cookieConsentGranted', { 
      detail: preferences 
    }));
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  if (!isVisible) return null;

  return (
    <>
      <StyledModal>
        <Stack spacing={2}>
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              color: 'white',
              fontWeight: 600,
              fontSize: '18px'
            }}
          >
            Choose your cookies
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#b0b0b0',
              lineHeight: 1.4,
              fontSize: '14px'
            }}
          >
            We use cookies to enhance your development experience and keep your data secure.{' '}
            <Link 
              href="/privacy" 
              sx={{ 
                color: '#b0b0b0',
                textDecoration: 'underline',
                '&:hover': {
                  color: 'white'
                }
              }}
            >
              Cookie Settings
            </Link>
          </Typography>

          <Stack spacing={1.5}>
            <Button
              variant="contained"
              size="small"
              onClick={handleAcceptAll}
              fullWidth
              sx={{
                backgroundColor: 'white',
                color: 'black',
                fontWeight: 600,
                borderRadius: '50px',
                py: 1,
                fontSize: '14px',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
              }}
            >
              Accept All
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleAcceptNecessary}
              fullWidth
              sx={{
                borderColor: '#666',
                color: '#b0b0b0',
                fontWeight: 600,
                borderRadius: '50px',
                py: 1,
                fontSize: '14px',
                '&:hover': {
                  borderColor: '#888',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Reject Non-Essential Cookies
            </Button>
          </Stack>
        </Stack>
      </StyledModal>

      <CookieSettings 
        open={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}
