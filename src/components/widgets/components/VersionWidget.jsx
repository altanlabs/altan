import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { memo, useEffect } from 'react';

import {
  fetchTemplateVersion,
  selectTemplateVersion,
  selectTemplateVersionLoading,
  selectTemplateVersionError,
} from '../../../redux/slices/templateVersions';
import { useDispatch, useSelector } from '../../../redux/store.ts';
import Iconify from '../../iconify/Iconify.jsx';

const VersionWidget = ({ id }) => {
  const dispatch = useDispatch();
  const templateVersion = useSelector(selectTemplateVersion(id));
  const loading = useSelector(selectTemplateVersionLoading(id));
  const error = useSelector(selectTemplateVersionError(id));

  useEffect(() => {
    if (id) {
      dispatch(fetchTemplateVersion(id));
    }
  }, [id, dispatch]);

  const handlePreviewClick = () => {
    const url = templateVersion?.build_metadata?.url;
    if (url) {
      window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <Card
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
        }}
      >
        <CircularProgress size={24} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 2 }}>
        <Alert
          severity="error"
          sx={{ fontSize: '0.75rem' }}
        >
          {error}
        </Alert>
      </Card>
    );
  }

  if (!templateVersion) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ fontSize: '0.75rem' }}
        >
          No template version data available
        </Typography>
      </Card>
    );
  }

  // Extract version info
  const versionString = templateVersion?.version_string || templateVersion?.version || 'Unknown';

  // Check if URL is available for clicking
  const hasPreviewUrl = templateVersion?.build_metadata?.url;

  // Extract additional metadata
  const tags = templateVersion?.public_details?.tags || [];
  const updatedAt = templateVersion?.date_creation;

  return (
    <Card
      onClick={hasPreviewUrl ? handlePreviewClick : undefined}
      sx={{
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mt: 1,
        transition: 'all 0.2s ease-in-out',
        cursor: hasPreviewUrl ? 'pointer' : 'default',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          boxShadow: hasPreviewUrl ? 4 : 2,
          borderColor: 'primary.main',
          transform: hasPreviewUrl ? 'translateY(-2px)' : 'none',
          background: hasPreviewUrl
            ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)'
            : undefined,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header with title and version */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Typography variant="h6">Version</Typography>
            <Chip
              label={`v${versionString}`}
              size="small"
            />
          </Stack>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.3,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {templateVersion?.name}
          </Typography>
        </Stack>

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  fontSize: '0.625rem',
                  height: 18,
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                }}
              />
            ))}
            {tags.length > 3 && (
              <Chip
                label={`+${tags.length - 3}`}
                size="small"
                sx={{
                  fontSize: '0.625rem',
                  height: 18,
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                }}
              />
            )}
          </Box>
        )}

        {/* Footer with metadata */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify
              icon="eva:clock-outline"
              width={14}
              color="text.disabled"
            />
            <Typography
              variant="caption"
              color="text.disabled"
            >
              {updatedAt ? new Date(updatedAt).toLocaleDateString() : 'Unknown date'}
            </Typography>
          </Box>

          {hasPreviewUrl && (
            <Typography
              variant="caption"
              color="primary.main"
              sx={{ fontWeight: 600 }}
            >
              Click to preview
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default memo(VersionWidget, (prevProps, nextProps) => {
  // Only re-render if id changes
  return prevProps.id === nextProps.id;
});
