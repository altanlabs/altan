import React from 'react';
import CustomIframe from './CustomIframe.jsx';

// YouTube URL detection and processing
export const isYouTubeUrl = (url) => {
  const youtubePattern =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  return youtubePattern.test(url);
};

export const extractYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /youtube\.com\/watch\?v=([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// YouTube Embed Component
const YouTubeEmbed = ({ videoId, title = 'YouTube video' }) => {
  return (
    <CustomIframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      title={title}
    />
  );
};

export default YouTubeEmbed;

