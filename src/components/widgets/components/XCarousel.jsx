import { Button, Card, CardActions, CardContent, Stack, Typography, alpha, Box } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';

import { bgBlur } from '@utils/styleUtils';
// @mui

// components
import Carousel, { CarouselArrowIndex } from '../../components/carousel';
import Image from '../../components/Image';
import {
  WidgetButton,
} from '../../components/styled';

// // ----------------------------------------------------------------------

const ImageCarousel = ({ widget, theme }) => {
  const textColor = theme === 'light' ? '#333' : '#fff';
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);

  useEffect(() => {
    setNav1(slider1);
    setNav2(slider2);
  });

  const {
    images,
    title = null,
    description = null,
    autoPlay = false,
    delay = 3000,
    loop = false,
    navigationType = 'arrows',
  } = widget.meta_data;

  if (!images || images.length === 0) {
    return <p>No images available for the carousel.</p>;
  }

  const carouselSettings = {
    dots: navigationType === 'dots',
    arrows: navigationType === 'arrows',
    lazyLoad: false,
    asNavFor: '.slider-nav',
    focusOnSelect: true,
    centerMode: true,
    autoplay: autoPlay,
    slidesToShow: 1,
    slidesToScroll: 1,
    draggable: true,
    adaptativeHeight: true,
    pauseOnHover: true,
    speed: delay,
    infinite: loop,
  };

  const thumbnailSettings = {
    slidesToShow: images.length >= 4 ? 4 : images.length,
    slidesToScroll: 1,
    asNavFor: '.slider-for',
    swipeToSlide: true,
    focusOnSelect: true,
  };

  return (
    <Card
      sx={{
        background: theme === 'light' ? 'white' : 'black',
        color: textColor,
        width: '100%%',
        margin: '0 auto',
        display: 'block',
      }}
    >
      <CardContent className="main-slider" sx={{ padding: 1 }}>
        <Carousel
          {...carouselSettings}
          asNavFor={nav2}
          ref={(slider) => setSlider1(slider)}
        >
          {images.map((img, index) => (
            <Card
              key={`slide-${index}`}
              sx={{
                backgroundColor: 'transparent',
              }}
            >
              <CardContent
                sx={{
                  p: 0.75,
                  '.MuiCardContent-root': {
                    p: 0,
                  },
                  '&:last-child': {
                    paddingBottom: 0,
                  },
                  alignItems: 'center',
                }}
              >
                {
                  (img.title || img.description) && (
                    <Stack
                      sx={{
                        p: 1,
                        zIndex: 99,
                        position: 'absolute',
                        top: 0,
                        boxShadow: `-12px 12px 32px -4px ${alpha(
                          theme === 'light' ? '#fff' : '#000',
                          0.36,
                        )}`,
                        ...bgBlur({ color: theme === 'dark' ? '#000' : '#fff', opacity: 0.5 }),
                      }}
                    >
                      <Typography variant="h6" sx={{ color: textColor }}>{img.title}</Typography>
                      <Typography variant="caption" sx={{ color: textColor, opacity: 0.9 }}>{img.description}</Typography>
                    </Stack>
                  )
                }
                <Image
                  alt={`slide-${index}`}
                  src={img.imageUrl}
                  ratio={'4/6'}

                />
                {
                  !!(img.actionButton && Object.values(img.actionButton).length) && (
                    <Stack
                      sx={{
                        p: 0,
                        position: 'absolute',
                        bottom: 0,
                        borderRadius: '10px',
                        boxShadow: `-12px 12px 32px -4px ${alpha(
                          theme === 'light' ? '#fff' : '#000',
                          0.36,
                        )}`,
                        ...bgBlur({ color: theme === 'dark' ? '#000' : '#fff', opacity: 0.4 }),
                      }}
                    >
                      <Button
                        variant="soft"
                        color="inherit"
                        sx={{
                          display: 'block',
                          color: textColor,
                          backgroundColor: 'transparent',
                        }}
                        onClick={() => window.open(img.actionButton.redirectUrl, '_blank')}
                      >
                        {img.actionButton.label}
                      </Button>
                    </Stack>
                  )
                }
              </CardContent>

            </Card>
          ))}
        </Carousel>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', padding: 1 }}>
        <div className="thumbnail-wrapper">
          <Carousel
            {...thumbnailSettings}
            asNavFor={nav1}
            ref={(slider) => setSlider2(slider)}
          >
            {images.map((img, index) => (
              <div key={`thumbnail-${index}`}>
                <Image
                  src={img.imageUrl}
                  alt={`thumbnail-${index}`}
                  ratio="1/1"
                />
              </div>
            ))}
          </Carousel>
        </div>
      </CardActions>
    </Card>
  );
};

// ----------------------------------------------------------------------

const XCarousel = ({ widget, theme, isModalOpen }) => {
  const data = widget.meta_data;
  const textColor = theme === 'light' ? '#333' : '#fff';

  const carouselRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselSettings = {
    autoplay: data?.autoplay || false,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: currentIndex,
    beforeChange: (current, next) => setCurrentIndex(next),
  };

  const handlePrev = () => {
    carouselRef.current?.slickPrev();
  };

  const handleNext = () => {
    carouselRef.current?.slickNext();
  };

  const handleCarouselItemClick = () => {
    carouselRef.current?.slickPause();
    window.open(data.images[currentIndex].actionButton.redirectUrl, '_blank');
  };

  return (
    <Card sx={{ color: textColor, borderRadius: '12px', border: 'none', background: theme === 'light' ? 'white' : 'black', height: 'auto', width: '100%', maxWidth: '600px' }}>
      {data.images.some(item => item.actionButton.label || item.title || item.description) ?
          (<Carousel ref={carouselRef} {...carouselSettings} sx={{ border: 'none' }}>
            {data.images.map((item, key) => (
          <Stack key={key}>
            <div style={{ position: 'relative' }}>
              <Image alt={item.title} src={item.imageUrl} ratio="4/3" />
              <CarouselArrowIndex
                index={currentIndex}
                total={data.images.length}
                onNext={handleNext}
                onPrevious={handlePrev}
                theme={theme}
              />
            </div>
            <Box sx={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItem: 'center', pl: 2, pr: 2, pt: 1, pb: 2 }}>
              <div sx={{ ml: 1, mr: 1 }}>
                {item?.title && (<Typography variant="h6" noWrap gutterBottom>
                  {item.title}
                                 </Typography>)}

                {item?.description && (<Typography
                  variant="body2"
                  component="span"
                  sx={{
                    fontFamily: 'inherit',
                    wordWrap: 'break-word',
                  }}
                >
                  {item.description}
                </Typography>)}
              </div>
              {item?.actionButton.label && (
                <WidgetButton onClick={handleCarouselItemClick} >
                  {item.actionButton.label}
                </WidgetButton>)}
            </Box>
          </Stack>
        ))}
           </Carousel>
          ) : (
            <ImageCarousel widget={widget} />
          )}
    </Card>
  );
};

XCarousel.propTypes = {
  data: PropTypes.array,
  theme: PropTypes.string,
};

export default XCarousel;
