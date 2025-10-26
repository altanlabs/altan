import {
  Box,
  Typography,
  Chip,
  Stack,
  Switch,
  Checkbox,
  FormControlLabel,
  TextField,
  Slider,
  Tooltip,
  IconButton,
  Divider,
  Button,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';

import Iconify from '../../../iconify/Iconify';

// Common countries with ISO codes
const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'CN', label: 'China' },
  { code: 'IN', label: 'India' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
  { code: 'FI', label: 'Finland' },
  { code: 'PL', label: 'Poland' },
  { code: 'RU', label: 'Russia' },
  { code: 'KR', label: 'South Korea' },
  { code: 'SG', label: 'Singapore' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'AT', label: 'Austria' },
  { code: 'BE', label: 'Belgium' },
  { code: 'IE', label: 'Ireland' },
  { code: 'PT', label: 'Portugal' },
  { code: 'GR', label: 'Greece' },
  { code: 'CZ', label: 'Czech Republic' },
].sort((a, b) => a.label.localeCompare(b.label));

// Common timezones
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Helsinki',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
].sort();

export const WEB_SEARCH_PRESETS = {
  disabled: {
    name: 'Disabled',
    icon: 'mdi:web-off',
    color: 'grey',
    config: { enabled: false },
  },
  basic: {
    name: 'Basic',
    icon: 'mdi:web',
    color: 'info',
    config: {
      enabled: true,
      search_context_size: 'low',
      max_searches: 3,
      include_sources: true,
      include_actions: false,
    },
  },
  standard: {
    name: 'Standard',
    icon: 'mdi:web-check',
    color: 'success',
    config: {
      enabled: true,
      search_context_size: 'medium',
      max_searches: 5,
      include_sources: true,
      include_actions: true,
    },
  },
  advanced: {
    name: 'Advanced',
    icon: 'mdi:web-sync',
    color: 'warning',
    config: {
      enabled: true,
      search_context_size: 'high',
      max_searches: 10,
      include_sources: true,
      include_actions: true,
    },
  },
  research: {
    name: 'Research',
    icon: 'mdi:brain-search',
    color: 'error',
    config: {
      enabled: true,
      search_context_size: 'high',
      max_searches: 15,
      include_sources: true,
      include_actions: true,
    },
  },
};

