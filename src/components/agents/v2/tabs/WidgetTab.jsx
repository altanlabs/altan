import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Switch,
  TextField,
  InputLabel,
  Button,
} from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';

const WIDGET_SIZES = [
  { id: 'small', name: 'Small' },
  { id: 'medium', name: 'Medium' },
  { id: 'large', name: 'Large' },
];

const WIDGET_PLACEMENTS = [
  { id: 'top-left', name: 'Top Left' },
  { id: 'top-center', name: 'Top Center' },
  { id: 'top-right', name: 'Top Right' },
  { id: 'center-left', name: 'Center Left' },
  { id: 'center-right', name: 'Center Right' },
  { id: 'bottom-left', name: 'Bottom Left' },
  { id: 'bottom-center', name: 'Bottom Center' },
  { id: 'bottom-right', name: 'Bottom Right' },
];

function WidgetTab({ agentData, onFieldChange }) {
  const widgetConfig = agentData?.widget || {};

  // Initialize default values based on the data models
  const [widgetSettings, setWidgetSettings] = useState({
    appearance: {
      size: widgetConfig.appearance?.size || 'medium',
      placement: widgetConfig.appearance?.placement || 'bottom-right',
    },
    room_settings: {
      display_header: widgetConfig.room_settings?.display_header ?? true,
      display_settings: widgetConfig.room_settings?.display_settings ?? true,
      display_threads: widgetConfig.room_settings?.display_threads ?? true,
      display_members: widgetConfig.room_settings?.display_members ?? true,
      enable_voice: widgetConfig.room_settings?.enable_voice ?? true,
    },
    remove_altan_branding: widgetConfig.remove_altan_branding ?? false,
    avatar: {
      background_color: widgetConfig.avatar?.background_color || '#0000',
      avatar_url: widgetConfig.avatar?.avatar_url || '',
    },
  });

  const handleSettingChange = (field, value) => {
    const newSettings = { ...widgetSettings, [field]: value };
    setWidgetSettings(newSettings);
    onFieldChange('widget', newSettings);
  };

  const handleAppearanceChange = (field, value) => {
    const newAppearance = { ...widgetSettings.appearance, [field]: value };
    const newSettings = { ...widgetSettings, appearance: newAppearance };
    setWidgetSettings(newSettings);
    onFieldChange('widget', newSettings);
  };

  const handleRoomSettingChange = (field, value) => {
    const newRoomSettings = { ...widgetSettings.room_settings, [field]: value };
    const newSettings = { ...widgetSettings, room_settings: newRoomSettings };
    setWidgetSettings(newSettings);
    onFieldChange('widget', newSettings);
  };

  const handleAvatarChange = (field, value) => {
    const newAvatar = { ...widgetSettings.avatar, [field]: value };
    const newSettings = { ...widgetSettings, avatar: newAvatar };
    setWidgetSettings(newSettings);
    onFieldChange('widget', newSettings);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Configuration Panel */}
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Widget Embed Code Card */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: 'text.primary' }}
              >
                Widget Embed Code
              </Typography>
              <Button
                onClick={() => {
                  const embedCode = `<script src="https://altan.ai/altan-agent-widget.js" altan-agent-id="${agentData?.id}"></script>`;
                  navigator.clipboard.writeText(embedCode).then(() => {
                    // Could add a toast notification here if needed
                    console.log('Embed code copied to clipboard');
                  });
                }}
                variant="outlined"
                size="small"
                startIcon={
                  <Box component="span" sx={{ fontSize: '1rem' }}>
                    📋
                  </Box>
                }
              >
                Copy Code
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Copy and paste this code into your website to embed the agent widget.
            </Typography>

            <Box
              sx={{
                bgcolor: 'grey.800',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '0.875rem',
                color: 'grey.300',
                overflow: 'auto',
                mb: 1,
              }}
            >
              <code>
                {`<script src="https://altan.ai/altan-agent-widget.js" altan-agent-id="${agentData?.id}"></script>`}
              </code>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box component="span" sx={{ fontSize: '1rem', color: 'warning.main' }}>
                ℹ️
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                Ensure the agent is public for the widget to work on external websites
              </Typography>
            </Box>
          </Box>

          {/* Appearance Card */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Appearance
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Customize how your widget looks and where it appears.
            </Typography>

            {/* Size Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', mb: 2 }}
              >
                Widget Size
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Size</InputLabel>
                <Select
                  size="small"
                  value={widgetSettings.appearance.size}
                  onChange={(e) => handleAppearanceChange('size', e.target.value)}
                  label="Size"
                >
                  {WIDGET_SIZES.map((size) => (
                    <MenuItem
                      key={size.id}
                      value={size.id}
                    >
                      {size.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Placement Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', mb: 2 }}
              >
                Widget Placement
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Placement</InputLabel>
                <Select
                  size="small"
                  value={widgetSettings.appearance.placement}
                  onChange={(e) => handleAppearanceChange('placement', e.target.value)}
                  label="Placement"
                >
                  {WIDGET_PLACEMENTS.map((placement) => (
                    <MenuItem
                      key={placement.id}
                      value={placement.id}
                    >
                      {placement.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mt: 1, display: 'block' }}
              >
                Choose where the widget appears on the page when embedded.
              </Typography>
            </Box>
          </Box>

          {/* Avatar Card */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Avatar
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Customize the avatar appearance for your widget.
            </Typography>

            {/* Avatar URL */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', mb: 2 }}
              >
                Avatar URL
              </Typography>
              <TextField
                size="small"
                fullWidth
                value={widgetSettings.avatar.avatar_url}
                onChange={(e) => handleAvatarChange('avatar_url', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                helperText="Optional: Specify a custom avatar image URL"
              />
            </Box>

            {/* Background Color */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', mb: 2 }}
              >
                Background Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: widgetSettings.avatar.background_color || '#0000',
                    border: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    type="color"
                    value={widgetSettings.avatar.background_color || '#0000'}
                    onChange={(e) => handleAvatarChange('background_color', e.target.value)}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                </Box>
                <TextField
                  size="small"
                  value={widgetSettings.avatar.background_color || ''}
                  onChange={(e) => handleAvatarChange('background_color', e.target.value)}
                  placeholder="#0000"
                  sx={{ flex: 1 }}
                  helperText="Background color for the avatar container"
                />
              </Box>
            </Box>
          </Box>

          {/* Room Settings Card */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Chat Room Settings
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Configure which elements are displayed in the chat interface.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontWeight: 'medium' }}
                  >
                    Display Header
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    Show the chat header with agent info
                  </Typography>
                </Box>
                <Switch
                  checked={widgetSettings.room_settings.display_header}
                  onChange={(e) => handleRoomSettingChange('display_header', e.target.checked)}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontWeight: 'medium' }}
                  >
                    Display Settings
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    Show settings and configuration options
                  </Typography>
                </Box>
                <Switch
                  checked={widgetSettings.room_settings.display_settings}
                  onChange={(e) => handleRoomSettingChange('display_settings', e.target.checked)}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontWeight: 'medium' }}
                  >
                    Display Threads
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    Show conversation threads and history
                  </Typography>
                </Box>
                <Switch
                  checked={widgetSettings.room_settings.display_threads}
                  onChange={(e) => handleRoomSettingChange('display_threads', e.target.checked)}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontWeight: 'medium' }}
                  >
                    Display Members
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    Show participant list and member info
                  </Typography>
                </Box>
                <Switch
                  checked={widgetSettings.room_settings.display_members}
                  onChange={(e) => handleRoomSettingChange('display_members', e.target.checked)}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontWeight: 'medium' }}
                  >
                    Enable Voice
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    Allow voice interactions in the chat
                  </Typography>
                </Box>
                <Switch
                  checked={widgetSettings.room_settings.enable_voice}
                  onChange={(e) => handleRoomSettingChange('enable_voice', e.target.checked)}
                />
              </Box>
            </Box>
          </Box>

          {/* Branding Card */}
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Branding
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Control Altan branding visibility on your widget.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.primary', fontWeight: 'medium' }}
                >
                  Remove Altan Branding
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
                >
                  Hide &ldquo;Powered by Altan&rdquo; from the widget
                </Typography>
              </Box>
              <Switch
                checked={widgetSettings.remove_altan_branding}
                onChange={(e) => handleSettingChange('remove_altan_branding', e.target.checked)}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

WidgetTab.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default memo(WidgetTab);
