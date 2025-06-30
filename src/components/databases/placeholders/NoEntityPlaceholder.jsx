import { Box, Typography, Dialog } from '@mui/material';
import { memo, useState } from 'react';
import ReactPlayer from 'react-player';

import { HoverBorderGradient } from '../../aceternity/buttons/hover-border-gradient.tsx';
import Iconify from '../../iconify';

function NoEntityPlaceholder({
  title,
  description,
  buttonMessage,
  onButtonClick,
  secondaryButtonMessage,
  secondaryOnButtonClick,
  videoUrl = null,
}) {
  const [openVideo, setOpenVideo] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      gap={2}
    >
      <Typography variant="h2">{title}</Typography>
      <Typography variant="body">{description}</Typography>

      <Box
        display="flex"
        gap={2}
        alignItems="center"
      >
        <HoverBorderGradient
          containerClassName="group relative rounded-full p-[1px] bg-gradient-to-r from-blue-200 to-violet-200 dark:from-indigo-500/40 dark:to-violet-500/40 hover:shadow-xl hover:shadow-blue-300/20 dark:hover:shadow-indigo-500/20"
          as="button"
          className="transition-all duration-200 w-[200px] h-[40px] text-sm bg-white/80 dark:bg-black/20 text-black dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
          onClick={onButtonClick}
        >
          <Iconify
            icon="lets-icons:add-duotone"
            sx={{ mr: 1, width: 20, height: 20 }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 500 }}
          >
            {buttonMessage}
          </Typography>
        </HoverBorderGradient>

        {secondaryButtonMessage && secondaryOnButtonClick && (
          <button
            onClick={secondaryOnButtonClick}
            className="transition-all duration-200 w-[185px] h-[40px] text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 500 }}
            >
              {secondaryButtonMessage}
            </Typography>
          </button>
        )}
        {videoUrl && (
          <button
            onClick={() => setOpenVideo(true)}
            className="transition-all duration-200 w-[185px] h-[40px] text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
          >
            <Iconify
              icon="carbon:play-filled"
              sx={{ mr: 1, width: 20, height: 20 }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 500 }}
            >
              View Demo
            </Typography>
          </button>
        )}
      </Box>

      <Dialog
        open={openVideo}
        onClose={() => setOpenVideo(false)}
        maxWidth="md"
        fullWidth
      >
        <Box
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            bgcolor: 'black',
          }}
        >
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            playing={true}
            light={false}
          />
        </Box>
      </Dialog>
    </Box>
  );
}

export default memo(NoEntityPlaceholder);
