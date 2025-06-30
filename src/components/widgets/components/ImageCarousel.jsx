import { Box, Card, Paper, Button, Typography, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';

import  { varFade }  from '@components/animate';
import Carousel, { CarouselArrowIndex } from '@components/carousel';
import Image from '@components/image';

export function bgGradient(props) {
  const direction = props?.direction || 'to bottom';
  const startColor = props?.startColor;
  const endColor = props?.endColor;
  const imgUrl = props?.imgUrl;
  const color = props?.color;

  if (imgUrl) {
    return {
      background: `linear-gradient(${direction}, ${startColor || color}, ${
        endColor || color
      }), url(${imgUrl})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
    };
  }

  return {
    background: `linear-gradient(${direction}, ${startColor}, ${endColor})`,
  };
}

// ----------------------------------------------------------------------

CarouselItem.propTypes = {
  item: PropTypes.object,
  isActive: PropTypes.bool,
};

function CarouselItem({ item, isActive }) {
  const { title, imageUrl, description, actionButton } = item;
  const handleRedirect = () => {
    window.open(actionButton.redirectUrl, '_blank');
  };

  return (
    <Paper sx={{ position: 'relative', background: 'black' }}>
      <Image alt={title} src={imageUrl} ratio="4/3" />

      <Box
        sx={{
          top: 0,
          width: 1,
          height: 1,
          position: 'absolute',
          borderRadius: '10px',
        }}
      />

      <CardContent
        component="div"
        sx={{
          bottom: 0,
          width: 1,
          maxWidth: 350,
          textAlign: 'left',
          position: 'absolute',
          color: 'common.white',
        }}
      >
        {title &&
        (
          <m.div variants={varFade().inRight}>
            <Typography variant="h3" gutterBottom>
              {title}
            </Typography>
          </m.div>
        )}

        {description &&
        (<m.div variants={varFade().inRight}>
          <Typography variant="body2" gutterBottom>
            {description}
          </Typography>
        </m.div>)}

        {actionButton?.label &&
        (<m.div variants={varFade().inRight}>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleRedirect}>
            {actionButton.label}
          </Button>
        </m.div>)}
      </CardContent>
    </Paper>
  );
}

// ----------------------------------------------------------------------

const ImageCarousel = ({ widget }) => {
  const theme = useTheme();
  const {
    images,
    autoPlay = true,
    delay = 800,
  } = widget.meta_data;

  if (!images || images.length === 0) {
    return <p>No images available for the carousel.</p>;
  }

  const carouselRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(theme.direction === 'rtl' ? images.length - 1 : 0);

  const carouselSettings = {
    speed: delay,
    dots: false,
    arrows: false,
    autoplay: autoPlay,
    slidesToShow: 1,
    slidesToScroll: 1,
    rtl: Boolean(theme.direction === 'rtl'),
    beforeChange: (current, next) => setCurrentIndex(next),
  };

  const handlePrev = () => {
    carouselRef.current?.slickPrev();
  };

  const handleNext = () => {
    carouselRef.current?.slickNext();
  };

  return (
    <Card sx={{ maxHeight: 400, maxWidth: 400 }}>
      <Carousel ref={carouselRef} {...carouselSettings}>
        {images.map((item, index) => (
          <CarouselItem key={`image_carousel_${index}`} item={item} isActive={index === currentIndex} />
        ))}
      </Carousel>

      <CarouselArrowIndex
        index={currentIndex}
        total={images.length}
        onNext={handleNext}
        onPrevious={handlePrev}
      />
    </Card>
  );
};

ImageCarousel.propTypes = {
  widget: PropTypes.shape({
    meta_data: PropTypes.shape({
      images: PropTypes.arrayOf(PropTypes.object).isRequired,
      autoPlay: PropTypes.bool,
      delay: PropTypes.number,
      loop: PropTypes.bool,
    }).isRequired,
  }).isRequired,
};

export default ImageCarousel;
