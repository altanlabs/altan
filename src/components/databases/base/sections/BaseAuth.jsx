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
  InputAdornment,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Mail, Chrome, ChevronRight, ArrowLeft, Copy } from 'lucide-react';
import { optimai_database } from '../../../../utils/axios';

// Sign-in method card component
const SignInMethodCard = ({ icon: Icon, title, description, enabled, onClick }) => {
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
            {enabled && (
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
            {!enabled && (
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
  const [settings, setSettings] = useState({
    // Email settings
    email_enabled: true,
    auto_confirm_email: false,
    secure_email_change: true,
    require_reauth_password_change: false,
    password_hibp_check: false,
    min_password_length: 6,
    password_required_characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    email_otp_expiration: 3600,
    email_otp_length: 6,
    // Google settings
    google_enabled: false,
    google_client_id: '',
    google_client_secret: '',
    google_skip_nonce_check: false,
    // General settings
    disable_signup: false,
    anonymous_users: false,
  });
  const [activeView, setActiveView] = useState('main'); // 'main', 'email', 'google'
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch auth settings on mount
  useEffect(() => {
    fetchAuthSettings();
  }, [baseId]);

  const fetchAuthSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await optimai_database.get(`/admin/gotrue/${baseId}/settings`);
      if (response.data) {
        setSettings((prev) => ({
          ...prev,
          ...response.data,
        }));
      }
    } catch (err) {
      console.error('Error fetching auth settings:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load authentication settings. Using defaults.'
      );
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value, batchSettings = null) => {
    setUpdating(true);
    try {
      const updatedSettings = batchSettings || { ...settings, [key]: value };
      await optimai_database.put(`/admin/gotrue/${baseId}/settings`, updatedSettings);
      
      setSettings(updatedSettings);
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating auth settings:', err);
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

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Copied to clipboard',
      severity: 'success',
    });
  };

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    await updateSetting(null, null, settings);
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

  // Email Settings View
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
                Email Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure email signup settings for your app
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert severity="warning" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Enable Email Sign-in */}
          <Box>
            <SettingsToggleCard
              title="Enable Email Sign-in"
              description="Allow users to sign in with their email address"
              enabled={settings.email_enabled}
              onToggle={(value) => updateSetting('email_enabled', value)}
              loading={updating}
            />
          </Box>

          <Divider />

          {/* Auto-confirm Email */}
          <Box>
            <SettingsToggleCard
              title="Auto-confirm Email"
              description="Automatically confirm user emails without requiring verification"
              enabled={settings.auto_confirm_email}
              onToggle={(value) => updateSetting('auto_confirm_email', value)}
              loading={updating}
            />
          </Box>

          <Divider />

          {/* Secure Email Change */}
          <Box>
            <SettingsToggleCard
              title="Secure Email Change"
              description="Require confirmation on both old and new email addresses when changing email"
              enabled={settings.secure_email_change}
              onToggle={(value) => updateSetting('secure_email_change', value)}
              loading={updating}
            />
          </Box>

          <Divider />

          {/* Require Re-authentication for Password Changes */}
          <Box>
            <SettingsToggleCard
              title="Require Re-authentication for Password Changes"
              description="Require recent login to change password"
              enabled={settings.require_reauth_password_change}
              onToggle={(value) => updateSetting('require_reauth_password_change', value)}
              loading={updating}
            />
          </Box>

          <Divider />

          {/* Password HIBP Check */}
          <Box>
            <SettingsToggleCard
              title="Password HIBP Check"
              description="Reject known or easy to guess passwords using Have I Been Pwned database"
              enabled={settings.password_hibp_check}
              onToggle={(value) => updateSetting('password_hibp_check', value)}
              loading={updating}
            />
          </Box>

          <Divider />

          {/* Minimum Password Length */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Minimum Password Length
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Minimum password length (minimum 6, recommended 8+)
            </Typography>
            <TextField
              type="number"
              value={settings.min_password_length}
              onChange={(e) => handleInputChange('min_password_length', parseInt(e.target.value, 10))}
              onBlur={handleSaveSettings}
              size="small"
              fullWidth
              inputProps={{ min: 6 }}
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* Required Password Characters */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Required Password Characters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Define required character sets for passwords (e.g., 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz,0123456789')
            </Typography>
            <TextField
              value={settings.password_required_characters}
              onChange={(e) => handleInputChange('password_required_characters', e.target.value)}
              onBlur={handleSaveSettings}
              size="small"
              fullWidth
              multiline
              rows={2}
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* Email OTP Expiration */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Email OTP Expiration (seconds)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Duration before email OTP/link expires in seconds
            </Typography>
            <TextField
              type="number"
              value={settings.email_otp_expiration}
              onChange={(e) => handleInputChange('email_otp_expiration', parseInt(e.target.value, 10))}
              onBlur={handleSaveSettings}
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* Email OTP Length */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Email OTP Length
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Number of digits in email OTP
            </Typography>
            <TextField
              type="number"
              value={settings.email_otp_length}
              onChange={(e) => handleInputChange('email_otp_length', parseInt(e.target.value, 10))}
              onBlur={handleSaveSettings}
              size="small"
              fullWidth
              inputProps={{ min: 4, max: 10 }}
              disabled={updating}
            />
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

  // Google Settings View
  if (activeView === 'google') {
    const callbackUrl = `https://database.altan.ai/auth/v1/callback`;
    
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
                Google Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure Google signup settings for your app
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert severity="warning" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Enable Google Sign-in */}
          <Box>
            <SettingsToggleCard
              title="Enable Google Sign-in"
              description="Allow users to sign in with their Google account"
              enabled={settings.google_enabled}
              onToggle={(value) => updateSetting('google_enabled', value)}
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
              Google OAuth Client ID from Google Cloud Console
            </Typography>
            <TextField
              value={settings.google_client_id}
              onChange={(e) => handleInputChange('google_client_id', e.target.value)}
              onBlur={handleSaveSettings}
              placeholder="your-google-client-id.apps.googleusercontent.com"
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
              Google OAuth Client Secret from Google Cloud Console
            </Typography>
            <TextField
              type="password"
              value={settings.google_client_secret}
              onChange={(e) => handleInputChange('google_client_secret', e.target.value)}
              onBlur={handleSaveSettings}
              placeholder="your-google-client-secret"
              size="small"
              fullWidth
              disabled={updating}
            />
          </Box>

          <Divider />

          {/* Skip Nonce Check */}
          <Box>
            <SettingsToggleCard
              title="Skip Nonce Check"
              description="Allow ID tokens with any nonce to be accepted (not recommended for production)"
              enabled={settings.google_skip_nonce_check}
              onToggle={(value) => updateSetting('google_skip_nonce_check', value)}
              loading={updating}
            />
          </Box>

          <Divider />

          {/* Callback URL */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Callback URL (for OAuth)
            </Typography>
            <TextField
              value={callbackUrl}
              size="small"
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleCopyToClipboard(callbackUrl)}
                      edge="end"
                      size="small"
                    >
                      <Copy size={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Register this callback URL when using Sign-in with Google on the web using OAuth.
            </Typography>
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
          <Box>
            <Typography variant="h4" gutterBottom>
              Auth
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure how users sign in to your app
            </Typography>
          </Box>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="warning" onClose={() => setError(null)}>
            {error}
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
              enabled={settings.email_enabled}
              onClick={() => setActiveView('email')}
            />
            <SignInMethodCard
              icon={Chrome}
              title="Google"
              description="Allow users to sign in with their Google account"
              enabled={settings.google_enabled}
              onClick={() => setActiveView('google')}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Disable Sign-up */}
        <Box>
          <SettingsToggleCard
            title="Disable Sign-up"
            description="Prevent new users from signing up"
            enabled={settings.disable_signup}
            onToggle={(value) => updateSetting('disable_signup', value)}
            loading={updating}
          />
        </Box>

        <Divider />

        {/* Enable Anonymous Users */}
        <Box>
          <SettingsToggleCard
            title="Enable Anonymous Users"
            description="Allow anonymous users to sign in"
            enabled={settings.anonymous_users}
            onToggle={(value) => updateSetting('anonymous_users', value)}
            loading={updating}
          />
        </Box>

        <Divider />

        {/* Advanced */}
        <Box>
          <Button
            endIcon={<ChevronRight size={20} />}
            sx={{
              justifyContent: 'space-between',
              width: '100%',
              py: 2,
              textTransform: 'none',
              color: 'text.primary',
            }}
            onClick={() => {
              // TODO: Navigate to advanced settings or open a dialog
              setSnackbar({
                open: true,
                message: 'Advanced settings coming soon',
                severity: 'info',
              });
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Advanced
            </Typography>
          </Button>
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

