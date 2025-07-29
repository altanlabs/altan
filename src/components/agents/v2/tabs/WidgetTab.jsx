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
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState, useCallback, useRef, useEffect } from 'react';

import Iconify from '../../../iconify';

const WIDGET_POSITIONS = [
  { id: 'bottom-left', name: 'Bottom Left' },
  { id: 'bottom-center', name: 'Bottom Center' },
  { id: 'bottom-right', name: 'Bottom Right' },
];

const WIDGET_THEMES = [
  { id: '', name: 'Default' },
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'system', name: 'System' },
];

function WidgetTab({ agentData, onFieldChange }) {
  const widgetConfig = agentData?.widget || {};
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Initialize widget settings to match exactly what the widget.js expects
  const [widgetSettings, setWidgetSettings] = useState({
    // Basic widget configuration
    mode: 'compact',
    placeholder: widgetConfig.placeholder || 'How can I help you?',

    // Room configuration (match widget.js data attributes)
    tabs: widgetConfig.tabs ?? false,
    conversation_history: widgetConfig.conversation_history ?? true,
    members: widgetConfig.members ?? false,
    settings: widgetConfig.settings ?? false,
    theme: widgetConfig.theme || '',
    title: widgetConfig.title || '',
    description: widgetConfig.description || '',
    voice_enabled: widgetConfig.voice_enabled ?? true,
    suggestions: widgetConfig.suggestions || [],

    // Styling configuration (match widget.js data attributes)
    primary_color: widgetConfig.primary_color || '#000',
    background_color: widgetConfig.background_color || '#ffffff',
    background_blur: widgetConfig.background_blur ?? true,
    position: widgetConfig.position || 'bottom-right',
    width: widgetConfig.width || 350,
    room_width: widgetConfig.room_width || 450,
    room_height: widgetConfig.room_height || 800,
    border_radius: widgetConfig.border_radius || 16,
  });

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Immediate update for switches, selects, etc.
  const handleSettingChange = (field, value) => {
    const newSettings = { ...widgetSettings, [field]: value };
    setWidgetSettings(newSettings);
    onFieldChange('widget', newSettings);
  };

  // Debounced update for text fields and other inputs that can change rapidly
  const handleDebouncedSettingChange = useCallback((field, value) => {
    const newSettings = { ...widgetSettings, [field]: value };
    setWidgetSettings(newSettings);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to update parent after 500ms of no changes
    debounceTimerRef.current = setTimeout(() => {
      onFieldChange('widget', newSettings);
    }, 500);
  }, [widgetSettings, onFieldChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Generate embed code with all configured parameters
  const generateEmbedCode = () => {
    const attributes = ['src="https://altan.ai/sdk/altan-widget.js"'];

    // Required attributes
    attributes.push(`data-account-id="${agentData?.account_id}"`);
    attributes.push(`data-agent-id="${agentData?.id}"`);

    // Basic configuration
    if (widgetSettings.mode !== 'compact') attributes.push(`data-mode="${widgetSettings.mode}"`);
    if (widgetSettings.placeholder !== 'How can I help you?')
      attributes.push(`data-placeholder="${widgetSettings.placeholder}"`);

    // Room configuration
    if (widgetSettings.tabs !== true) attributes.push(`data-tabs="${widgetSettings.tabs}"`);
    if (widgetSettings.conversation_history !== true)
      attributes.push(`data-conversation-history="${widgetSettings.conversation_history}"`);
    if (widgetSettings.members !== true)
      attributes.push(`data-members="${widgetSettings.members}"`);
    if (widgetSettings.settings !== true)
      attributes.push(`data-settings="${widgetSettings.settings}"`);
    if (widgetSettings.theme) attributes.push(`data-theme="${widgetSettings.theme}"`);
    if (widgetSettings.title) attributes.push(`data-title="${widgetSettings.title}"`);
    if (widgetSettings.description)
      attributes.push(`data-description="${widgetSettings.description}"`);
    if (widgetSettings.voice_enabled !== true)
      attributes.push(`data-voice-enabled="${widgetSettings.voice_enabled}"`);
    if (widgetSettings.suggestions.length > 0) {
      attributes.push(`data-suggestions='${JSON.stringify(widgetSettings.suggestions)}'`);
    }

    // Styling configuration
    if (widgetSettings.primary_color !== '#007bff')
      attributes.push(`data-primary-color="${widgetSettings.primary_color}"`);
    if (widgetSettings.background_color !== '#ffffff')
      attributes.push(`data-background-color="${widgetSettings.background_color}"`);
    if (widgetSettings.background_blur !== true)
      attributes.push(`data-background-blur="${widgetSettings.background_blur}"`);
    if (widgetSettings.position !== 'bottom-center')
      attributes.push(`data-position="${widgetSettings.position}"`);
    if (widgetSettings.width !== 350) attributes.push(`data-width="${widgetSettings.width}"`);
    if (widgetSettings.room_width !== 450)
      attributes.push(`data-room-width="${widgetSettings.room_width}"`);
    if (widgetSettings.room_height !== 600)
      attributes.push(`data-room-height="${widgetSettings.room_height}"`);
    if (widgetSettings.border_radius !== 16)
      attributes.push(`data-border-radius="${widgetSettings.border_radius}"`);

    return `<script ${attributes.join(' ')}></script>`;
  };

  // Generate console command for testing
  const generateConsoleCommand = () => {
    const lines = [
      "const script = document.createElement('script');",
      'script.src = "https://altan.ai/sdk/altan-widget.js";',
      `script.setAttribute('data-account-id', '${agentData?.account_id}');`,
      `script.setAttribute('data-agent-id', '${agentData?.id}');`,
    ];

    // Add conditional attributes based on settings
    if (widgetSettings.mode !== 'compact') {
      lines.push(`script.setAttribute('data-mode', '${widgetSettings.mode}');`);
    }
    if (widgetSettings.placeholder !== 'How can I help you?') {
      lines.push(`script.setAttribute('data-placeholder', '${widgetSettings.placeholder}');`);
    }
    if (widgetSettings.theme) {
      lines.push(`script.setAttribute('data-theme', '${widgetSettings.theme}');`);
    }
    if (widgetSettings.title) {
      lines.push(`script.setAttribute('data-title', '${widgetSettings.title}');`);
    }
    if (widgetSettings.description) {
      lines.push(`script.setAttribute('data-description', '${widgetSettings.description}');`);
    }
    if (widgetSettings.tabs !== true) {
      lines.push(`script.setAttribute('data-tabs', '${widgetSettings.tabs}');`);
    }
    if (widgetSettings.conversation_history !== true) {
      lines.push(
        `script.setAttribute('data-conversation-history', '${widgetSettings.conversation_history}');`,
      );
    }
    if (widgetSettings.members !== true) {
      lines.push(`script.setAttribute('data-members', '${widgetSettings.members}');`);
    }
    if (widgetSettings.settings !== true) {
      lines.push(`script.setAttribute('data-settings', '${widgetSettings.settings}');`);
    }
    if (widgetSettings.voice_enabled !== true) {
      lines.push(`script.setAttribute('data-voice-enabled', '${widgetSettings.voice_enabled}');`);
    }
    if (widgetSettings.primary_color !== '#007bff') {
      lines.push(`script.setAttribute('data-primary-color', '${widgetSettings.primary_color}');`);
    }
    if (widgetSettings.background_color !== '#ffffff') {
      lines.push(
        `script.setAttribute('data-background-color', '${widgetSettings.background_color}');`,
      );
    }
    if (widgetSettings.background_blur !== true) {
      lines.push(
        `script.setAttribute('data-background-blur', '${widgetSettings.background_blur}');`,
      );
    }
    if (widgetSettings.position !== 'bottom-right') {
      lines.push(`script.setAttribute('data-position', '${widgetSettings.position}');`);
    }
    if (widgetSettings.width !== 350) {
      lines.push(`script.setAttribute('data-width', '${widgetSettings.width}');`);
    }
    if (widgetSettings.room_width !== 450) {
      lines.push(`script.setAttribute('data-room-width', '${widgetSettings.room_width}');`);
    }
    if (widgetSettings.room_height !== 600) {
      lines.push(`script.setAttribute('data-room-height', '${widgetSettings.room_height}');`);
    }
    if (widgetSettings.border_radius !== 16) {
      lines.push(`script.setAttribute('data-border-radius', '${widgetSettings.border_radius}');`);
    }

    // Add guest info for testing
    lines.push("script.setAttribute('data-guest-name', 'Local Tester');");
    lines.push("script.setAttribute('data-guest-email', 'tester@example.com');");

    // Append to body
    lines.push('document.body.appendChild(script);');

    return lines.join('\n');
  };

  return (
    <>
      {/* Configuration Panel - Full Width */}
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
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="h6"
                  sx={{ color: 'text.primary' }}
                >
                  Widget Embed Code
                </Typography>
                <Tooltip title="Widget Embedding Instructions">
                  <IconButton
                    onClick={() => setInfoDialogOpen(true)}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon="mdi:information-outline" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Button
                onClick={() => {
                  const embedCode = generateEmbedCode();
                  navigator.clipboard.writeText(embedCode).then(() => {
                    console.log('Embed code copied to clipboard');
                  });
                }}
                variant="outlined"
                size="small"
                startIcon={
                  <Box
                    component="span"
                    sx={{ fontSize: '1rem' }}
                  >
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
                fontSize: '0.75rem',
                color: 'grey.300',
                overflow: 'auto',
                mb: 1,
                maxHeight: '200px',
              }}
            >
              <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {generateEmbedCode()}
              </code>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                component="span"
                sx={{ fontSize: '1rem', color: 'warning.main' }}
              >
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

          {/* Appearance & Positioning Card */}
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
              Appearance & Positioning
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Customize how your widget looks and where it appears.
            </Typography>

            <TextField
              size="small"
              fullWidth
              label="Placeholder Text"
              value={widgetSettings.placeholder}
              onChange={(e) => handleDebouncedSettingChange('placeholder', e.target.value)}
              sx={{ mb: 2 }}
            />

            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                sm={6}
              >
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel>Position</InputLabel>
                  <Select
                    value={widgetSettings.position}
                    onChange={(e) => handleSettingChange('position', e.target.value)}
                    label="Position"
                  >
                    {WIDGET_POSITIONS.map((position) => (
                      <MenuItem
                        key={position.id}
                        value={position.id}
                      >
                        {position.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={widgetSettings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    label="Theme"
                  >
                    {WIDGET_THEMES.map((theme) => (
                      <MenuItem
                        key={theme.id}
                        value={theme.id}
                      >
                        {theme.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Widget Width"
                  type="number"
                  value={widgetSettings.width}
                  onChange={(e) => handleDebouncedSettingChange('width', parseInt(e.target.value) || 350)}
                  helperText="Width in pixels"
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Room Width"
                  type="number"
                  value={widgetSettings.room_width}
                  onChange={(e) =>
                    handleDebouncedSettingChange('room_width', parseInt(e.target.value) || 450)
                  }
                  helperText="Expanded width in pixels"
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Room Height"
                  type="number"
                  value={widgetSettings.room_height}
                  onChange={(e) =>
                    handleDebouncedSettingChange('room_height', parseInt(e.target.value) || 600)
                  }
                  helperText="Expanded height in pixels"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Styling Card */}
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
              Colors & Styling
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Customize the visual appearance of your widget.
            </Typography>

            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: widgetSettings.primary_color,
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
                      value={widgetSettings.primary_color}
                      onChange={(e) => handleDebouncedSettingChange('primary_color', e.target.value)}
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
                    value={widgetSettings.primary_color}
                    onChange={(e) => handleDebouncedSettingChange('primary_color', e.target.value)}
                    label="Primary Color"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      backgroundColor: widgetSettings.background_color,
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
                      value={widgetSettings.background_color}
                      onChange={(e) => handleDebouncedSettingChange('background_color', e.target.value)}
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
                    value={widgetSettings.background_color}
                    onChange={(e) => handleDebouncedSettingChange('background_color', e.target.value)}
                    label="Background Color"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Border Radius"
                  type="number"
                  value={widgetSettings.border_radius}
                  onChange={(e) =>
                    handleDebouncedSettingChange('border_radius', parseInt(e.target.value) || 16)
                  }
                  helperText="Corner roundness in pixels"
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 1,
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontWeight: 'medium' }}
                    >
                      Background Blur
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      Glassmorphism effect
                    </Typography>
                  </Box>
                  <Switch
                    checked={widgetSettings.background_blur}
                    onChange={(e) => handleSettingChange('background_blur', e.target.checked)}
                  />
                </Box>
              </Grid>
            </Grid>
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

            <Grid
              container
              spacing={2}
            >
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontWeight: 'medium' }}
                    >
                      Show Tabs
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      Display tab navigation
                    </Typography>
                  </Box>
                  <Switch
                    checked={widgetSettings.tabs}
                    onChange={(e) => handleSettingChange('tabs', e.target.checked)}
                  />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontWeight: 'medium' }}
                    >
                      Show Settings
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      Display settings panel
                    </Typography>
                  </Box>
                  <Switch
                    checked={widgetSettings.settings}
                    onChange={(e) => handleSettingChange('settings', e.target.checked)}
                  />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontWeight: 'medium' }}
                    >
                      Show History
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      Display conversation history
                    </Typography>
                  </Box>
                  <Switch
                    checked={widgetSettings.conversation_history}
                    onChange={(e) => handleSettingChange('conversation_history', e.target.checked)}
                  />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontWeight: 'medium' }}
                    >
                      Show Members
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      Display member list
                    </Typography>
                  </Box>
                  <Switch
                    checked={widgetSettings.members}
                    onChange={(e) => handleSettingChange('members', e.target.checked)}
                  />
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontWeight: 'medium' }}
                    >
                      Enable Voice
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                    >
                      Allow voice interactions
                    </Typography>
                  </Box>
                  <Switch
                    checked={widgetSettings.voice_enabled}
                    onChange={(e) => handleSettingChange('voice_enabled', e.target.checked)}
                  />
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <TextField
                size="small"
                fullWidth
                label="Room Title"
                value={widgetSettings.title}
                onChange={(e) => handleDebouncedSettingChange('title', e.target.value)}
                helperText="Custom title for the chat room (optional)"
                sx={{ mb: 2 }}
              />
              <TextField
                size="small"
                fullWidth
                label="Room Description"
                value={widgetSettings.description}
                onChange={(e) => handleDebouncedSettingChange('description', e.target.value)}
                helperText="Custom description for the chat room (optional)"
                sx={{ mb: 2 }}
              />
              <TextField
                size="small"
                fullWidth
                label="Message Suggestions"
                value={widgetSettings.suggestions.join(', ')}
                onChange={(e) => {
                  const suggestions = e.target.value
                    ? e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s)
                    : [];
                  handleDebouncedSettingChange('suggestions', suggestions);
                }}
                helperText="Comma-separated list of suggested messages (e.g., 'Hello, How can I help?, Support')"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Widget Embedding Instructions Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      >
        <DialogTitle>Widget Embedding Instructions</DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            sx={{ mb: 2 }}
          >
            To embed the Altan widget on your website, you need to add a script tag to your HTML
            file. This script tag should be placed in the head section of your HTML file, ideally
            before the closing body tag.
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 1 }}
          >
            For example, if your HTML file is named index.html, you would add this to your
            index.html file:
          </Typography>
          <Box
            sx={{
              bgcolor: 'grey.800',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '0.75rem',
              color: 'grey.300',
              overflow: 'auto',
              maxHeight: '200px',
            }}
          >
            <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              &lt;head&gt; &lt;script src="https://altan.ai/sdk/altan-widget.js"&gt;&lt;/script&gt;
              &lt;/head&gt; &lt;body&gt; &lt;div id="altan-widget-container"&gt;&lt;/div&gt;
              &lt;/body&gt;
            </code>
          </Box>
          <Typography
            variant="body2"
            sx={{ mt: 2 }}
          >
            The script tag should be placed in the head section of your HTML file. The div with id
            "altan-widget-container" is where the widget will be rendered. You can customize the
            widget&apos;s appearance and behavior using data attributes on the script tag.
          </Typography>

          {/* Console Command for Current Settings */}
          <Typography
            variant="h6"
            sx={{ mt: 3, mb: 1 }}
          >
            Console Command (For testing only)
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 2 }}
          >
            Or use this command with your current configuration. Copy and paste this into your
            browser&apos;s console:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button
              onClick={() => {
                const consoleCommand = generateConsoleCommand();
                navigator.clipboard.writeText(consoleCommand).then(() => {
                  console.log('Console command copied to clipboard');
                });
              }}
              variant="outlined"
              size="small"
              startIcon={
                <Box
                  component="span"
                  sx={{ fontSize: '1rem' }}
                >
                  📋
                </Box>
              }
            >
              Copy Command
            </Button>
          </Box>
          <Box
            sx={{
              bgcolor: 'grey.800',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '0.75rem',
              color: 'grey.300',
              overflow: 'auto',
              maxHeight: '200px',
            }}
          >
            <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {generateConsoleCommand()}
            </code>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <Box
              component="span"
              sx={{ fontSize: '1rem', color: 'info.main' }}
            >
              💡
            </Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
            >
              Open browser DevTools (F12), paste this command in the Console tab, and press Enter
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setInfoDialogOpen(false)}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

WidgetTab.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default memo(WidgetTab);
