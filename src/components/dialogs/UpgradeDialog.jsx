import {
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import CustomDialog from './CustomDialog';
import { selectAccountId } from '../../redux/slices/general';
import { openUrl } from '../../utils/auth';
import { optimai_shop } from '../../utils/axios';
import Iconify from '../iconify';

const PRO_FEATURES = [
  { text: '25€ in credits included', icon: 'material-symbols:account-balance-wallet' },
  { text: 'Autopilot mode', icon: 'material-symbols:smart-toy' },
  { text: 'Private projects', icon: 'material-symbols:lock' },
  { text: 'Custom domains', icon: 'material-symbols:domain' },
  { text: 'Voice AI Agents', icon: 'material-symbols:mic' },
  { text: 'Workflow Builder', icon: 'material-symbols:account-tree' },
  { text: 'Community support', icon: 'material-symbols:support-agent' },
  { text: 'Remove Altan branding', icon: 'material-symbols:branding-watermark-off' },
];

const UpgradeDialog = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const accountId = useSelector(selectAccountId);
  const history = useHistory();

  const handleUpgrade = async () => {
    // Check if user is authenticated
    if (!accountId) {
      // Redirect to register page if not authenticated
      history.push('/auth/register');
      return;
    }

    setLoading(true);
    try {
      const response = await optimai_shop.get('/stripe/subscribe', {
        params: {
          account_id: accountId,
          billing_option_id: 'f35d12c6-51fb-11f0-b1b6-42010a400017',
        },
        paramsSerializer: (params) => {
          return Object.entries(params)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map((v) => `${key}=${v}`).join('&');
              }
              return `${key}=${value}`;
            })
            .join('&');
        },
      });

      // Open URL using platform-aware utility
      await openUrl(response.data.url);
      onClose();
    } catch (error) {
      console.error('Error initiating checkout:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      maxWidth="sm"
    >
      <Box sx={{ p: 5 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Unlock Pro for 5€
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Get 25€ in credits + full access to all Pro features
          </Typography>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            What's included:
          </Typography>

          <List sx={{ p: 0 }}>
            {PRO_FEATURES.map((feature, index) => (
              <ListItem
                key={index}
                sx={{ px: 0, py: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Iconify
                    icon={feature.icon}
                    sx={{
                      color: 'text.secondary',
                      fontSize: 20,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={feature.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.95rem',
                      color: 'text.primary',
                      fontWeight: 400,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleUpgrade}
            disabled={loading}
            size="large"
            startIcon={
              loading ? (
                <Iconify icon="eos-icons:loading" />
              ) : (
                <Iconify icon="material-symbols:crown" />
              )
            }
            sx={{
              minWidth: 180,
              bgcolor: 'text.primary',
              color: 'background.paper',
              '&:hover': {
                bgcolor: 'text.secondary',
              },
              '&:disabled': {
                bgcolor: 'grey.400',
              },
            }}
          >
            {loading ? 'Processing...' : 'Become a Pro'}
          </Button>
        </Box>

        {/* Trust indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify
              icon="material-symbols:cancel"
              sx={{ color: 'text.secondary', fontSize: 14 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Cancel anytime
            </Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            •
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify
              icon="material-symbols:refresh"
              sx={{ color: 'text.secondary', fontSize: 14 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
            >
              30-day guarantee
            </Typography>
          </Box>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default UpgradeDialog;
