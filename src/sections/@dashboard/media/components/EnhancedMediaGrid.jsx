import { Typography, Box, Stack, Divider, Button, Chip, IconButton } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import RenderPreview from './RenderPreview';
import SkeletonMediaItem from './skeletons/SkeletonMediaItem';
import { API_BASE_URL } from '../../../../auth/utils.ts';
import Iconify from '../../../../components/iconify';
import { getMedia, deleteMedia } from '../../../../redux/slices/media';
import { dispatch } from '../../../../redux/store.ts';

const DRAWER_MODES = ['custom_message', 'drawer'];
const MEDIA_PAGE_MODE = 'default';
const MEDIA_BASE_URL = `${API_BASE_URL}/platform/media`;

// Utility functions
const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatUploadDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return 'material-symbols:description-outline';

  const type = mimeType.toLowerCase();
  if (type.startsWith('image/')) return 'material-symbols:image-outline';
  if (type.startsWith('video/')) return 'material-symbols:videocam-outline';
  if (type.startsWith('audio/')) return 'material-symbols:audio-file-outline';
  if (type.includes('pdf')) return 'material-symbols:picture-as-pdf-outline';
  if (type.includes('document') || type.includes('word'))
    return 'material-symbols:description-outline';
  if (type.includes('spreadsheet') || type.includes('excel'))
    return 'material-symbols:table-chart-outline';
  if (type.includes('presentation') || type.includes('powerpoint'))
    return 'material-symbols:slideshow-outline';
  if (type.includes('text')) return 'material-symbols:text-snippet-outline';
  if (type.includes('zip') || type.includes('rar') || type.includes('archive'))
    return 'material-symbols:folder-zip-outline';

  return 'material-symbols:description-outline';
};

const getFileTypeColor = (mimeType) => {
  if (!mimeType) return '#9CA3AF';

  const type = mimeType.toLowerCase();
  if (type.startsWith('image/')) return '#10B981';
  if (type.startsWith('video/')) return '#3B82F6';
  if (type.startsWith('audio/')) return '#8B5CF6';
  if (type.includes('pdf')) return '#EF4444';
  if (type.includes('document') || type.includes('word')) return '#2563EB';
  if (type.includes('spreadsheet') || type.includes('excel')) return '#059669';
  if (type.includes('presentation') || type.includes('powerpoint')) return '#DC2626';

  return '#9CA3AF';
};

