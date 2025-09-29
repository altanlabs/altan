import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
} from '@mui/material';
import Iconify from '../iconify';
import useCookieConsent from '../../hooks/useCookieConsent';

// ----------------------------------------------------------------------

export default function CookieSettings({ open, onClose }) {
  const { preferences, updatePreferences } = useCookieConsent();
  
  const [localPreferences, setLocalPreferences] = useState({
    necessary: true,
    functional: preferences?.functional || false,
    analytics: preferences?.analytics || false,
    marketing: preferences?.marketing || false,
  });

  const cookieTypes = [
    {
      key: 'necessary',
      name: 'Necessary Cookies',
      description: 'Essential for the website to function properly. These cannot be disabled.',
      disabled: true,
    },
    {
      key: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization.',
      disabled: false,
    },
    {
      key: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      disabled: false,
    },
    {
      key: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements and track ad performance.',
      disabled: false,
    },
  ];

  const handleToggle = (key) => {
    if (key === 'necessary') return;
    
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setLocalPreferences(allAccepted);
    updatePreferences(allAccepted);
    onClose();
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setLocalPreferences(onlyNecessary);
    updatePreferences(onlyNecessary);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:shield-check-bold" width={24} />
            <Typography variant="h6">Cookie Preferences</Typography>
          </Stack>
          
          <IconButton onClick={onClose} size="small">
            <Iconify icon="solar:close-circle-linear" width={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          We use cookies to enhance your browsing experience, serve personalized content, 
          and analyze our traffic. You can customize your preferences below.
        </Typography>

        <Stack spacing={3}>
          {cookieTypes.map((type, index) => (
            <Box key={type.key}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {type.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type.description}
                  </Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPreferences[type.key]}
                      onChange={() => handleToggle(type.key)}
                      disabled={type.disabled}
                      size="small"
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Stack>
              
              {index < cookieTypes.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Button 
            variant="outlined" 
            onClick={handleRejectAll}
            size="small"
          >
            Reject All
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleAcceptAll}
            size="small"
          >
            Accept All
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleSave}
            size="small"
            sx={{ ml: 'auto' }}
          >
            Save Preferences
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

