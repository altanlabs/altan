import {
  Box,
  Drawer,
  Stack,
  Typography,
  IconButton,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import { useDispatch } from 'react-redux';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { markTemplateVersionAsSelected } from '../../redux/slices/general';
import { fToNow } from '../../utils/formatTime';
import Iconify from '../iconify';

const StyledListItem = styled(ListItem)(({ theme, isSelected }) => ({
  borderLeft: `4px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
  marginBottom: theme.spacing(1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    '& .restore-button': {
      opacity: 1,
    },
  },
}));

const RestoreButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  minWidth: 'auto',
  padding: theme.spacing(0.5, 1),
  fontSize: '0.75rem',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const CurrentBadge = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0.25, 0.75),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  color: theme.palette.text.primary,
}));

const VersionTag = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0.25, 0.75),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '&:hover .preview-overlay': {
    opacity: 1,
  },
}));

const PreviewOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
}));

const VersionHistoryDrawer = ({ open, onClose, versions = [], selectedVersionId }) => {
  console.log('versions', versions);
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const dispatch = useDispatch();

  if (!open) return null;

  const sortedVersions = [...(versions?.items || [])].sort(
    (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
  );

  const handleRestoreVersion = async (templateId, versionId) => {
    if (versionId === selectedVersionId) return;

    await dispatchWithFeedback(dispatch(markTemplateVersionAsSelected(templateId, versionId)), {
      successMessage: 'Version restored successfully',
      errorMessage: 'Failed to restore version',
    });
  };

  const handlePreviewClick = (url) => {
    window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Version History</Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              p: 0.5,
              '&:hover': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
              },
            }}
          >
            <Iconify
              icon="eva:close-fill"
              width={20}
              height={20}
            />
          </IconButton>
        </Stack>

        {/* Version List */}
        <Stack spacing={1}>
          {sortedVersions.map((version) => {
            const isSelected = version.id === selectedVersionId;
            const timeAgo = fToNow(version.date_creation);
            const hasPreview = version.build_metadata?.meta_data?.cover_url;
            const hasPreviewUrl = version.build_metadata?.url;

            return (
              <StyledListItem
                key={version.id}
                isSelected={isSelected}
              >
                <RestoreButton
                  className="restore-button"
                  onClick={() => handleRestoreVersion(version.template_id, version.id)}
                  startIcon={
                    <Iconify
                      icon="eva:refresh-fill"
                      width={16}
                      height={16}
                    />
                  }
                >
                  Restore
                </RestoreButton>

                <ListItemText
                  primary={
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 0.5 }}
                    >
                      <VersionTag>
                        v{version.version_string} · {version.name}
                      </VersionTag>
                      {isSelected && <CurrentBadge>Current</CurrentBadge>}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={1}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {timeAgo}
                      </Typography>

                      {hasPreview && (
                        <PreviewContainer>
                          <img
                            src={
                              version.deployment?.cover_url ||
                              version.build_metadata?.meta_data?.cover_url
                            }
                            alt={`Preview of version ${version.version_string}`}
                            style={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          {hasPreviewUrl && (
                            <PreviewOverlay className="preview-overlay">
                              <IconButton
                                onClick={() => handlePreviewClick(version.build_metadata.url)}
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                                  color: 'text.primary',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 1)',
                                  },
                                }}
                              >
                                <Iconify
                                  icon="eva:external-link-fill"
                                  width={20}
                                  height={20}
                                />
                              </IconButton>
                            </PreviewOverlay>
                          )}
                        </PreviewContainer>
                      )}
                    </Stack>
                  }
                />
              </StyledListItem>
            );
          })}
        </Stack>
      </Box>
    </Drawer>
  );
};

export default VersionHistoryDrawer;
