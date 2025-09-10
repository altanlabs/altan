import { Typography, Box, Stack, Divider } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import RenderPreview from './RenderPreview';
import SkeletonMediaItem from './skeletons/SkeletonMediaItem';
import { API_BASE_URL } from '../../../../auth/utils';
import { getMedia } from '../../../../redux/slices/media';
import { dispatch } from '../../../../redux/store';

const DRAWER_MODES = ['custom_message', 'drawer'];
const MEDIA_PAGE_MODE = 'default';
const MEDIA_BASE_URL = `${API_BASE_URL}/platform/media`;

const MediaCard = memo(({ media, selected, onSelect, mode, selectedMedia, handleSelect }) => (
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
  >
    <RenderPreview
      className="relative group cursor-pointer focus:outline-none"
      mode="drawer"
      preview={`${MEDIA_BASE_URL}/${media.id}?account_id=${media.account_id}`}
      fileType={media?.type?.split('/').pop()}
      fileName={media?.name}
      media={media}
      style={{ outline: 'none' }}
    />

    {/* Media metadata overlay */}
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

    {/* Selection checkbox */}
    {(DRAWER_MODES.includes(mode) || MEDIA_PAGE_MODE === mode) && (
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: selectedMedia?.has(media.id)
            ? 'primary.main'
            : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          opacity: selectedMedia?.has(media.id) ? 1 : 0,
          '.group:hover &': {
            opacity: 1,
          },
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'primary.main',
          },
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (DRAWER_MODES.includes(mode)) {
            onSelect(e, media.id);
          } else {
            handleSelect(media.id);
          }
        }}
      >
        {selectedMedia?.has(media.id) && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        )}
      </Box>
    )}
  </Box>
));

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
      if (!groups[timeGroup]) {
        groups[timeGroup] = [];
      }
      groups[timeGroup].push(media);
      return groups;
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
      const selectedMedia = mediaList.find((f) => f.id === mediaId);
      setMedia(e, selectedMedia);
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
                selected={false}
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
