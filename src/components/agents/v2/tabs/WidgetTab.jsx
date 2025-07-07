import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Switch,
  Button,
  TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';

const WIDGET_VARIANTS = [
  { id: 'tiny', name: 'Tiny' },
  { id: 'compact', name: 'Compact' },
  { id: 'full', name: 'Full' },
];

const WIDGET_PLACEMENTS = [
  { id: 'top-left', name: 'Top-left' },
  { id: 'top', name: 'Top' },
  { id: 'top-right', name: 'Top-right' },
  { id: 'bottom-left', name: 'Bottom-left' },
  { id: 'bottom', name: 'Bottom' },
  { id: 'bottom-right', name: 'Bottom-right' },
];

function WidgetTab({ agentData, onFieldChange }) {
  const [widgetSettings, setWidgetSettings] = useState(
    agentData?.widget || {
      // Interface settings
      text_input: true,
      allow_switching_to_text_only_mode: true,
      conversation_transcript: true,
      language_dropdown: true,
      enable_muting_during_call: true,

      // Appearance settings
      variant: 'full',
      placement: 'bottom-right',

      // Theme settings
      theme: {
        base: '#ffffff',
        base_hover: '#f9fafb',
        base_active: '#f3f4f6',
        base_border: '#e5e7eb',
        base_subtle: '#6b7280',
        base_primary: '#000000',
        base_error: '#ef4444',
        accent: '#000000',
        accent_hover: '#1f2937',
        accent_active: '#374151',
        accent_border: '#4b5563',
        accent_subtle: '#6b7280',
        accent_primary: '#ffffff',
        overlay_padding: '32px',
        button_radius: '18px',
        input_radius: '10px',
        bubble_radius: '15px',
        sheet_radius: '24px',
        compact_sheet_radius: '30px',
        dropdown_sheet_radius: '16px',
      },
    },
  );

  const handleSettingChange = (field, value) => {
    const newSettings = { ...widgetSettings, [field]: value };
    setWidgetSettings(newSettings);
    onFieldChange('widget', newSettings);
  };

  const handleThemeChange = (field, value) => {
    const newTheme = { ...widgetSettings.theme, [field]: value };
    const newSettings = { ...widgetSettings, theme: newTheme };
    setWidgetSettings(newSettings);
    onFieldChange('widget', newSettings);
  };

  const renderColorInput = (label, field, value) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 120, color: 'text.primary' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            backgroundColor: value || '#000000',
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
            value={value || '#000000'}
            onChange={(e) => handleThemeChange(field, e.target.value)}
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
          value={value || ''}
          onChange={(e) => handleThemeChange(field, e.target.value)}
          placeholder="#000000"
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );

  const renderDimensionInput = (label, field, value, suffix = 'px') => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 120, color: 'text.primary' }}>
        {label}
      </Typography>
      <TextField
        size="small"
        value={value?.replace(suffix, '') || ''}
        onChange={(e) => handleThemeChange(field, `${e.target.value}${suffix}`)}
        placeholder="0"
        sx={{ width: 120 }}
        InputProps={{
          endAdornment: <Typography variant="body2" sx={{ color: 'text.secondary' }}>{suffix}</Typography>,
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Panel: Configuration */}
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Interface Card */}
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
              Interface
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Configure parts of the widget interface.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                    Text input
                  </Typography>
                </Box>
                <Switch
                  checked={widgetSettings.text_input}
                  onChange={(e) => handleSettingChange('text_input', e.target.checked)}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                    Allow switching to text-only mode
                  </Typography>
                </Box>
                <Switch
                  checked={widgetSettings.allow_switching_to_text_only_mode}
                  onChange={(e) => handleSettingChange('allow_switching_to_text_only_mode', e.target.checked)}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                    Conversation transcript
                  </Typography> 
                </Box>
                <Switch
                  checked={widgetSettings.conversation_transcript}
                  onChange={(e) => handleSettingChange('conversation_transcript', e.target.checked)}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                    Language dropdown
                  </Typography>
                </Box>
                <Switch
                  checked={widgetSettings.language_dropdown}
                  onChange={(e) => handleSettingChange('language_dropdown', e.target.checked)}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                  Enable muting during a call
                </Typography>
                <Switch
                  checked={widgetSettings.enable_muting_during_call}
                  onChange={(e) => handleSettingChange('enable_muting_during_call', e.target.checked)}
                />
              </Box>
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
              Customize the widget to best fit your website.
            </Typography>

            {/* Variant Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', mb: 2 }}
              >
                Variant
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {WIDGET_VARIANTS.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={widgetSettings.variant === variant.id ? 'contained' : 'outlined'}
                    onClick={() => handleSettingChange('variant', variant.id)}
                    sx={{ flex: 1 }}
                  >
                    {variant.name}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Placement Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', mb: 2 }}
              >
                Placement
              </Typography>
              <FormControl fullWidth>
                <Select
                  size="small"
                  value={widgetSettings.placement}
                  onChange={(e) => handleSettingChange('placement', e.target.value)}
                >
                  {WIDGET_PLACEMENTS.map((placement) => (
                    <MenuItem key={placement.id} value={placement.id}>
                      {placement.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mt: 1, display: 'block' }}
              >
                The preview widget on this page is always placed in the bottom right corner of the screen.
                The placement you select here will only be used when the widget is embedded on your website.
              </Typography>
            </Box>
          </Box>

          {/* Theme Card */}
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
              Theme
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Modify the colors and style of your widget.
            </Typography>

            {/* Base Colors */}
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.primary', mb: 2 }}
            >
              Base Colors
            </Typography>
            {renderColorInput('base', 'base', widgetSettings.theme?.base)}
            {renderColorInput('base_hover', 'base_hover', widgetSettings.theme?.base_hover)}
            {renderColorInput('base_active', 'base_active', widgetSettings.theme?.base_active)}
            {renderColorInput('base_border', 'base_border', widgetSettings.theme?.base_border)}
            {renderColorInput('base_subtle', 'base_subtle', widgetSettings.theme?.base_subtle)}
            {renderColorInput('base_primary', 'base_primary', widgetSettings.theme?.base_primary)}
            {renderColorInput('base_error', 'base_error', widgetSettings.theme?.base_error)}

            {/* Accent Colors */}
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.primary', mb: 2, mt: 3 }}
            >
              Accent Colors
            </Typography>
            {renderColorInput('accent', 'accent', widgetSettings.theme?.accent)}
            {renderColorInput('accent_hover', 'accent_hover', widgetSettings.theme?.accent_hover)}
            {renderColorInput('accent_active', 'accent_active', widgetSettings.theme?.accent_active)}
            {renderColorInput('accent_border', 'accent_border', widgetSettings.theme?.accent_border)}
            {renderColorInput('accent_subtle', 'accent_subtle', widgetSettings.theme?.accent_subtle)}
            {renderColorInput('accent_primary', 'accent_primary', widgetSettings.theme?.accent_primary)}

            {/* Dimensions */}
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.primary', mb: 2, mt: 3 }}
            >
              Dimensions & Spacing
            </Typography>
            {renderDimensionInput('overlay_padding', 'overlay_padding', widgetSettings.theme?.overlay_padding)}
            {renderDimensionInput('button_radius', 'button_radius', widgetSettings.theme?.button_radius)}
            {renderDimensionInput('input_radius', 'input_radius', widgetSettings.theme?.input_radius)}
            {renderDimensionInput('bubble_radius', 'bubble_radius', widgetSettings.theme?.bubble_radius)}
            {renderDimensionInput('sheet_radius', 'sheet_radius', widgetSettings.theme?.sheet_radius)}
            {renderDimensionInput('compact_sheet_radius', 'compact_sheet_radius', widgetSettings.theme?.compact_sheet_radius)}
            {renderDimensionInput('dropdown_sheet_radius', 'dropdown_sheet_radius', widgetSettings.theme?.dropdown_sheet_radius)}
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
