import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';

import CustomDialog from '../../../../components/dialogs/CustomDialog';
import Iconify from '../../../../components/iconify/Iconify';
import { createTemplate, createTemplateVersion } from '../../../../redux/slices/general';
import AddDomainDialog from '../../../dashboard/interfaces/components/AddDomainDialog';

const versionTypes = ['major', 'minor', 'patch'];

function PublishVersionDialog({ open, onClose, altaner, ui = null }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [versionType, setVersionType] = useState('patch');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let templateId = altaner?.template?.id;

      // If no template exists, create one first
      if (!templateId) {
        const template = await dispatch(
          createTemplate({
            id: altaner.id,
            entity_type: 'altaner',
          }),
        );
        templateId = template.id;
      }

      // Create new version
      await dispatch(
        createTemplateVersion(templateId, {
          version: {
            version_type: versionType,
            branch: 'master',
          },
          name: name || undefined,
        }),
      );

      onClose();
    } catch (error) {
      console.error('Failed to publish version:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get domains from both altaner and ui metadata
  const altanerDomains = altaner?.meta_data?.domains ? Object.keys(altaner.meta_data.domains) : [];
  const uiDomains = ui?.meta_data?.domains ? Object.keys(ui.meta_data.domains) : [];

  // Combine and deduplicate domains
  const allCustomDomains = [...new Set([...altanerDomains, ...uiDomains])];

  const defaultDomain = ui?.deployment_url;

  return (
    <>
      <CustomDialog
        open={open}
        onClose={onClose}
        title="Publish New Version"
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Publishing Destination */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                >
                  Publishing to Domains
                </Typography>
                <Stack spacing={1.5}>
                  {/* Default Altan domain */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Iconify
                        icon="mdi:web"
                        sx={{ color: 'primary.main' }}
                      />
                      <Link
                        href={defaultDomain}
                        target="_blank"
                        underline="hover"
                        sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                      >
                        {defaultDomain}
                      </Link>
                      <Chip
                        label="Primary"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 'auto' }}
                      />
                    </Stack>
                  </Box>

                  {/* Custom domains */}
                  {allCustomDomains.length > 0 && (
                    <>
                      {allCustomDomains.map((domain) => (
                        <Box
                          key={domain}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Iconify
                              icon="mdi:web"
                              sx={{ color: 'text.secondary' }}
                            />
                            <Link
                              href={`https://${domain}`}
                              target="_blank"
                              underline="hover"
                              sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                            >
                              {domain}
                            </Link>
                            <Chip
                              label="Custom"
                              size="small"
                              variant="outlined"
                              sx={{ ml: 'auto' }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </>
                  )}

                  {/* Add Domain Button */}
                  <button
                    type="button"
                    onClick={() => setIsDomainDialogOpen(true)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px dashed var(--mui-palette-divider)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      color: 'var(--mui-palette-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--mui-palette-primary-main)';
                      e.target.style.color = 'var(--mui-palette-primary-main)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--mui-palette-divider)';
                      e.target.style.color = 'var(--mui-palette-text-secondary)';
                    }}
                  >
                    <Iconify icon="mdi:plus" />
                    Add Custom Domain
                  </button>
                </Stack>
              </Box>

              {/* Version Name */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Version Name (Optional)
                </Typography>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-input focus:ring-primary border border-divider rounded-lg shadow-sm focus:outline-none"
                  placeholder="e.g., New features release, Bug fixes..."
                  style={{
                    backgroundColor: 'var(--mui-palette-background-paper)',
                    border: '1px solid var(--mui-palette-divider)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              </Box>

              {/* Advanced Settings Toggle */}
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  sx={{
                    cursor: 'pointer',
                    py: 1,
                    '&:hover': { opacity: 0.7 },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600 }}
                  >
                    Advanced Settings
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <Iconify icon={showAdvanced ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                  </IconButton>
                </Stack>

                <Collapse in={showAdvanced}>
                  <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Version Type
                    </Typography>
                    <select
                      value={versionType}
                      onChange={(e) => setVersionType(e.target.value)}
                      style={{
                        backgroundColor: 'var(--mui-palette-background-paper)',
                        border: '1px solid var(--mui-palette-divider)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        outline: 'none',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {versionTypes.map((type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {versionType === 'major' &&
                        'Breaking changes that are not backwards compatible'}
                      {versionType === 'minor' && 'New features that are backwards compatible'}
                      {versionType === 'patch' && 'Bug fixes and minor improvements'}
                    </Typography>
                  </Box>
                </Collapse>
              </Box>
              {/* Action Buttons */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                sx={{ pt: 2 }}
              >
                <Button
                  variant="soft"
                  color="error"
                  onClick={onClose}
                  sx={{
                    minHeight: '40px',
                    px: 3,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="soft"
                  color="inherit"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <Iconify
                        icon="mdi:loading"
                        className="animate-spin"
                      />
                    ) : null
                  }
                  sx={{
                    minHeight: '40px',
                    px: 3,
                    fontWeight: 600,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                    '&:disabled': {
                      opacity: 0.7,
                    },
                  }}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish New Version'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </CustomDialog>

      <AddDomainDialog
        open={isDomainDialogOpen}
        onClose={() => setIsDomainDialogOpen(false)}
        ui={altaner}
      />
    </>
  );
}

PublishVersionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  altaner: PropTypes.object,
  ui: PropTypes.object,
};

export default memo(PublishVersionDialog);
