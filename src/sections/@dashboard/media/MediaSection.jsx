import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CloudUploadOutlined } from '@mui/icons-material';
import { Stack, Typography, keyframes, Card, Divider, Button, ButtonGroup } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { memo, useCallback, useState } from 'react';

// import SearchBar from './components/SearchBar';
import { useDropzone } from 'react-dropzone';

import DrawerHeader from './components/DrawerHeader';
import MediaGrid from './components/MediaGrid';
import { DynamicIsland } from '../../../components/dynamic-island/DynamicIsland';
import Iconify from '../../../components/iconify';
import useResponsive from '../../../hooks/useResponsive';
import { deleteMedia } from '../../../redux/slices/media';
import { dispatch } from '../../../redux/store';
import { bgBlur } from '../../../utils/cssStyles';
import { uploadMedia } from '../../../utils/media';

const pulsate = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const DRAWER_MODES = ['custom_message', 'drawer'];
const MEDIA_PAGE_MODE = 'default';

const MediaSection = ({ mode = MEDIA_PAGE_MODE, setMedia, searchTerm, onClose = null }) => {
  const handleDrop = useCallback(async (acceptedFiles) => {
    const newFiles = acceptedFiles.map(async (file) => await uploadMedia(file));
    await Promise.all(newFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    noClick: true,
    onDrop: handleDrop,
    onDragEnter: (e) => console.log('dragging...'),
  });
  const isError = isDragReject;
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const isMobile = useResponsive('down', 'sm');
  const [selectedMedia, setSelectedMedia] = useState(new Set());
  const { enqueueSnackbar } = useSnackbar();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelect = (mediaId) => {
    const newSet = new Set(selectedMedia);
    if (selectedMedia.has(mediaId)) {
      newSet.delete(mediaId);
    } else {
      newSet.add(mediaId);
    }
    setSelectedMedia(newSet);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    enqueueSnackbar(`Deleting ${selectedMedia.size} media`, { variant: 'info' });

    try {
      const deletePromises = Array.from(selectedMedia).map((mediaId) => {
        return dispatch(deleteMedia({ mediaId }));
      });

      await Promise.all(deletePromises);
      enqueueSnackbar(`Deleted ${selectedMedia.size} media`, { variant: 'success' });
      setSelectedMedia(new Set());
      setIsDeleting(false);
    } catch (e) {
      setIsDeleting(false);
      setSelectedMedia(new Set());
      enqueueSnackbar(`Error deleting media: ${e}`, { variant: 'error' });
      console.error(`Error deleting media: ${e}`);
    }
  };
  return (
    <>
      {mode === MEDIA_PAGE_MODE && isDragActive && (
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 150,
            zIndex: 2,
            textAlign: 'center',
            animation: `${bounce} 2s ease-in-out infinite`,
          }}
        >
          <Card
            sx={{
              borderRadius: 5,
              padding: 3,

              ...bgBlur({ color: '#000', opacity: 0.4 }),
            }}
          >
            <CloudUploadOutlined sx={{ fontSize: 60 }} />
            <Typography variant="h6">Drop your media here</Typography>
          </Card>
        </Stack>
      )}

      <Stack
        {...getRootProps({ role: 'none' })}
        spacing={1.5}
        padding={0}
        sx={{
          height: '100%',
          ...(isDragActive && {
            animation: `${pulsate} 3s ease-in-out infinite`,
          }),
          ...(isError && {
            color: 'error.main',
            bgcolor: 'error.lighter',
            borderColor: 'error.light',
          }),
        }}
      >
        {DRAWER_MODES.includes(mode) && !!onClose && (
          <>
            <DrawerHeader
              isMobile={isMobile}
              closeDrawer={onClose}
              onUploadClick={open}
            />
            <Divider />
          </>
        )}
        {mode === MEDIA_PAGE_MODE && (
          <DynamicIsland>
            {selectedMedia.size > 0 && (
              <Button
                color="error"
                variant="contained"
                startIcon={<Iconify icon="eva:trash-2-outline" />}
                onClick={handleDelete}
                sx={{ mr: 1 }}
              >
                {isDeleting ? 'Deleting...' : `Delete ${selectedMedia.size} Media`}
              </Button>
            )}
            <ButtonGroup>
              <Button
                size="large"
                variant="contained"
                color="secondary"
                endIcon={
                  <Iconify
                    icon="line-md:uploading-loop"
                    width={30}
                  />
                }
                onClick={open}
              >
                Add Media
              </Button>
            </ButtonGroup>
          </DynamicIsland>
        )}
        <DndContext sensors={sensors}>
          <input {...getInputProps()} />
          <MediaGrid
            isMobile={isMobile}
            setMedia={setMedia}
            searchTerm={searchTerm}
            mode={mode}
            selectedMedia={selectedMedia}
            handleSelect={handleSelect}
          />
        </DndContext>
      </Stack>
    </>
  );
};

export default memo(MediaSection);
