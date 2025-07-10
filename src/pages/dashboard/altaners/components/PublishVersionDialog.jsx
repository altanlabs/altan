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
  console.log('open', open);
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
        dialogOpen={open}
        onClose={onClose}
        className="min-h-[500px] max-w-[500px]"
      >
        <Box sx={{ p: 3, minHeight: '500px', width: '100%' }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Publish New Version
          </Typography>

          {/* Simplified explanation for first-time users */}
          {!defaultDomain && allCustomDomains.length === 0 && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              icon={<Iconify icon="mdi:information" />}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Publishing will create a public domain that you can share with others.
              </Typography>
            </Alert>
          )}

          {/* Simplified general explanation */}
          {(defaultDomain || allCustomDomains.length > 0) && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Deploy your latest changes to all configured domains.
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Publishing Destination */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                >
                  {defaultDomain || allCustomDomains.length > 0
                    ? 'Publishing to Domains'
                    : 'Deployment'}
                </Typography>
                <Stack spacing={1.5}>
                  {/* Show message for first-time users */}
                  {!defaultDomain && allCustomDomains.length === 0 && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50',
                        border: '1px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <Iconify
                          icon="mdi:rocket-launch"
                          sx={{ color: 'primary.main' }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500 }}
                        >
                          A public domain will be created automatically
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {/* Default Altan domain */}
                  {defaultDomain && (
                    <Box
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
                  )}

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
                    {/* Version Name */}
                    <Box sx={{ mb: 3 }}>
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
                        placeholder="e.g., New features release, Bug fixes..."
                        style={{
                          backgroundColor: 'var(--mui-palette-background-paper)',
                          border: '1px solid var(--mui-palette-divider)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          outline: 'none',
                          width: '100%',
                          minHeight: '40px',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s ease',
                        }}
                      />
                    </Box>

                    {/* Version Type */}
                    <Box>
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
                  variant="outlined"
                  color="inherit"
                  onClick={onClose}
                  sx={{
                    minHeight: '44px',
                    px: 3,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <Iconify
                        icon="mdi:loading"
                        className="animate-spin"
                      />
                    ) : (
                      <Iconify icon="mdi:rocket-launch" />
                    )
                  }
                  sx={{
                    minHeight: '44px',
                    px: 4,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)',
                    },
                    '&:disabled': {
                      opacity: 0.7,
                      transform: 'none',
                    },
                  }}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Version'}
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
