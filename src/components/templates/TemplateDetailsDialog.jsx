import { DialogContent, Box, Typography, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { useAuthContext } from '../../auth/useAuthContext';
import { selectAccount, selectIsAccountFree } from '../../redux/slices/general';
import { optimai_shop } from '../../utils/axios';
import { useAnalytics } from '../../hooks/useAnalytics';
import InteractiveHoverButton from '../agents/InteractiveHoverButton';
import { CustomAvatar } from '../custom-avatar';
import CustomDialog from '../dialogs/CustomDialog';
import UpgradeDialog from '../dialogs/UpgradeDialog';

const TemplateDetailsDialog = ({ open, onClose, templateData }) => {
  const history = useHistory();
  const { isAuthenticated } = useAuthContext();
  const account = useSelector(selectAccount);
  const isAccountFree = useSelector(selectIsAccountFree);
  const analytics = useAnalytics();
  const [fullTemplate, setFullTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Fetch full template details when dialog opens
  const fetchTemplateDetails = useCallback(async (templateId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await optimai_shop.get(`/v2/templates/${templateId}`);
      if (response?.data?.template) {
        setFullTemplate(response.data.template);
      } else {
        setError('Template details not found');
      }
    } catch (err) {
      console.error('Error fetching template details:', err);
      setError('Failed to load template details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch template details when dialog opens and templateData changes
  useEffect(() => {
    if (open && templateData?.id) {
      fetchTemplateDetails(templateData.id);
    } else if (!open) {
      // Reset state when dialog closes
      setFullTemplate(null);
      setError(null);
    }
  }, [open, templateData?.id, fetchTemplateDetails]);

  if (!templateData) return null;

  // Use fullTemplate if available, otherwise fall back to templateData
  const template = fullTemplate || templateData;

  const name = template?.parent?.name || template.name || template.public_name || 'Unnamed Template';
  const price = template.price || 0;

  const formatPrice = (priceInCents) => {
    if (!priceInCents && priceInCents !== 0) return 'Price not available';
    if (priceInCents === 0) return 'Free';
    const priceInEuros = priceInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(priceInEuros);
  };

  const getCoverUrl = () => {
    if (template?.cover_url) return template.cover_url;
    if (template?.meta_data?.cover_url) return template.meta_data.cover_url;
    return 'https://cdn.altan.ai/templates/default-cover.jpg';
  };

  const handleClone = async () => {
    // Check if account is free and show upgrade dialog
    if (isAccountFree) {
      setShowUpgradeDialog(true);
      return;
    }

    // Track clone event
    try {
      // Track with PostHog
      analytics.trackCloneTemplate(template.id, name, {
        template_price: price,
        template_category: template.category,
      });

      // Track with Google Analytics (existing)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'clone_template', {
          template_id: template.id,
          template_name: name,
          template_price: price,
        });
      }
    } catch (error) {
      console.error('Error tracking template clone:', error);
    }
    // For paid templates, initiate Stripe checkout flow
    try {
      if (!account?.id) {
        console.error('No account ID available for checkout');
        return;
      }

      const response = await optimai_shop.post(
        `/v2/stripe/checkout/template?template_id=${template.id}&account_id=${account.id}`,
      );

      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Invalid response from checkout endpoint');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      // Fallback: still navigate to clone page if checkout fails
      history.push(`/clone/template/${template.id}`);
      onClose();
    }
  };

  const handleCloseUpgradeDialog = () => {
    setShowUpgradeDialog(false);
  };

  const coverUrl = getCoverUrl();

  return (
    <>
      <CustomDialog
        open={open}
        onClose={onClose}
        alwaysFullScreen
      >
      <DialogContent sx={{ p: 0 }}>
        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
              p: 3,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography
              variant="h6"
              color="error"
              gutterBottom
            >
              Error Loading Template
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {error}
            </Typography>
          </Box>
        )}

        {/* Content - only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Header with close button */}
            <Box
              sx={{
                pl: 1.5,
                pr: 6,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Box
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    history.push(`/accounts/${template.account.id}`);
                  }}
                  sx={{
                    cursor: template?.account?.id ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': template?.account?.id ? {
                      opacity: 0.8,
                    } : {},
                  }}
                >
                  <CustomAvatar
                    src={template?.account?.logo_url || coverUrl}
                    name={template?.account?.name || 'Unknown'}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0, ml: 0.75 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1,
                      }}
                    >
                      {name}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Clone Button in Header */}
              <Box sx={{ ml: 0.5 }}>
                <InteractiveHoverButton
                  text={
                    loading
                      ? 'Loading...'
                      : `${price === 0 ? 'Clone Free' : `Purchase ${formatPrice(price)}`}`
                  }
                  onClick={handleClone}
                  disabled={loading}
                  sx={{
                    minWidth: { xs: 85, sm: 100, md: 250 },
                    height: 28,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
            </Box>

            {/* Preview Section */}
            {template?.meta_data?.video_url ? (
              <Box
                sx={{
                  height: 'calc(100vh - 45px)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                  }}
                >
                  <ReactPlayer
                    url={template.meta_data.video_url}
                    width="100%"
                    height="100%"
                    controls
                    playing={false}
                    light={false}
                    config={{
                      youtube: {
                        playerVars: {
                          showinfo: 1,
                          modestbranding: 1,
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            ) : template?.preview_url ? (
              <Box
                sx={{
                  height: 'calc(100vh - 45px)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={template.preview_url}
                    title={`${name} Preview`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 0,
                    }}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    allowFullScreen
                  />
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  height: 'calc(100vh - 45px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxHeight: 300,
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    p: 3,
                  }}
                >
                  <img
                    src={coverUrl}
                    alt={name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Preview not available
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      </CustomDialog>

      {/* Upgrade Required Dialog */}
      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={handleCloseUpgradeDialog}
        sx={{ zIndex: 10001 }}
      />
    </>
  );
};

TemplateDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  templateData: PropTypes.object,
};

export default TemplateDetailsDialog;
