import { Card, CircularProgress } from '@mui/material';
import React, { memo } from 'react';
import ReactPlayer from 'react-player/youtube';

const YTVideo = ({ widget }) => {
  // Check if widget and widget.meta_data exist or provide default values
  const data = widget?.meta_data || {};
  const { video_url = '', controls = false, autoplay = false } = data || {};

  // State to track when the video is ready to play
  const [isReady, setIsReady] = React.useState(false);

  return (
    <Card sx={{ backgroundColor: 'black', height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden', p: 0, minHeight: '250px', minWidth: '300px', maxWidth: '400px' }}>
      {!isReady && <CircularProgress style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
      <ReactPlayer
        url={video_url}
        width="100%"
        height="100%"
        controls={controls}
        playing={autoplay}
        onReady={() => setIsReady(true)}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </Card>
  );
};

export default memo(YTVideo);
