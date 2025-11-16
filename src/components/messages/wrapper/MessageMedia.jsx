import { Box, IconButton, Modal } from '@mui/material';
import { memo, useMemo, useState } from 'react';

import { cn } from '../../../lib/utils.ts';
import { makeSelectMessageMedia } from '../../../redux/slices/room/selectors/messageSelectors';
import { selectAccount } from '../../../redux/slices/room/selectors/roomSelectors';
import { useSelector } from '../../../redux/store.ts';
import Iconify from '../../iconify/Iconify.jsx';

const MEDIA_URL = 'https://platform-api.altan.ai/media/';

const selectAccountId = (state) => selectAccount(state)?.id;

const MessageMedia = ({ messageId, className = '', itemClassName = '' }) => {
  const accountId = useSelector(selectAccountId);
  const [modalOpen, setModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const mediaSelector = useMemo(makeSelectMessageMedia, []);
  const media = useSelector((state) => mediaSelector(state, messageId));

  if (!media || !media.length) {
    return null;
  }

  const handleOpenModal = (imageUrl, fileName) => {
    setSelectedImage({ url: imageUrl, name: fileName });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenVideoModal = (videoUrl, fileName, fileType) => {
    setSelectedVideo({ url: videoUrl, name: fileName, type: fileType });
    setVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const handleDownloadImage = () => {
    if (selectedImage?.url) {
      window.open(selectedImage.url, '_blank');
    }
  };

  const handleDownloadVideo = () => {
    if (selectedVideo?.url) {
      const link = document.createElement('a');
      link.href = selectedVideo.url;
      link.download = selectedVideo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className={cn('flex flex-wrap gap-2 space-y-2 space-x-1', className)}>
        {media.map((attachment, index) => {
          const file = {
            name: attachment?.media?.file_name || 'Unnamed',
            url: MEDIA_URL + attachment?.media?.id + `?account_id=${accountId}`,
            type: attachment?.media?.mime_type,
          };

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

          // Handle click to open the file in a new tab or download
          const handleFileClick = () => {
            if (isVideo) {
              handleOpenVideoModal(file.url, file.name, file.type);
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

          return isImage ? (
            // Image preview - square thumbnail that opens modal
            <div
              key={index}
              className={`flex flex-col w-32 h-32 flex-shrink-0 ${itemClassName} cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
              onClick={() => handleOpenModal(file.url, file.name)}
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
              key={index}
              className={`flex flex-col w-32 h-32 flex-shrink-0 ${itemClassName} cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
              onClick={() => handleOpenVideoModal(file.url, file.name, file.type)}
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
              key={index}
              className={`flex flex-row h-14 min-w-[200px] max-w-[280px] flex-shrink-0 ${itemClassName} cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
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
          );
        })}
      </div>

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
              onClick={handleDownloadImage}
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
              src={selectedImage?.url}
              alt={selectedImage?.name}
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
                  {selectedVideo?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  aria-label="download"
                  onClick={handleDownloadVideo}
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
                  onClick={() => window.open(selectedVideo?.url, '_blank')}
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
              onError={(e) => {
                console.error('Video playback error:', e);
              }}
            >
              <source src={selectedVideo?.url} type={selectedVideo?.type} />
              Your browser does not support the video tag.
            </video>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default memo(MessageMedia);
