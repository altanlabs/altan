import { Box, Chip, IconButton, Modal, Typography } from '@mui/material';
import { memo, useEffect, useState } from 'react';

import { optimai } from '../../../utils/axios';
import Iconify from '../../iconify/Iconify.jsx';

const MediaWidget = ({ id, name }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      if (!file && !isLoading && !hasError) {
        setIsLoading(true);
        try {
          const response = await optimai.get(`/media/${id}/details`, {
            responseType: 'blob',
          });
          const url = URL.createObjectURL(response.data);
          setFile({ url, type: response.headers['content-type'], name });
          setHasError(false);
        } catch {
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFile();
  }, [id, name, file, isLoading, hasError]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenVideoModal = () => {
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
  };

  const handleDownload = () => {
    if (file?.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (hasError) {
    return <Typography color="error" sx={{ py: 1 }}>404 Media not found</Typography>;
  }

  if (isLoading || !file) {
    return <Chip key={id} label={name} />;
  }

  // Determine file type
  const isImage = file.type?.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isVideo = file.type?.startsWith('video/');
  const isAudio = file.type?.startsWith('audio/');
  const isDocument = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ].includes(file.type);
  const isSpreadsheet = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].includes(file.type);
  const isCSV = file.type === 'text/csv' || file.name?.toLowerCase().endsWith('.csv');

  // Handle click to open the file
  const handleFileClick = () => {
    if (isVideo) {
      handleOpenVideoModal();
    } else if (isImage) {
      handleOpenModal();
    } else if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  // Get the appropriate icon based on file type
  const getFileIcon = () => {
    if (isPDF) return 'mdi:file-pdf-box';
    if (isVideo) return 'mdi:video';
    if (isAudio) return 'mdi:music';
    if (isDocument) return 'mdi:file-document';
    if (isSpreadsheet || isCSV) return 'mdi:file-excel';
    return 'mdi:file';
  };

  return (
    <>
      {isImage ? (
        // Image preview - square thumbnail that opens modal
        <div
          className="flex flex-col w-32 h-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          onClick={handleOpenModal}
          title={file.name}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={file.url}
              alt={file.name}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hidden">
              <Iconify
                icon="mdi:image-broken-variant"
                className="text-xl text-gray-600 dark:text-gray-300"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-2 truncate">
              <span className="text-xs text-white truncate">{file.name}</span>
            </div>
          </div>
        </div>
      ) : isVideo ? (
        // Video preview - square thumbnail with play button overlay
        <div
          className="flex flex-col w-32 h-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          onClick={handleOpenVideoModal}
          title={file.name}
        >
          <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
            {/* Video element for thumbnail generation */}
            <video
              className="object-cover w-full h-full"
              preload="metadata"
              muted
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            >
              <source src={file.url} type={file.type} />
            </video>
            {/* Fallback icon when video can't load */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 hidden">
              <Iconify
                icon="mdi:video"
                className="text-3xl text-gray-300"
              />
            </div>
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-white/90 rounded-full p-2 shadow-lg">
                <Iconify
                  icon="mdi:play"
                  className="text-2xl text-gray-800"
                />
              </div>
            </div>
            {/* File name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-2 truncate">
              <span className="text-xs text-white truncate">{file.name}</span>
            </div>
          </div>
        </div>
      ) : (
        // Non-image/video file preview - horizontal layout
        <div
          className="flex flex-row h-14 min-w-[200px] max-w-[280px] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          onClick={handleFileClick}
          title={file.name}
        >
          <div className="w-12 h-full flex items-center justify-center ml-3">
            <Iconify
              icon={getFileIcon()}
              className="text-2xl text-gray-600 dark:text-gray-300"
            />
          </div>
          <div className="flex-1 px-3 min-w-0 flex flex-col justify-center">
            <span className="text-sm text-gray-700 dark:text-gray-200 truncate block font-medium">
              {file.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              {file.type?.split('/')[1] || 'file'}
            </span>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 0,
            borderRadius: 1,
            outline: 'none',
          }}
        >
          <div className="relative">
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
                zIndex: 1,
              }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
            <IconButton
              aria-label="download"
              onClick={handleDownload}
              sx={{
                position: 'absolute',
                right: 56,
                top: 8,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
                zIndex: 1,
              }}
            >
              <Iconify icon="mdi:download" />
            </IconButton>
            <img
              src={file?.url}
              alt={file?.name}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </Box>
      </Modal>

      {/* Video Modal */}
      <Modal
        open={videoModalOpen}
        onClose={handleCloseVideoModal}
        aria-labelledby="video-modal-title"
        aria-describedby="video-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'black',
            boxShadow: 24,
            p: 0,
            borderRadius: 1,
            outline: 'none',
          }}
        >
          <div className="relative">
            {/* Video Controls Bar */}
            <div className="absolute top-0 left-0 right-0 bg-black/70 p-2 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium truncate max-w-64">
                  {file?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  aria-label="download"
                  onClick={handleDownload}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  size="small"
                >
                  <Iconify icon="mdi:download" />
                </IconButton>
                <IconButton
                  aria-label="open in new tab"
                  onClick={() => window.open(file?.url, '_blank')}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  size="small"
                >
                  <Iconify icon="mdi:open-in-new" />
                </IconButton>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseVideoModal}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  size="small"
                >
                  <Iconify icon="mdi:close" />
                </IconButton>
              </div>
            </div>

            {/* Video Player */}
            <video
              controls
              autoPlay
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'block',
                outline: 'none',
              }}
              onError={() => {
                // Video playback error
              }}
            >
              <source src={file?.url} type={file?.type} />
              Your browser does not support the video tag.
            </video>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default memo(MediaWidget, (prevProps, nextProps) => {
  // Only re-render if id or name changes
  return prevProps.id === nextProps.id && prevProps.name === nextProps.name;
});
