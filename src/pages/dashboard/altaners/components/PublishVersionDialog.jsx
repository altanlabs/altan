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
import { optimai_pods } from '../../../../utils/axios';

const versionTypes = ['major', 'minor', 'patch'];

// Social sharing configurations
const socialPlatforms = [
  {
    name: 'WhatsApp',
    icon: 'mdi:whatsapp',
    color: '#25D366',
    getUrl: (url) => `https://wa.me/?text=${encodeURIComponent(`Check this out: ${url}`)}`,
  },
  {
    name: 'Twitter',
    icon: 'mdi:twitter',
    color: '#1DA1F2',
    getUrl: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this AI agent!')}`,
  },
  {
    name: 'LinkedIn',
    icon: 'mdi:linkedin',
    color: '#0A66C2',
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    icon: 'mdi:facebook',
    color: '#1877F2',
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

function PublishVersionDialog({ open, onClose, altaner, ui = null }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [versionType, setVersionType] = useState('patch');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async (url) => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this AI Agent',
          text: `Try out this AI agent built with Altan:`,
          url,
        });
      } catch (err) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: just copy to clipboard if Web Share API not available
      handleCopyUrl(url);
    }
  };

  const handleShare = (platform, url) => {
    const shareUrl = platform.getUrl(url);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the interface ID from ui prop
      const interfaceId = ui?.id;
      
      if (!interfaceId) {
        throw new Error('Interface ID is required');
      }

      // Publish interface using optimai_pods
      await optimai_pods.post(`/interfaces/${interfaceId}/publish`, null, {
        params: {
          message: name || 'New version',
          subdomain: ui?.name || '',
        },
      });

      onClose();
    } catch (error) {
      console.error('Failed to publish interface:', error);
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
                      <Stack spacing={1.5}>
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
                            sx={{ fontFamily: 'monospace', fontSize: '0.875rem', flex: 1 }}
                          >
                            {defaultDomain}
                          </Link>
                          <Chip
                            label="Primary"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>

                        {/* Native Share & Social buttons */}
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ pl: 4 }}
                        >
                          {/* Primary Native Share Button */}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Iconify icon="mdi:share-variant" />}
                            onClick={() => handleNativeShare(defaultDomain)}
                            sx={{
                              borderRadius: 1,
                              textTransform: 'none',
                              fontWeight: 500,
                              borderColor: 'divider',
                              color: 'text.secondary',
                              '&:hover': {
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                bgcolor: (theme) =>
                                  theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50',
                              },
                            }}
                          >
                            Share
                          </Button>

                          <Box sx={{ mx: 0.5, height: 16, width: '1px', bgcolor: 'divider' }} />

                          {/* Quick action icons */}
                          {socialPlatforms.slice(0, 2).map((platform) => (
                            <IconButton
                              key={platform.name}
                              size="small"
                              onClick={() => handleShare(platform, defaultDomain)}
                              sx={{
                                color: 'text.secondary',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  color: platform.color,
                                  transform: 'scale(1.1)',
                                },
                              }}
                              title={`Share on ${platform.name}`}
                            >
                              <Iconify
                                icon={platform.icon}
                                width={18}
                              />
                            </IconButton>
                          ))}
                          <IconButton
                            size="small"
                            onClick={() => handleCopyUrl(defaultDomain)}
                            sx={{
                              color: copiedUrl === defaultDomain ? 'success.main' : 'text.secondary',
                              transition: 'all 0.2s',
                              '&:hover': {
                                color: 'primary.main',
                                transform: 'scale(1.1)',
                              },
                            }}
                            title="Copy link"
                          >
                            <Iconify
                              icon={copiedUrl === defaultDomain ? 'mdi:check' : 'mdi:content-copy'}
                              width={16}
                            />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Box>
                  )}

                  {/* Custom domains */}
                  {allCustomDomains.length > 0 && (
                    <>
                      {allCustomDomains.map((domain) => {
                        const fullDomain = `https://${domain}`;
                        return (
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
                            <Stack spacing={1.5}>
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
                                  href={fullDomain}
                                  target="_blank"
                                  underline="hover"
                                  sx={{ fontFamily: 'monospace', fontSize: '0.875rem', flex: 1 }}
                                >
                                  {domain}
                                </Link>
                                <Chip
                                  label="Custom"
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>

                              {/* Native Share & Social buttons */}
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ pl: 4 }}
                              >
                                {/* Primary Native Share Button */}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Iconify icon="mdi:share-variant" />}
                                  onClick={() => handleNativeShare(fullDomain)}
                                  sx={{
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    borderColor: 'divider',
                                    color: 'text.secondary',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      color: 'primary.main',
                                      bgcolor: (theme) =>
                                        theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50',
                                    },
                                  }}
                                >
                                  Share
                                </Button>

                                <Box sx={{ mx: 0.5, height: 16, width: '1px', bgcolor: 'divider' }} />

                                {/* Quick action icons */}
                                {socialPlatforms.slice(0, 2).map((platform) => (
                                  <IconButton
                                    key={platform.name}
                                    size="small"
                                    onClick={() => handleShare(platform, fullDomain)}
                                    sx={{
                                      color: 'text.secondary',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        color: platform.color,
                                        transform: 'scale(1.1)',
                                      },
                                    }}
                                    title={`Share on ${platform.name}`}
                                  >
                                    <Iconify
                                      icon={platform.icon}
                                      width={18}
                                    />
                                  </IconButton>
                                ))}
                                <IconButton
                                  size="small"
                                  onClick={() => handleCopyUrl(fullDomain)}
                                  sx={{
                                    color: copiedUrl === fullDomain ? 'success.main' : 'text.secondary',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      color: 'primary.main',
                                      transform: 'scale(1.1)',
                                    },
                                  }}
                                  title="Copy link"
                                >
                                  <Iconify
                                    icon={copiedUrl === fullDomain ? 'mdi:check' : 'mdi:content-copy'}
                                    width={16}
                                  />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                        );
                      })}
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
        ui={ui}
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
