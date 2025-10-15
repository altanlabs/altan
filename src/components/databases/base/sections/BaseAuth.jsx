import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  TextField,
} from '@mui/material';
import { Mail, Chrome, Github, Facebook as FacebookIcon, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { setSession } from '../../../../utils/auth';
import { optimai_cloud } from '../../../../utils/axios';

// Sign-in method card component
const SignInMethodCard = ({ icon: Icon, title, description, enabled, onClick, comingSoon }) => {
  return (
    <Card
      className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={24} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {comingSoon && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'info.lighter',
                  color: 'info.darker',
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  Coming Soon
                </Typography>
              </Box>
            )}
            {!comingSoon && enabled && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'success.lighter',
                  color: 'success.darker',
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  Enabled
                </Typography>
              </Box>
            )}
            {!comingSoon && !enabled && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  color: 'grey.600',
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  Disabled
                </Typography>
              </Box>
            )}
            <IconButton size="small">
              <ChevronRight size={20} />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Settings toggle card
const SettingsToggleCard = ({ title, description, enabled, onToggle, loading }) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        py: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Switch
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        disabled={loading}
      />
    </Stack>
  );
};

function BaseAuth({ baseId, onNavigate }) {
  const [config, setConfig] = useState({
    mail: {
      host: '',
      port: '',
      user: '',
      password: '',
      admin_email: '',
    },
    google: {
      enabled: false,
      client_id: '',
      secret: '',
    },
    github: {
      enabled: false,
      client_id: '',
      secret: '',
    },
    facebook: {
      enabled: false,
      client_id: '',
      secret: '',
    },
    general: {
      disable_signup: false,
      site_url: '',
      jwt_expiry: '3600',
      auto_confirm: false,
    },
  });
  const [activeView, setActiveView] = useState('main'); // 'main', 'email', 'google'
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAuthSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch {
          // Ignore parse errors
        }
      }

      const response = await optimai_cloud.get(`/v1/instances/config/gotrue/${baseId}`);
      if (response.data) {
        setConfig(response.data);
      }
    } catch (err) {
      // Error fetching auth settings
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load authentication settings.',
      );
    } finally {
      setLoading(false);
    }
  }, [baseId]);

  // Fetch auth settings on mount
  useEffect(() => {
    fetchAuthSettings();
  }, [fetchAuthSettings]);

  const updateProviderConfig = async (provider, updatedConfig) => {
    setUpdating(true);
    try {
      // Ensure token is set
      const authData = localStorage.getItem('oaiauth');
      if (authData) {
        try {
          const { access_token: accessToken } = JSON.parse(authData);
          if (accessToken) {
            setSession(accessToken, optimai_cloud);
          }
        } catch {
          // Ignore parse errors
        }
      }

      await optimai_cloud.put(`/v1/instances/config/gotrue/${baseId}`, {
        ...config,
        [provider]: updatedConfig,
      });

      setConfig((prev) => ({
        ...prev,
        [provider]: updatedConfig,
      }));

      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success',
      });
    } catch (err) {
      // Error updating auth settings
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to update settings',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading authentication settings...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Email Configuration View
  if (activeView === 'email') {
    return (
      <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
        <Stack spacing={4}>
          {/* Header */}
          <Stack spacing={2}>
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={() => setActiveView('main')}
              sx={{ alignSelf: 'flex-start', mb: 1 }}
              variant="text"
            >
              Auth
            </Button>
            <Box>
              <Typography variant="h4" gutterBottom>
                Email Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure SMTP settings for email authentication
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* SMTP Host */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              SMTP Host
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              SMTP server hostname
            </Typography>
            <TextField
              value={config.mail?.host || ''}
              onChange={(e) => setConfig({ ...config, mail: { ...config.mail, host: e.target.value } })}
              placeholder="smtp.example.com"
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* SMTP Port */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              SMTP Port
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              SMTP server port (usually 587 for TLS or 465 for SSL)
            </Typography>
            <TextField
              value={config.mail?.port || ''}
              onChange={(e) => setConfig({ ...config, mail: { ...config.mail, port: e.target.value } })}
              placeholder="587"
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* SMTP User */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              SMTP User
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              SMTP username/email for authentication
            </Typography>
            <TextField
              value={config.mail?.user || ''}
              onChange={(e) => setConfig({ ...config, mail: { ...config.mail, user: e.target.value } })}
              placeholder="notifications@example.com"
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* SMTP Password */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              SMTP Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              SMTP password for authentication
            </Typography>
            <TextField
              type="password"
              value={config.mail?.password || ''}
              onChange={(e) => setConfig({ ...config, mail: { ...config.mail, password: e.target.value } })}
              placeholder="***"
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* Admin Email */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Admin Email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Administrator email address
            </Typography>
            <TextField
              value={config.mail?.admin_email || ''}
              onChange={(e) => setConfig({ ...config, mail: { ...config.mail, admin_email: e.target.value } })}
              placeholder="admin@example.com"
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* Save Button */}
          <Box>
            <Button
              variant="contained"
              onClick={() => updateProviderConfig('mail', config.mail)}
              disabled={updating}
              startIcon={updating ? <CircularProgress size={16} /> : null}
            >
              {updating ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </Stack>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Google Configuration View
  if (activeView === 'google') {
    return (
      <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
        <Stack spacing={4}>
          {/* Header */}
          <Stack spacing={2}>
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={() => setActiveView('main')}
              sx={{ alignSelf: 'flex-start', mb: 1 }}
              variant="text"
            >
              Auth
            </Button>
            <Box>
              <Typography variant="h4" gutterBottom>
                Google Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure Google OAuth for authentication
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Enable Google */}
          <Box>
            <SettingsToggleCard
              title="Enable Google Sign-in"
              description="Allow users to sign in with their Google account"
              enabled={config.google?.enabled || false}
              onToggle={(value) => setConfig({ ...config, google: { ...config.google, enabled: value } })}
              loading={updating}
            />
          </Box>

          <Divider />

          {/* Google Client ID */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Google Client ID
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              OAuth 2.0 Client ID from Google Cloud Console
            </Typography>
            <TextField
              value={config.google?.client_id || ''}
              onChange={(e) => setConfig({ ...config, google: { ...config.google, client_id: e.target.value } })}
              placeholder="123456789-abc.apps.googleusercontent.com"
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* Google Client Secret */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Google Client Secret
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              OAuth 2.0 Client Secret from Google Cloud Console
            </Typography>
            <TextField
              type="password"
              value={config.google?.secret || ''}
              onChange={(e) => setConfig({ ...config, google: { ...config.google, secret: e.target.value } })}
              placeholder="***"
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* Callback URL Info */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Callback URL
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use this callback URL in your Google Cloud Console OAuth configuration
            </Typography>
            <TextField
              value={`${config.general?.site_url || ''}/auth/v1/callback`}
              size="small"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>

          <Divider />

          {/* Save Button */}
          <Box>
            <Button
              variant="contained"
              onClick={() => updateProviderConfig('google', config.google)}
              disabled={updating}
              startIcon={updating ? <CircularProgress size={16} /> : null}
            >
              {updating ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </Stack>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Main Auth View
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={4}>
        {/* Header */}
        <Stack spacing={2}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => onNavigate?.('users')}
            sx={{ alignSelf: 'flex-start', mb: 1 }}
            variant="text"
          >
            Users
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Auth
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure how users sign in to your app
              </Typography>
            </Box>
            <IconButton onClick={fetchAuthSettings} disabled={loading}>
              <RefreshCw size={20} />
            </IconButton>
          </Box>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            Network Error
          </Alert>
        )}

        {/* Sign in methods */}
        <Box>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Sign in methods
          </Typography>
          <Stack spacing={2}>
            <SignInMethodCard
              icon={Mail}
              title="Email"
              description="Allow users to sign in with their email address"
              enabled={true}
              onClick={() => setActiveView('email')}
            />
            <SignInMethodCard
              icon={Chrome}
              title="Google"
              description="Allow users to sign in with their Google account"
              enabled={config.google?.enabled || false}
              onClick={() => setActiveView('google')}
            />
            <SignInMethodCard
              icon={Github}
              title="GitHub"
              description="Allow users to sign in with their GitHub account"
              enabled={config.github?.enabled || false}
              onClick={() => setSnackbar({ open: true, message: 'Configuration coming soon', severity: 'info' })}
              comingSoon
            />
            <SignInMethodCard
              icon={FacebookIcon}
              title="Facebook"
              description="Allow users to sign in with their Facebook account"
              enabled={config.facebook?.enabled || false}
              onClick={() => setSnackbar({ open: true, message: 'Configuration coming soon', severity: 'info' })}
              comingSoon
            />
          </Stack>
        </Box>

        <Divider />

        {/* Disable Sign-up */}
        <Box>
          <SettingsToggleCard
            title="Disable Sign-up"
            description="Prevent new users from signing up"
            enabled={config.general?.disable_signup || false}
            onToggle={(value) => updateProviderConfig('general', { ...config.general, disable_signup: value })}
            loading={updating}
          />
        </Box>

        <Divider />

        {/* Enable Anonymous Users */}
        <Box>
          <SettingsToggleCard
            title="Enable Anonymous Users"
            description="Allow anonymous users to sign in"
            enabled={false}
            onToggle={() => setSnackbar({ open: true, message: 'Feature not available', severity: 'info' })}
            loading={false}
          />
        </Box>
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default BaseAuth;