const MediaPreviewModal = memo(({ media, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleCopyUrl = async () => {
    const url = `${MEDIA_BASE_URL}/${media.id}?account_id=${media.account_id}`;
    try {
      await navigator.clipboard.writeText(url);
      // You might want to show a toast notification here
      console.log('URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleDownload = () => {
    const url = `${MEDIA_BASE_URL}/${media.id}?account_id=${media.account_id}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = media?.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this media file?')) {
      setIsDeleting(true);
      try {
        await dispatch(deleteMedia({ mediaId: media.id }));
        // Close modal after successful deletion
        onClose();
      } catch (err) {
        console.error('Failed to delete media:', err);
        // You might want to show an error toast notification here
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Preview Section */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            pt: 12, // Extra top padding to avoid header conflict
          }}
        >
          <Box
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              position: 'relative',
            }}
          >
            <RenderPreview
              mode="modal"
              preview={`${MEDIA_BASE_URL}/${media.id}?account_id=${media.account_id}`}
              fileType={media?.type?.split('/').pop()}
              fileName={media?.name}
              media={media}
            />
          </Box>
        </Box>

        {/* Right Panel */}
        <Box
          sx={{
            width: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            mt: 6, // Top margin to avoid header conflict
            mb: 6, // Bottom margin for symmetry
            mr: 4, // Right margin for spacing from edge
            borderRadius: 3, // Add border radius for better aesthetics
          }}
        >
          {/* Header with close button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '300px',
              }}
            >
              {media?.name || 'Unnamed file'}
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Iconify icon="material-symbols:close" width={24} />
            </IconButton>
          </Box>

          {/* Media Information */}
          <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
            <Stack spacing={3}>
              {/* File Type */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  File Type
                </Typography>
                <Chip
                  label={media?.type || 'Unknown'}
                  sx={{
                    backgroundColor: getFileTypeColor(media?.type),
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              </Box>

              {/* File Size */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  File Size
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'white', fontWeight: 500 }}
                >
                  {formatFileSize(media?.file_size)}
                </Typography>
              </Box>

              {/* Upload Date */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  Uploaded
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'white', fontWeight: 500 }}
                >
                  {formatUploadDate(media?.date_creation)}
                </Typography>
              </Box>

              {/* File ID */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  File ID
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    p: 1,
                    borderRadius: 1,
                    wordBreak: 'break-all',
                  }}
                >
                  {media?.id}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              p: 3,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<Iconify icon="material-symbols:download" />}
                onClick={handleDownload}
                sx={{
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.9)',
                  },
                }}
              >
                Download
              </Button>
              <Button
                variant="contained"
                startIcon={<Iconify icon="material-symbols:content-copy" />}
                onClick={handleCopyUrl}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Copy URL
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Iconify icon="material-symbols:delete-outline" />}
                onClick={handleDelete}
                disabled={isDeleting}
                sx={{
                  backgroundColor: 'rgba(244, 67, 54, 0.8)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.9)',
                  },
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

MediaPreviewModal.displayName = 'MediaPreviewModal';

const MediaCard = memo(({ media, onSelect, mode, selectedMedia, handleSelect }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Open preview on single click
    setShowPreview(true);
  };

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          outline: 'none',
          '&:focus': {
            outline: 'none',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
          },
          '&:focus-visible': {
            outline: 'none',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
        }}
        tabIndex={0}
        onClick={handleCardClick}
      >
        {/* Smart media display - images show thumbnails, others show icons */}
        <Box
          className="group"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
            p: media?.type?.startsWith('image/') ? 0 : 2,
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          {media?.type?.startsWith('image/') ? (
            // Show actual image thumbnail for images
            <Box
              sx={{
                width: '100%',
                height: 160,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
              }}
            >
              <Box
                component="img"
                src={`${MEDIA_BASE_URL}/${media.id}?account_id=${media.account_id}`}
                alt={media?.name || 'Image'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback icon (hidden by default) */}
              <Box
                sx={{
                  display: 'none',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Iconify
                  icon={getFileTypeIcon(media?.type)}
                  sx={{
                    width: 48,
                    height: 48,
                    color: getFileTypeColor(media?.type),
                    mb: 1,
                  }}
                />
              </Box>
            </Box>
          ) : (
            // Show file type icon for non-images
            <>
              <Iconify
                icon={getFileTypeIcon(media?.type)}
                sx={{
                  width: 48,
                  height: 48,
                  color: getFileTypeColor(media?.type),
                  mb: 1,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontWeight: 500,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {media?.name || 'Unnamed file'}
              </Typography>
            </>
          )}
        </Box>

        {/* Media metadata overlay - only show for images on hover */}
        {media?.type?.startsWith('image/') && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
              color: 'white',
              p: 1.5,
              transform: 'translateY(100%)',
              transition: 'transform 0.3s ease',
              '.group:hover &': {
                transform: 'translateY(0)',
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{ display: 'block', fontWeight: 600 }}
            >
              {media?.name || 'Unnamed file'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.8 }}
            >
              {media?.type} • {formatFileSize(media?.file_size)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ opacity: 0.6, display: 'block' }}
            >
              {formatUploadDate(media?.date_creation)}
            </Typography>
          </Box>
        )}

      </Box>

      {/* Preview Modal */}
      {showPreview && <MediaPreviewModal media={media} onClose={() => setShowPreview(false)} />}
    </>
  );
});

MediaCard.displayName = 'MediaCard';

const getTimeGroup = (dateString) => {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const filterMediaByType = (media, selectedFilters) => {
  if (selectedFilters.length === 0) return media;

  return media.filter((item) => {
    const mimeType = item.type?.toLowerCase() || '';
    return selectedFilters.some((filter) => {
      switch (filter) {
        case 'image':
          return mimeType.startsWith('image/');
        case 'video':
          return mimeType.startsWith('video/');
        case 'audio':
          return mimeType.startsWith('audio/');
        case 'document':
          return (
            mimeType.includes('pdf') ||
            mimeType.includes('document') ||
            mimeType.includes('text') ||
            mimeType.includes('application')
          );
        default:
          return false;
      }
    });
  });
};

const filterMediaBySearch = (media, searchTerm) => {
  if (!searchTerm.trim()) return media;

  const term = searchTerm.toLowerCase();
  return media.filter(
    (item) => item.name?.toLowerCase().includes(term) || item.type?.toLowerCase().includes(term),
  );
};

const selectMedia = (state) => state.media.media;
const selectMediaLoading = (state) => state.media.isLoading;
const selectMediaInitialized = (state) => state.media.initialized;

const EnhancedMediaGrid = ({
  setMedia,
  mode,
  selectedMedia,
  handleSelect,
  searchTerm = '',
  selectedFilters = [],
}) => {
  const mediaList = useSelector(selectMedia);
  const initialized = useSelector(selectMediaInitialized);
  const isLoading = useSelector(selectMediaLoading);

  useEffect(() => {
    dispatch(getMedia());
  }, []);

  const filteredAndGroupedMedia = useMemo(() => {
    let filtered = mediaList;

    // Apply type filters
    filtered = filterMediaByType(filtered, selectedFilters);

    // Apply search filter
    filtered = filterMediaBySearch(filtered, searchTerm);

    // Group by time
    const grouped = filtered.reduce((groups, media) => {
      const timeGroup = getTimeGroup(media.date_creation);
      const newGroups = { ...groups };
      if (!newGroups[timeGroup]) {
        newGroups[timeGroup] = [];
      }
      newGroups[timeGroup].push(media);
      return newGroups;
    }, {});

    // Sort groups by recency and items within groups by date
    const sortedGroups = Object.entries(grouped)
      .map(([group, items]) => ({
        group,
        items: items.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)),
      }))
      .sort((a, b) => {
        const order = ['Today', 'Yesterday'];
        const aIndex = order.indexOf(a.group);
        const bIndex = order.indexOf(b.group);

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        // For other groups, sort by the actual date of the first item
        return new Date(b.items[0]?.date_creation) - new Date(a.items[0]?.date_creation);
      });

    return sortedGroups;
  }, [mediaList, selectedFilters, searchTerm]);

  const renderSkeleton = useMemo(
    () =>
      Array(12)
        .fill(null)
        .map((_, index) => <SkeletonMediaItem key={index} />),
    [],
  );

  const onSelect = useCallback(
    (e, mediaId) => {
      const selectedMediaItem = mediaList.find((f) => f.id === mediaId);
      setMedia(e, selectedMediaItem);
    },
    [mediaList, setMedia],
  );

  if (isLoading || !initialized) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
          pb: 10,
        }}
      >
        {renderSkeleton}
      </Box>
    );
  }

  if (filteredAndGroupedMedia.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'text.secondary',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
        >
          No media found
        </Typography>
        <Typography variant="body2">
          {searchTerm
            ? 'Try adjusting your search terms'
            : 'Upload some media files to get started'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        pb: 10,
        '& *:focus': {
          outline: 'none !important',
        },
        '& *:focus-visible': {
          outline: 'none !important',
        },
      }}
    >
      {filteredAndGroupedMedia.map(({ group, items }) => (
        <Box
          key={group}
          sx={{ mb: 4 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1.1rem',
              }}
            >
              {group}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Typography>
            <Divider sx={{ flexGrow: 1, opacity: 0.3 }} />
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(5, 1fr)',
                xl: 'repeat(6, 1fr)',
              },
              gap: 2,
            }}
          >
            {items.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                onSelect={onSelect}
                mode={mode}
                selectedMedia={selectedMedia}
                handleSelect={handleSelect}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default memo(EnhancedMediaGrid);
