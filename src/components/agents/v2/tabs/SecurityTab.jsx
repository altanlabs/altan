import {
  Box,
  Typography,
  Switch,
  TextField,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import Iconify from '../../../iconify';

const OVERRIDE_OPTIONS = [
  { id: 'language', label: 'Language' },
  { id: 'first_message', label: 'First Message' },
  { id: 'prompt', label: 'Prompt' },
  { id: 'voice', label: 'Voice' },
];

function SecurityTab({ agentData, onFieldChange }) {
  const [newOrigin, setNewOrigin] = useState('');
  
  const securityConfig = agentData?.security || {};
  const allowedOrigins = securityConfig.allowed_origins || [];
  const enableOverrides = securityConfig.enable_overrides || ['language', 'first_message', 'prompt', 'voice'];
  const isPublic = agentData?.is_public ?? true;

  const handleIsPublicChange = (checked) => {
    onFieldChange('is_public', checked);
  };

  const handleSecurityChange = (field, value) => {
    const newSecurity = { ...securityConfig, [field]: value };
    onFieldChange('security', newSecurity);
  };

  const handleAddOrigin = () => {
    if (newOrigin.trim() && !allowedOrigins.includes(newOrigin.trim())) {
      const updatedOrigins = [...allowedOrigins, newOrigin.trim()];
      handleSecurityChange('allowed_origins', updatedOrigins);
      setNewOrigin('');
    }
  };

  const handleRemoveOrigin = (originToRemove) => {
    const updatedOrigins = allowedOrigins.filter(origin => origin !== originToRemove);
    handleSecurityChange('allowed_origins', updatedOrigins);
  };

  const handleOverridesChange = (event) => {
    const value = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
    handleSecurityChange('enable_overrides', value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddOrigin();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left Panel: Configuration */}
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        <Box sx={{ p: 2, pb: { xs: 10, md: 2 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Privacy Card */}
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
              Privacy
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Control the visibility and accessibility of your agent.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                  Public Agent
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  Allow anyone to discover and interact with this agent
                </Typography>
              </Box>
              <Switch
                checked={isPublic}
                onChange={(e) => handleIsPublicChange(e.target.checked)}
              />
            </Box>
          </Box>

          {/* Access Control Card */}
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
              Access Control
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Configure which domains can embed and access your agent.
            </Typography>

            {/* Allowed Origins */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', mb: 2 }}
              >
                Allowed Origins
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Specify domains that are allowed to embed this agent. Leave empty to allow all origins.
              </Typography>

              {/* Add Origin Input */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="https://example.com"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={handleAddOrigin}
                  disabled={!newOrigin.trim()}
                  sx={{ color: 'primary.main' }}
                >
                  <Iconify icon="eva:plus-fill" />
                </IconButton>
              </Box>

              {/* Origins List */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allowedOrigins.map((origin, index) => (
                  <Chip
                    key={index}
                    label={origin}
                    onDelete={() => handleRemoveOrigin(origin)}
                    deleteIcon={<Iconify icon="eva:close-fill" />}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {allowedOrigins.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    No origins specified - all origins allowed
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Customization Control Card */}
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
              Customization Control
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3 }}
            >
              Control which aspects of your agent can be overridden when embedded.
            </Typography>

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', mb: 2 }}
              >
                Enable Overrides
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Select which properties can be customized by the embedder.
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Allowed Overrides</InputLabel>
                <Select
                  multiple
                  value={enableOverrides}
                  onChange={handleOverridesChange}
                  input={<OutlinedInput label="Allowed Overrides" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const option = OVERRIDE_OPTIONS.find(opt => opt.id === value);
                        return (
                          <Chip 
                            key={value} 
                            label={option?.label || value} 
                            size="small" 
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {OVERRIDE_OPTIONS.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}

SecurityTab.propTypes = {
  agentData: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
};

export default memo(SecurityTab); 