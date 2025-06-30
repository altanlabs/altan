/* eslint-disable react/display-name */
import { Box, Typography, Card, CircularProgress, Alert } from '@mui/material';
import { memo, useState, useEffect } from 'react';

import { optimai } from '../../../utils/axios.js';

const VersionWidget = memo(({ id }) => {
  const [templateVersion, setTemplateVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplateVersion = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await optimai.get(`/templates/versions/${id}`);
        setTemplateVersion(response.data.template_version);
        setError(null);
      } catch (error) {
        console.error('Error fetching template version:', error);
        setError('Failed to load template version');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateVersion();
  }, [id]);

  const handlePreviewClick = () => {
    const url = templateVersion?.build_metadata?.url;
    if (url) {
      window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
        <CircularProgress size={20} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 1.5 }}>
        <Alert severity="error" sx={{ fontSize: '0.75rem' }}>
          {error}
        </Alert>
      </Card>
    );
  }

  if (!templateVersion) {
    return (
      <Card sx={{ p: 1.5 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontSize: '0.75rem' }}>
          No template version data available
        </Typography>
      </Card>
    );
  }

  // Extract template name from different possible sources
  const templateName =
    templateVersion?.public_details?.name ||
    templateVersion?.name?.replace(/\n/g, ' ') ||
    'Unnamed Template';

  // Extract cover URL from build metadata
  const coverUrl =
    templateVersion?.build_metadata?.meta_data?.cover_url ||
    '/assets/placeholder.svg';

  // Extract version info
  const versionString = templateVersion?.version_string || templateVersion?.version || 'Unknown';

  // Check if URL is available for clicking
  const hasPreviewUrl = templateVersion?.build_metadata?.url;

  return (
    <Card
      onClick={hasPreviewUrl ? handlePreviewClick : undefined}
      sx={{
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        cursor: hasPreviewUrl ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: hasPreviewUrl ? 2 : 1,
          borderColor: 'primary.main',
          transform: hasPreviewUrl ? 'translateY(-1px)' : 'none',
        },
      }}
    >
      {/* Cover Image */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 250,
          overflow: 'hidden',
          bgcolor: 'grey.100',
        }}
      >
        <img
          src={coverUrl}
          alt={templateName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          onError={(e) => {
            e.target.src = '/assets/placeholder.svg';
          }}
        />

        {/* Version Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            px: 0.75,
            py: 0.25,
            borderRadius: 0.75,
            fontSize: '0.6875rem',
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          v{versionString}
        </Box>

        {/* Preview indicator */}
        {hasPreviewUrl && (
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              left: 6,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: 'primary.main',
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
            }}
          >
            ↗
          </Box>
        )}
      </Box>

    </Card>
  );
});

export default VersionWidget;
