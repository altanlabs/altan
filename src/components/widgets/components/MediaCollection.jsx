import {
  Box,
  Grid,
} from '@mui/material';
import React, { useState } from 'react';

import Lightbox from '@components/lightbox';
// import Image from '@components/image';

const MediaCollection = ({ widget }) => {
  const {
    images = [],
    disabledOptions = {},
    videoDetails = {},
  } = widget?.meta_data || {};
  const [selectedImage, setSelectedImage] = useState(-1);

  const handleCloseBasic = () => {
    setSelectedImage(-1);
  };
  const videoDetailsWithtype = (Object.keys(videoDetails).length !== 0)
    ? { ...videoDetails, type: 'video', autoPlay: true, width: 1500, height: 1000 }
    : { type: 'video', autoPlay: true, width: 1500, height: 1000 };
  const combinedImages = videoDetails.poster
    ? [...images, { src: videoDetails.poster }]
    : [...images];

  console.log('Options', disabledOptions);
  console.log('combinedImages', combinedImages);
  const numColumns = Math.min(combinedImages.length, 4);
  const gridColumnValue = `repeat(${numColumns}, 1fr)`;
  const handleOpenBasic = (imageUrl) => {
    if (imageUrl === videoDetails.poster) {
      setSelectedImage(combinedImages.length);
    } else {
      const imageIndex = combinedImages.findIndex((image) => image.src === imageUrl);
      setSelectedImage(imageIndex);
    }
  };
  return (
    <>
      <Grid spacing={3}>
        <Grid item xs={12} md={9}>
          <Box
            gap={1.2}
            display="grid"
            gridTemplateColumns={gridColumnValue}
          >
            {combinedImages.map((img, key) => (
                <img
                  onClick={() => handleOpenBasic(img.src)}
                  key={key}
                  src={img.src}
                  alt={img?.title || 'image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '500px',
                    cursor: 'pointer',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    display: 'block',
                  }}
                />
            ))}
          </Box>
        </Grid>
      </Grid>

      <Lightbox
        {...disabledOptions}
        index={selectedImage}
        open={selectedImage >= 0}
        close={handleCloseBasic}
        slides={[
          ...combinedImages,
        ]}
      />
    </>
  );
};

export default MediaCollection;
