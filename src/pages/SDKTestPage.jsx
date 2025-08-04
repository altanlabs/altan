import {
  Container,
  Typography,
  Paper,
  Grid,
  Switch,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Button,
  Divider,
  Chip,
  Stack,
  Box,
  InputAdornment,
} from '@mui/material';
import React, { useState } from 'react';

import { Room } from '../lib/agents/components';

// Test configuration - accountId is now required
const TEST_CONFIG = {
  accountId: 'afd0ea2c-b44a-475b-b433-096eece24085', // Your account ID (required)
  agentId: '10a3835b-c8a3-4bbd-b9be-a3a7dea7bc11', // Agent to chat with
  roomId: 'your-group-chat-room-id', // Example room ID for group chat
  apiBaseUrl: 'https://api.altan.ai/platform/guest',
  authBaseUrl: 'https://api.altan.ai/auth/login/guest',
  roomBaseUrl: 'https://altan.ai/r', // Use production room server
};

export default function SDKTestPage() {
  // Configuration state for the form
  const [config, setConfig] = useState({
    mode: 'compact',
    tabs: false,
    conversation_history: false,
    members: false,
    settings: false,
    theme: 'system',
    title: '',
    description: '',
    placeholder: 'How can I help you?',
    voice_enabled: true,
    primary_color: '#007bff',
    background_color: '#ffffff',
    background_blur: true,
    position: 'bottom-center',
    widget_width: 350,
    room_width: 450,
    room_height: 600,
    border_radius: 16,
    suggestions: ['How can I help you?', 'Tell me about your services', 'I need support'],
  });

  const [newSuggestion, setNewSuggestion] = useState('');

  const handleConfigChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const addSuggestion = () => {
    if (newSuggestion.trim() && !config.suggestions.includes(newSuggestion.trim())) {
      setConfig((prev) => ({
        ...prev,
        suggestions: [...prev.suggestions, newSuggestion.trim()],
      }));
      setNewSuggestion('');
    }
  };

  const removeSuggestion = (index) => {
    setConfig((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((_, i) => i !== index),
    }));
  };

  const resetToDefaults = () => {
    setConfig({
      mode: 'compact',
      tabs: true,
      conversation_history: true,
      members: true,
      settings: true,
      theme: 'system',
      title: '',
      description: '',
      placeholder: 'How can I help you?',
      voice_enabled: true,
      primary_color: '#007bff',
      background_color: '#ffffff',
      background_blur: true,
      position: 'bottom-center',
      widget_width: 350,
      room_width: 450,
      room_height: 600,
      border_radius: 16,
      suggestions: ['How can I help you?', 'Tell me about your services', 'I need support'],
    });
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4 }}
    >
      <Typography
        variant="h4"
        gutterBottom
      >
        Altan SDK - Compact Mode Configuration
      </Typography>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          maxHeight: '70vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          Compact Mode Configuration
        </Typography>

        {/* Basic Settings */}
        <Grid
          container
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Grid
            item
            xs={6}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={config.tabs}
                  onChange={handleConfigChange('tabs')}
                />
              }
              label="Show Tabs"
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={config.conversation_history}
                  onChange={handleConfigChange('conversation_history')}
                />
              }
              label="Conversation History"
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={config.members}
                  onChange={handleConfigChange('members')}
                />
              }
              label="Show Members"
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={config.settings}
                  onChange={handleConfigChange('settings')}
                />
              }
              label="Show Settings"
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={config.voice_enabled}
                  onChange={handleConfigChange('voice_enabled')}
                />
              }
              label="Voice Enabled"
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={config.background_blur}
                  onChange={handleConfigChange('background_blur')}
                />
              }
              label="Background Blur"
            />
          </Grid>
        </Grid>

        {/* Theme Selection */}
        <FormControl
          fullWidth
          sx={{ mb: 2 }}
        >
          <InputLabel>Theme</InputLabel>
          <Select
            value={config.theme}
            onChange={handleConfigChange('theme')}
            label="Theme"
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System</MenuItem>
          </Select>
        </FormControl>

        {/* Text Fields */}
        <TextField
          fullWidth
          label="Title"
          value={config.title}
          onChange={handleConfigChange('title')}
          sx={{ mb: 2 }}
          placeholder="Custom room title"
        />

        <TextField
          fullWidth
          label="Description"
          value={config.description}
          onChange={handleConfigChange('description')}
          sx={{ mb: 2 }}
          placeholder="Custom room description"
        />

        <TextField
          fullWidth
          label="Placeholder"
          value={config.placeholder}
          onChange={handleConfigChange('placeholder')}
          sx={{ mb: 2 }}
          placeholder="Message placeholder text"
        />

        <Divider sx={{ my: 2 }} />

        {/* Styling Options */}
        <Typography
          variant="subtitle1"
          gutterBottom
        >
          Styling Options
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Grid
            item
            xs={6}
          >
            <TextField
              fullWidth
              label="Primary Color"
              value={config.primary_color}
              onChange={handleConfigChange('primary_color')}
              type="color"
            />
          </Grid>
          <Grid
            item
            xs={6}
          >
            <TextField
              fullWidth
              label="Background Color"
              value={config.background_color}
              onChange={handleConfigChange('background_color')}
              type="color"
            />
          </Grid>
        </Grid>

        {/* Position Selection */}
        <FormControl
          fullWidth
          sx={{ mb: 2 }}
        >
          <InputLabel>Position</InputLabel>
          <Select
            value={config.position}
            onChange={handleConfigChange('position')}
            label="Position"
          >
            <MenuItem value="bottom-right">Bottom Right</MenuItem>
            <MenuItem value="bottom-left">Bottom Left</MenuItem>
            <MenuItem value="bottom-center">Bottom Center</MenuItem>
          </Select>
        </FormControl>

        {/* Dimension Controls */}
        <Grid
          container
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Grid
            item
            xs={4}
          >
            <TextField
              fullWidth
              label="Widget Width"
              type="number"
              value={config.widget_width}
              onChange={handleConfigChange('widget_width')}
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
            />
          </Grid>
          <Grid
            item
            xs={4}
          >
            <TextField
              fullWidth
              label="Room Width"
              type="number"
              value={config.room_width}
              onChange={handleConfigChange('room_width')}
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
            />
          </Grid>
          <Grid
            item
            xs={4}
          >
            <TextField
              fullWidth
              label="Room Height"
              type="number"
              value={config.room_height}
              onChange={handleConfigChange('room_height')}
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Border Radius"
          type="number"
          value={config.border_radius}
          onChange={handleConfigChange('border_radius')}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">px</InputAdornment>,
          }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Suggestions */}
        <Typography
          variant="subtitle1"
          gutterBottom
        >
          Message Suggestions
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <TextField
              size="small"
              label="Add suggestion"
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSuggestion()}
              sx={{ flexGrow: 1 }}
            />
            <Button
              onClick={addSuggestion}
              variant="outlined"
            >
              Add
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            gap={1}
          >
            {config.suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onDelete={() => removeSuggestion(index)}
                size="small"
              />
            ))}
          </Stack>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          onClick={resetToDefaults}
          sx={{ mt: 2 }}
        >
          Reset to Defaults
        </Button>
      </Paper>

      {/* Compact Mode Widget */}
      <Room
        key={JSON.stringify(config)} // Force re-render when config changes
        mode="compact"
        accountId={TEST_CONFIG.accountId}
        agentId={TEST_CONFIG.agentId}
        placeholder={config.placeholder}
        // Room behavior configuration
        tabs={config.tabs}
        conversation_history={config.conversation_history}
        members={config.members}
        settings={config.settings}
        theme={config.theme}
        title={config.title}
        description={config.description}
        voice_enabled={config.voice_enabled}
        suggestions={config.suggestions}
        // Widget styling configuration
        primary_color={config.primary_color}
        background_color={config.background_color}
        background_blur={config.background_blur}
        position={config.position}
        widget_width={config.widget_width}
        room_width={config.room_width}
        room_height={config.room_height}
        border_radius={config.border_radius}
        guestInfo={{
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          external_id: 'sdk-test-config',
        }}
      />
    </Container>
  );
}