const WebSearchConfig = ({ agentData, onFieldChange, provider }) => {
  const [webSearchExpanded, setWebSearchExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newAllowedDomain, setNewAllowedDomain] = useState('');
  const [newBlockedDomain, setNewBlockedDomain] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState(null);

  // Web search config
  const webSearchConfig = agentData?.llm_config?.settings?.web_search || {};
  const webSearchEnabled = webSearchConfig?.enabled ?? false;
  const searchContextSize = webSearchConfig?.search_context_size || 'medium';
  const maxSearches = webSearchConfig?.max_searches ?? 5;
  const includeSources = webSearchConfig?.include_sources ?? true;
  const includeActions = webSearchConfig?.include_actions ?? false;
  const allowedDomains = webSearchConfig?.filters?.allowed_domains || [];
  const blockedDomains = webSearchConfig?.filters?.blocked_domains || [];
  const userLocation = webSearchConfig?.user_location || {};

  const handleWebSearchChange = (updates) => {
    const currentWebSearch = agentData?.llm_config?.settings?.web_search || {};
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: {
        ...agentData.llm_config?.settings,
        web_search: {
          ...currentWebSearch,
          ...updates,
        },
      },
    });
  };

  const handleWebSearchEnabledChange = (enabled) => {
    handleWebSearchChange({ enabled });
  };

  const handleSearchContextSizeChange = (size) => {
    handleWebSearchChange({ search_context_size: size });
  };

  const handleMaxSearchesChange = (max) => {
    handleWebSearchChange({ max_searches: max });
  };

  const handleIncludeSourcesChange = (include) => {
    handleWebSearchChange({ include_sources: include });
  };

  const handleIncludeActionsChange = (include) => {
    handleWebSearchChange({ include_actions: include });
  };

  const handlePresetChange = (presetKey) => {
    const preset = WEB_SEARCH_PRESETS[presetKey];
    handleWebSearchChange(preset.config);
  };

  const handleAddAllowedDomain = () => {
    if (newAllowedDomain.trim()) {
      const currentFilters = webSearchConfig?.filters || {};
      handleWebSearchChange({
        filters: {
          ...currentFilters,
          allowed_domains: [...(currentFilters.allowed_domains || []), newAllowedDomain.trim()],
        },
      });
      setNewAllowedDomain('');
    }
  };

  const handleRemoveAllowedDomain = (domain) => {
    const currentFilters = webSearchConfig?.filters || {};
    handleWebSearchChange({
      filters: {
        ...currentFilters,
        allowed_domains: (currentFilters.allowed_domains || []).filter((d) => d !== domain),
      },
    });
  };

  const handleAddBlockedDomain = () => {
    if (newBlockedDomain.trim()) {
      const currentFilters = webSearchConfig?.filters || {};
      handleWebSearchChange({
        filters: {
          ...currentFilters,
          blocked_domains: [...(currentFilters.blocked_domains || []), newBlockedDomain.trim()],
        },
      });
      setNewBlockedDomain('');
    }
  };

  const handleRemoveBlockedDomain = (domain) => {
    const currentFilters = webSearchConfig?.filters || {};
    handleWebSearchChange({
      filters: {
        ...currentFilters,
        blocked_domains: (currentFilters.blocked_domains || []).filter((d) => d !== domain),
      },
    });
  };

  const handleLocationChange = (field, value) => {
    const currentLocation = webSearchConfig?.user_location || {};
    handleWebSearchChange({
      user_location: {
        ...currentLocation,
        type: 'approximate',
        [field]: value || undefined,
      },
    });
  };

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);
    
    try {
      // Using ipapi.co for IP geolocation (free tier: 1000 requests/day)
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Failed to detect location');
      }
      
      const data = await response.json();
      
      const detectedLoc = {
        city: data.city,
        region: data.region,
        country: data.country_code,
        timezone: data.timezone,
      };
      
      setDetectedLocation(detectedLoc);
      
      // Auto-fill the location fields
      handleWebSearchChange({
        user_location: {
          type: 'approximate',
          city: data.city,
          region: data.region,
          country: data.country_code,
          timezone: data.timezone,
        },
      });
      
    } catch (error) {
      console.error('Location detection error:', error);
      setLocationError('Failed to detect location. Please enter manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleClearLocation = () => {
    handleWebSearchChange({
      user_location: undefined,
    });
    setDetectedLocation(null);
    setLocationError(null);
  };

  const getCurrentPreset = () => {
    // Determine which preset matches current settings
    for (const [key, preset] of Object.entries(WEB_SEARCH_PRESETS)) {
      const config = preset.config;
      if (
        config.enabled === webSearchEnabled &&
        (!webSearchEnabled || (
          config.search_context_size === searchContextSize &&
          config.max_searches === maxSearches &&
          config.include_sources === includeSources &&
          config.include_actions === includeActions
        ))
      ) {
        return key;
      }
    }
    return 'custom';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:web-search" width={18} sx={{ color: webSearchEnabled ? 'success.main' : 'text.disabled' }} />
          <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Web Search
          </Typography>
          {webSearchEnabled && (
            <Chip
              label={getCurrentPreset() !== 'custom' ? WEB_SEARCH_PRESETS[getCurrentPreset()].name : 'Custom'}
              size="small"
              icon={<Iconify icon={getCurrentPreset() !== 'custom' ? WEB_SEARCH_PRESETS[getCurrentPreset()].icon : 'mdi:tune'} width={12} />}
              sx={{
                height: 18,
                fontSize: '0.65rem',
                bgcolor: getCurrentPreset() !== 'custom' ? `${WEB_SEARCH_PRESETS[getCurrentPreset()].color}.lighter` : 'grey.300',
                color: getCurrentPreset() !== 'custom' ? `${WEB_SEARCH_PRESETS[getCurrentPreset()].color}.darker` : 'text.secondary',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        <Tooltip title={webSearchEnabled ? 'Disable web search' : 'Enable web search'}>
          <Switch
            size="small"
            checked={webSearchEnabled}
            onChange={(e) => handleWebSearchEnabledChange(e.target.checked)}
          />
        </Tooltip>
      </Box>

      {/* Quick Presets */}
      <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.75} sx={{ mb: webSearchEnabled ? 2 : 0 }}>
        {Object.entries(WEB_SEARCH_PRESETS).map(([key, preset]) => (
          <Tooltip key={key} title={`${preset.name}: ${preset.config.enabled ? `${preset.config.max_searches} searches, ${preset.config.search_context_size} context` : 'Disabled'}`}>
            <Chip
              label={preset.name}
              size="small"
              icon={<Iconify icon={preset.icon} width={14} />}
              onClick={() => handlePresetChange(key)}
              sx={{
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 500,
                bgcolor: getCurrentPreset() === key ? `${preset.color}.main` : 'action.hover',
                color: getCurrentPreset() === key ? 'white' : 'text.secondary',
                border: getCurrentPreset() === key ? 1 : 0,
                borderColor: `${preset.color}.dark`,
                '&:hover': {
                  bgcolor: getCurrentPreset() === key ? `${preset.color}.dark` : 'action.selected',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s',
              }}
            />
          </Tooltip>
        ))}
      </Stack>

      {webSearchEnabled && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={2.5}>
            {/* Provider-Specific Settings */}
            <Box>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {/* OpenAI: Search Context Size */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>
                      CONTEXT SIZE
                    </Typography>
                    <Tooltip title="OpenAI: Amount of web content to retrieve">
                      <Iconify icon="mdi:information-outline" width={12} sx={{ color: 'text.disabled' }} />
                    </Tooltip>
                    {provider?.toLowerCase() === 'openai' && (
                      <Chip label="Active" size="small" sx={{ height: 14, fontSize: '0.6rem', bgcolor: 'info.lighter', color: 'info.darker' }} />
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {['low', 'medium', 'high'].map((size) => (
                      <Chip
                        key={size}
                        label={size}
                        size="small"
                        onClick={() => handleSearchContextSizeChange(size)}
                        sx={{
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          fontSize: '0.7rem',
                          flex: 1,
                          bgcolor: searchContextSize === size ? 'primary.main' : 'background.paper',
                          color: searchContextSize === size ? 'primary.contrastText' : 'text.secondary',
                          border: 1,
                          borderColor: searchContextSize === size ? 'primary.dark' : 'divider',
                          '&:hover': {
                            bgcolor: searchContextSize === size ? 'primary.dark' : 'action.hover',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Max Searches with Slider */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>
                      MAX SEARCHES
                    </Typography>
                    <Tooltip title="Anthropic: Maximum number of search queries">
                      <Iconify icon="mdi:information-outline" width={12} sx={{ color: 'text.disabled' }} />
                    </Tooltip>
                    {provider?.toLowerCase() === 'anthropic' && (
                      <Chip label="Active" size="small" sx={{ height: 14, fontSize: '0.6rem', bgcolor: 'info.lighter', color: 'info.darker' }} />
                    )}
                  </Box>
                  <Box sx={{ px: 1 }}>
                    <Slider
                      value={maxSearches}
                      onChange={(e, val) => handleMaxSearchesChange(val)}
                      min={1}
                      max={20}
                      step={1}
                      marks={[
                        { value: 3, label: '3' },
                        { value: 10, label: '10' },
                        { value: 20, label: '20' },
                      ]}
                      valueLabelDisplay="auto"
                      size="small"
                      sx={{
                        '& .MuiSlider-markLabel': { fontSize: '0.65rem' },
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Common Options */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
                RESPONSE OPTIONS
              </Typography>
              <Stack direction="row" spacing={2}>
                <Tooltip title="Include citation links in the agent's response">
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={includeSources}
                        onChange={(e) => handleIncludeSourcesChange(e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Iconify icon="mdi:link-variant" width={14} />
                        <Typography variant="caption" sx={{ fontSize: '0.73rem' }}>
                          Include sources
                        </Typography>
                      </Box>
                    }
                  />
                </Tooltip>
                <Tooltip title="Show search actions performed by the agent">
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={includeActions}
                        onChange={(e) => handleIncludeActionsChange(e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Iconify icon="mdi:history" width={14} />
                        <Typography variant="caption" sx={{ fontSize: '0.73rem' }}>
                          Show actions
                        </Typography>
                      </Box>
                    }
                  />
                </Tooltip>
              </Stack>
            </Box>

            {/* Advanced Options Toggle */}
            <Box>
              <Button
                size="small"
                onClick={() => setWebSearchExpanded(!webSearchExpanded)}
                startIcon={<Iconify icon={webSearchExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
                sx={{
                  fontSize: '0.72rem',
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                endIcon={
                  (allowedDomains.length > 0 || blockedDomains.length > 0 || userLocation.city) && (
                    <Chip
                      label={(allowedDomains.length + blockedDomains.length + (userLocation.city ? 1 : 0))}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        bgcolor: 'warning.lighter',
                        color: 'warning.darker',
                      }}
                    />
                  )
                }
              >
                Advanced Options
              </Button>

              {webSearchExpanded && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={2.5}>
                    {/* Location Context - Enhanced */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Iconify icon="mdi:map-marker" width={16} sx={{ color: detectedLocation ? 'success.main' : 'text.secondary' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600 }}>
                            USER LOCATION
                          </Typography>
                          <Tooltip title="Provide location context for localized search results">
                            <Iconify icon="mdi:information-outline" width={12} sx={{ color: 'text.disabled' }} />
                          </Tooltip>
                          {detectedLocation && (
                            <Chip
                              label="Auto-detected"
                              size="small"
                              icon={<Iconify icon="mdi:check-circle" width={10} />}
                              sx={{
                                height: 16,
                                fontSize: '0.6rem',
                                bgcolor: 'success.lighter',
                                color: 'success.darker',
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Auto-detect from IP">
                            <IconButton
                              size="small"
                              onClick={handleAutoDetectLocation}
                              disabled={detectingLocation}
                              sx={{
                                bgcolor: 'primary.lighter',
                                '&:hover': { bgcolor: 'primary.light' },
                                width: 28,
                                height: 28,
                              }}
                            >
                              {detectingLocation ? (
                                <CircularProgress size={14} />
                              ) : (
                                <Iconify icon="mdi:crosshairs-gps" width={16} sx={{ color: 'primary.main' }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          {(userLocation.city || userLocation.region || userLocation.country) && (
                            <Tooltip title="Clear location">
                              <IconButton
                                size="small"
                                onClick={handleClearLocation}
                                sx={{
                                  bgcolor: 'error.lighter',
                                  '&:hover': { bgcolor: 'error.light' },
                                  width: 28,
                                  height: 28,
                                }}
                              >
                                <Iconify icon="mdi:close" width={14} sx={{ color: 'error.main' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>

                      {locationError && (
                        <Alert
                          severity="warning"
                          sx={{ mb: 1.5, py: 0.5, fontSize: '0.7rem' }}
                          onClose={() => setLocationError(null)}
                        >
                          {locationError}
                        </Alert>
                      )}

                      <Stack spacing={1.5}>
                        {/* City - Freetype with autocomplete suggestions */}
                        <Autocomplete
                          freeSolo
                          size="small"
                          options={[]}
                          value={userLocation.city || ''}
                          onInputChange={(event, newValue) => handleLocationChange('city', newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="City (e.g., San Francisco)"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Iconify icon="mdi:city" width={14} sx={{ color: 'text.disabled' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ '& input': { fontSize: '0.75rem' } }}
                            />
                          )}
                        />

                        {/* Region - Freetype */}
                        <Autocomplete
                          freeSolo
                          size="small"
                          options={[]}
                          value={userLocation.region || ''}
                          onInputChange={(event, newValue) => handleLocationChange('region', newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Region/State (e.g., California)"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Iconify icon="mdi:map-outline" width={14} sx={{ color: 'text.disabled' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ '& input': { fontSize: '0.75rem' } }}
                            />
                          )}
                        />

                        {/* Country - Autocomplete with common countries */}
                        <Autocomplete
                          freeSolo
                          size="small"
                          options={COUNTRIES}
                          value={userLocation.country || ''}
                          onChange={(event, newValue) => {
                            if (typeof newValue === 'object' && newValue !== null) {
                              handleLocationChange('country', newValue.code);
                            } else {
                              handleLocationChange('country', newValue);
                            }
                          }}
                          onInputChange={(event, newValue) => {
                            if (!newValue || newValue.length <= 3) {
                              handleLocationChange('country', newValue);
                            }
                          }}
                          getOptionLabel={(option) => {
                            if (typeof option === 'object') {
                              return `${option.label} (${option.code})`;
                            }
                            const country = COUNTRIES.find((c) => c.code === option);
                            return country ? `${country.label} (${country.code})` : option;
                          }}
                          renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ fontSize: '0.75rem' }}>
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {option.label}
                              </Typography>
                              <Chip
                                label={option.code}
                                size="small"
                                sx={{
                                  ml: 1,
                                  height: 16,
                                  fontSize: '0.65rem',
                                  bgcolor: 'grey.200',
                                }}
                              />
                            </Box>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Country Code (e.g., US)"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Iconify icon="mdi:earth" width={14} sx={{ color: 'text.disabled' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ '& input': { fontSize: '0.75rem' } }}
                            />
                          )}
                        />

                        {/* Timezone - Autocomplete with common timezones */}
                        <Autocomplete
                          freeSolo
                          size="small"
                          options={TIMEZONES}
                          value={userLocation.timezone || ''}
                          onChange={(event, newValue) => handleLocationChange('timezone', newValue)}
                          onInputChange={(event, newValue) => handleLocationChange('timezone', newValue)}
                          renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ fontSize: '0.75rem' }}>
                              {option}
                            </Box>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Timezone (e.g., America/New_York)"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Iconify icon="mdi:clock-outline" width={14} sx={{ color: 'text.disabled' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ '& input': { fontSize: '0.75rem' } }}
                              helperText={
                                userLocation.timezone && (
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                                    Current time: {new Date().toLocaleTimeString('en-US', { timeZone: userLocation.timezone })}
                                  </Typography>
                                )
                              }
                            />
                          )}
                        />
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Domain Filters */}
                    <Box>
                      <Button
                        size="small"
                        onClick={() => setShowFilters(!showFilters)}
                        startIcon={<Iconify icon={showFilters ? 'mdi:filter-off' : 'mdi:filter'} />}
                        sx={{ fontSize: '0.72rem', textTransform: 'none', mb: showFilters ? 1.5 : 0 }}
                      >
                        Domain Filters
                      </Button>

                      {showFilters && (
                        <Stack spacing={2}>
                          {/* Allowed Domains */}
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                              <Iconify icon="mdi:check-circle" width={12} sx={{ color: 'success.main' }} />
                              <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'success.dark' }}>
                                Allowed Domains
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.75, mb: 0.75 }}>
                              <TextField
                                size="small"
                                fullWidth
                                placeholder="e.g., wikipedia.org"
                                value={newAllowedDomain}
                                onChange={(e) => setNewAllowedDomain(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddAllowedDomain()}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Iconify icon="mdi:web" width={14} sx={{ color: 'text.disabled' }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ '& input': { fontSize: '0.72rem' } }}
                              />
                              <IconButton size="small" onClick={handleAddAllowedDomain} sx={{ bgcolor: 'success.lighter' }}>
                                <Iconify icon="mdi:plus" width={16} sx={{ color: 'success.main' }} />
                              </IconButton>
                            </Box>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                              {allowedDomains.map((domain) => (
                                <Chip
                                  key={domain}
                                  label={domain}
                                  size="small"
                                  onDelete={() => handleRemoveAllowedDomain(domain)}
                                  sx={{
                                    fontSize: '0.68rem',
                                    bgcolor: 'success.lighter',
                                    color: 'success.darker',
                                    '& .MuiChip-deleteIcon': { fontSize: '0.9rem' },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>

                          {/* Blocked Domains */}
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                              <Iconify icon="mdi:cancel" width={12} sx={{ color: 'error.main' }} />
                              <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'error.dark' }}>
                                Blocked Domains
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.75, mb: 0.75 }}>
                              <TextField
                                size="small"
                                fullWidth
                                placeholder="e.g., example.com"
                                value={newBlockedDomain}
                                onChange={(e) => setNewBlockedDomain(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddBlockedDomain()}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Iconify icon="mdi:web-off" width={14} sx={{ color: 'text.disabled' }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ '& input': { fontSize: '0.72rem' } }}
                              />
                              <IconButton size="small" onClick={handleAddBlockedDomain} sx={{ bgcolor: 'error.lighter' }}>
                                <Iconify icon="mdi:plus" width={16} sx={{ color: 'error.main' }} />
                              </IconButton>
                            </Box>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                              {blockedDomains.map((domain) => (
                                <Chip
                                  key={domain}
                                  label={domain}
                                  size="small"
                                  onDelete={() => handleRemoveBlockedDomain(domain)}
                                  sx={{
                                    fontSize: '0.68rem',
                                    bgcolor: 'error.lighter',
                                    color: 'error.darker',
                                    '& .MuiChip-deleteIcon': { fontSize: '0.9rem' },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default WebSearchConfig;

