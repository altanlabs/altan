import { DialogContent, Box, Typography, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { selectAccount } from '../../redux/slices/general';
import { optimai_shop } from '../../utils/axios';
import InteractiveHoverButton from '../agents/InteractiveHoverButton';
import { CustomAvatar } from '../custom-avatar';
import CustomDialog from '../dialogs/CustomDialog';

const TemplateDetailsDialog = ({ open, onClose, templateData }) => {
  const history = useHistory();
  const account = useSelector(selectAccount);
  const [fullTemplate, setFullTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    // Track clone event
    try {
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

    // For free templates, navigate directly to clone page
    if (price === 0) {
      history.push(`/clone/template/${template.id}`);
      onClose();
      return;
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

  const coverUrl = getCoverUrl();

  return (
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
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'flex-start',
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
                  onClick={() => {
                    if (template?.account?.id) {
                      history.push(`/accounts/${template.account.id}`);
                      onClose();
                    }
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
                  />
                  <Box sx={{ flex: 1, minWidth: 0, ml: 2 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      By {template?.account?.name || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Preview Section */}
            {template?.meta_data?.video_url ? (
              <Box sx={{ px: 1 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 'calc(100vh - 200px)', // Use viewport height minus space for header and footer
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
              <Box sx={{ px: 1 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 'calc(100vh - 200px)', // Use viewport height minus space for header and footer
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
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
              <Box sx={{ px: 3, pb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <img
                    src={coverUrl}
                    alt={name}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '60%',
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

      <Box sx={{ p: 3, pt: 1, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <InteractiveHoverButton
            text={
              loading
                ? 'Loading...'
                : `${price === 0 ? 'Get Template' : `Purchase Template · ${formatPrice(price)}`}`
            }
            onClick={handleClone}
            disabled={loading}
            sx={{ width: '100%', maxWidth: 500 }}
          />
        </Box>
      </Box>
    </CustomDialog>
  );
};

TemplateDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  templateData: PropTypes.object,
};

export default TemplateDetailsDialog;
