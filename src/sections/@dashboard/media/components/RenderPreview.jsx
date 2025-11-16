import { Box, Modal, Typography, Button, Stack } from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useSelector } from 'react-redux';

import {
  CardDescription,
  CardTitle,
} from '@components/aceternity/cards/card-hover-effect.tsx';
import Iconify from '@components/iconify/Iconify.jsx';
import Image from '@components/image';
import Video from '@components/video/Video.jsx';
import { selectAccountId } from '@redux/slices/general/index.ts';
import { bgBlur } from '@utils/cssStyles';
import { fToNow } from '@utils/formatTime';

const mediaTypes = {
  image: ['png', 'jpg', 'jpeg', 'gif'],
  video: ['mp4', 'webm', 'ogg'],
  audio: ['mp3', 'ogg', 'wav', 'mpeg'],
  text: ['txt', 'json', 'csv', 'xml'],
  pdf: ['pdf'],
};

const getMediaType = (fileType) => {
  for (const [type, extensions] of Object.entries(mediaTypes)) {
    if (extensions.includes(fileType)) return type;
  }
  return null;
};

const commonMediaStyle = (isFullScreen, mode) =>
  !isFullScreen
    ? {
        // borderRadius: '0.5rem',
        objectFit: 'contain',
        maxWidth: mode === 'drawer' ? '200%' : '100%',
        height: 'auto',
        width: 'auto',
      }
    : {
        borderRadius: '0.5rem',
        objectFit: 'contain',
        maxHeight: '90vh',
        maxWidth: '90vw',
      };

const modalStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...bgBlur({ color: '#000', opacity: 0.4 }),
};

const FallbackRenderer = memo(({ preview, isModalOpen, fileName, mode }) => (
  <>
    <Box
      component="img"
      src={preview}
      sx={{ width: '2rem', height: '2rem', flexShrink: 1, objectFit: 'cover' }}
    />
    <Typography
      variant="body2"
      sx={{ mt: 2, ml: 1 }}
    >
      {fileName}
    </Typography>
  </>
));

const TextRenderer = memo(({ preview, isModalOpen, fileName, mode }) => (
  <iframe
    src={preview}
    style={{ ...commonMediaStyle(isModalOpen, mode), minHeight: '100px' }}
    title={fileName}
  >
    Your browser does not support inline text.
  </iframe>
));

const PDFRenderer = memo(({ preview, fileName, isModalOpen, dateCreation, mode }) => (
  <Stack
    spacing={1}
    padding={2}
    width="100%"
    height="100%"
    className=""
  >
    <Stack
      direction="row"
      width="100%"
      spacing={1}
      alignItems="center"
    >
      <Iconify icon="fa:file-pdf-o" />
      <Stack
        width="100%"
        height="100%"
        spacing={-0.5}
      >
        <CardTitle>{fileName}</CardTitle>
        {!!dateCreation && (
          <CardDescription className="text-xs">{fToNow(dateCreation)}</CardDescription>
        )}
      </Stack>
    </Stack>

    {isModalOpen ? (
      <iframe
        src={`${preview}#view=FitH`}
        style={{ ...commonMediaStyle(isModalOpen, mode), minHeight: '300px', border: 'none' }}
        title={fileName}
      >
        Your browser does not support PDFs.
      </iframe>
    ) : (
      <Stack
        direction="row"
        spacing={1}
        width="100%"
      >
        <Iconify icon="mdi:eye" />
        <span className="text-sm">Open preview</span>
      </Stack>
    )}
  </Stack>
));

const AudioRenderer = memo(({ isModalOpen, preview, mode, fileName }) => (
  <ReactPlayer
    url={preview}
    controls={true}
    forceAudio={true}
    playing={mode !== 'drawer'}
    width="300px"
    height="50px"
  />
));

const ImageRenderer = memo(({ isModalOpen, preview, fileName, mode, preventAutoDownload }) =>
  isModalOpen || mode !== 'drawer' ? (
    <img
      src={preview}
      alt={fileName}
      style={{ ...commonMediaStyle(isModalOpen, mode) }}
      loading="lazy"
      {...(preventAutoDownload && { 
        onError: (e) => {
          e.target.style.display = 'none';
          console.log('Image failed to load, preventing download');
        }
      })}
    />
  ) : (
    <Image
      ratio={'1/1'}
      src={preview}
      alt={fileName}
      loading="lazy"
    />
  ),
);

