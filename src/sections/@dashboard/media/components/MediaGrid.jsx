import Masonry from '@mui/lab/Masonry';
import { Checkbox, Box } from '@mui/material';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import RenderPreview from './RenderPreview';
import SkeletonMediaItem from './skeletons/SkeletonMediaItem';
import { API_BASE_URL } from '../../../../auth/utils';
import { getMedia } from '../../../../redux/slices/media';
import { dispatch } from '../../../../redux/store';

const DRAWER_MODES = ['custom_message', 'drawer'];
const MEDIA_PAGE_MODE = 'default';
const MEDIA_BASE_URL = `${API_BASE_URL}/platform/media`;

const MediaCard = memo(({ media, selected, onSelect, mode, selectedMedia, handleSelect }) => {
  const [hasLoadedPreview, setHasLoadedPreview] = useState(false);

  const handleMouseEnter = () => {
    setHasLoadedPreview(true);
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      <RenderPreview
        className="relative group rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg backdrop-blur-xl cursor-pointer"
        mode="drawer"
        preview={hasLoadedPreview ? `${MEDIA_BASE_URL}/${media.id}?account_id=${media.account_id}` : null}
        fileType={media?.type?.split('/').pop()}
        fileName={media?.name}
        media={media}
        shouldLoadPreview={hasLoadedPreview}
        preventAutoDownload={false}
      >
    {DRAWER_MODES.includes(mode) && (
      <div className="absolute transition transition-opacity top-5 left-5 z-[999] w-[30] h-[30] border border-gray-300 dark:border-gray-700 opacity-0 group-hover:opacity-1">
        <Checkbox
          size="small"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e, media.id);
          }}
        />
      </div>
    )}
    {MEDIA_PAGE_MODE === mode && (
      <div className="absolute transition transition-opacity top-5 left-5 z-[999] w-[30] h-[30] border border-gray-300 dark:border-gray-700 opacity-0 group-hover:opacity-1">
        <Checkbox
          size="small"
          checked={selectedMedia.has(media.id)}
          onChange={() => handleSelect(media.id)}
        />
      </div>
    )}
  </RenderPreview>
    </div>
  );
});

const selectMedia = (state) => state.media.media;
const selectMediaLoading = (state) => state.media.isLoading;
const selectMediaInitialized = (state) => state.media.initialized;

const masonryCols = { xs: 2, sm: 3, md: 4, lg: 4, xl: 5 };
const MediaGrid = ({ setMedia, mode, selectedMedia, handleSelect }) => {
  const mediaList = useSelector(selectMedia);
  const initialized = useSelector(selectMediaInitialized);
  const isLoading = useSelector(selectMediaLoading);

  useEffect(() => {
    dispatch(getMedia());
  }, []);

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

  return isLoading || !initialized ? (
    renderSkeleton
  ) : (
    <Box className="pb-20">
      <Masonry columns={masonryCols}>
        {mediaList.map((media, i) => (
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
      </Masonry>
    </Box>
  );
};

export default memo(MediaGrid);
