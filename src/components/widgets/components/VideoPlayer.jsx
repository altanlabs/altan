import { Card, CardMedia } from '@mui/material';
import React, { memo } from 'react';

const VideoPlayer = ({ widget }) => {
  const data = widget.meta_data;

  return (
    <Card>
      <CardMedia
        component="video"
        controls
        src={data.video_url}
      />
    </Card>
  );
};

export default memo(VideoPlayer);
