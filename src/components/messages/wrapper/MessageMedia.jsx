import { Box, IconButton, Modal } from '@mui/material';
import { memo, useMemo, useState } from 'react';

import { cn } from '../../../lib/utils.ts';
import { makeSelectMessageMedia, selectAccount } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import Iconify from '../../iconify/Iconify.jsx';

const MEDIA_URL = 'https://api.altan.ai/platform/media/';

const selectAccountId = (state) => selectAccount(state)?.id;

const MessageMedia = ({ messageId, className = '', itemClassName = '' }) => {
  const accountId = useSelector(selectAccountId);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const mediaSelector = useMemo(makeSelectMessageMedia, []);
  const media = useSelector((state) => mediaSelector(state, messageId));

  if (!media) {
    return null;
  }

  const handleOpenModal = (imageUrl, fileName) => {
    setSelectedImage({ url: imageUrl, name: fileName });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleDownloadImage = () => {
    if (selectedImage?.url) {
      window.open(selectedImage.url, '_blank');
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap gap-2 space-y-2 space-x-1',
          className,
        )}
      >
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
          if (file.url) {
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
        ) : (
          // Non-image file preview - horizontal layout
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
    </>
  );
};

export default memo(MessageMedia);