const VideoRenderer = memo(({ mode, preview, fileName, isModalOpen, preventAutoDownload }) => {
  // TODO: improve loading time
  // https://dieudonneawa7.medium.com/complete-guide-on-how-to-implement-a-video-player-in-react-js-afd07576d50a

  const mediaRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const [shouldLoop, setShouldLoop] = useState(false);

  useEffect(() => {
    const handleMetadataLoaded = () => {
      const media = mediaRef.current;
      if (media && 'duration' in media && media.duration < 10) {
        setShouldLoop(true);
        setShowControls(false);
      }
    };

    const media = mediaRef.current;
    if (media) {
      media.addEventListener('loadedmetadata', handleMetadataLoaded);
      return () => media.removeEventListener('loadedmetadata', handleMetadataLoaded);
    }
  }, []);

  const videoSource = useMemo(
    () => (
      <video
        ref={mediaRef}
        controls={showControls && (mode !== 'drawer' || isModalOpen)}
        allowFullScreen
        muted={shouldLoop && mode !== 'drawer'}
        loop={shouldLoop}
        autoPlay={shouldLoop && mode !== 'drawer'}
        src={preview}
        alt={fileName}
        style={{ ...commonMediaStyle(isModalOpen, mode), ...!isModalOpen }}
        preload={preventAutoDownload ? "none" : "metadata"}
        {...(preventAutoDownload && { 
          onError: (e) => {
            console.log('Video failed to load, preventing download');
          }
        })}
      >
        Your browser does not support the video tag.
      </video>
    ),
    [mediaRef, isModalOpen, mode, showControls, shouldLoop, preview, fileName, preventAutoDownload],
  );
  return isModalOpen || mode !== 'drawer' ? videoSource : <Video ratio="1/1">{videoSource}</Video>;
});

const renderersMap = {
  image: ImageRenderer,
  video: VideoRenderer,
  audio: AudioRenderer,
  text: TextRenderer,
  pdf: PDFRenderer,
};

const RenderPreview = ({
  media,
  preview,
  fileType,
  fileName,
  className,
  children,
  mode = 'default',
  shouldLoadPreview = true,
  preventAutoDownload = false,
}) => {
  // const [isMediaHovered, setIsMediaHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const accountId = useSelector(selectAccountId);

  // const supportedImageTypes = useRef(new Set(["png", "jpg", "jpeg", "gif"])).current;
  // const supportedVideoTypes = useRef(new Set(["mp4", "webm", "ogg"])).current;
  // const supportedAudioTypes = useRef(new Set(['mp3', 'ogg', 'wav', 'mpeg', 'mpg'])).current;
  // const supportedTextTypes = useRef(new Set(['txt', 'json', 'csv', 'xml'])).current;

  // const handleMouseEnter = useCallback(() => setIsMediaHovered(true), []);
  // const handleMouseLeave = useCallback(() => setIsMediaHovered(false), []);

  const handleFullscreenToggle = useCallback(() => setIsModalOpen((prev) => !prev), []);

  const mediaType = useMemo(() => getMediaType(fileType), [fileType]);
  const MediaTypeRenderer = useMemo(
    () => (!!mediaType ? renderersMap[mediaType] : FallbackRenderer),
    [mediaType],
  );

  const handleCopyUrl = useCallback(() => {
    // console.log('media', media);
    const url = `https://platform-api.altan.ai/media/${media.id}?account_id=${accountId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        // console.log('URL copiada al portapapeles');
      })
      .catch(() => {
        // console.error('Error al copiar URL al portapapeles: ', err);
      });
  }, [accountId, media.id]);

  // Create a placeholder component for when preview shouldn't load
  const PlaceholderRenderer = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        border: '1px dashed rgba(255, 255, 255, 0.2)',
        color: 'text.secondary',
      }}
    >
      <Iconify 
        icon={
          fileType === 'pdf' ? 'fa:file-pdf-o' :
          media?.type?.startsWith('image') ? 'material-symbols:image-outline' :
          media?.type?.startsWith('video') ? 'material-symbols:videocam-outline' :
          media?.type?.startsWith('audio') ? 'material-symbols:audio-file-outline' :
          'material-symbols:description-outline'
        } 
        sx={{ fontSize: 32, mb: 1, opacity: 0.6 }} 
      />
      <Typography variant="caption" sx={{ textAlign: 'center', opacity: 0.8 }}>
        {fileName || 'Media file'}
      </Typography>
      <Typography variant="caption" sx={{ textAlign: 'center', opacity: 0.6, fontSize: '0.7rem' }}>
        Hover to load
      </Typography>
    </Box>
  );

  return (
    <Box className={className}>
      <Box
        {...(mode === 'drawer' && { onClick: handleFullscreenToggle })}
      >
        {children}
        {shouldLoadPreview && preview ? (
          <MediaTypeRenderer
            preview={preview}
            fileName={fileName}
            isModalOpen={false}
            dateCreation={media?.date_creation}
            mode={mode}
            preventAutoDownload={preventAutoDownload}
          />
        ) : (
          <PlaceholderRenderer />
        )}
      </Box>
      <Modal
        open={isModalOpen}
        onClose={handleFullscreenToggle}
        style={modalStyle}
      >
        <Box>
          <MediaTypeRenderer
            preview={preview}
            fileName={fileName}
            dateCreation={media?.date_creation}
            isModalOpen={true}
            mode={mode}
            preventAutoDownload={false}
          />
          <Button onClick={handleCopyUrl}>Copy url</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default memo(RenderPreview);
