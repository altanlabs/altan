import { Box, Typography, Button, Card, Stack, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import Slider from './index';

const AgentCarousel = ({ cards = [], autoplay = true, speed = 5000 }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay,
    autoplaySpeed: speed,
    pauseOnHover: true,
    fade: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleButtonClick = (navigateTo) => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <Box sx={{ position: 'relative', mb: 4 }}>
      <Slider {...carouselSettings}>
        {cards.map((card, index) => (
          <Box key={index}>
            <Card
              sx={{
                position: 'relative',
                height: { xs: 500, md: 700 },
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              {/* Background Video/Image */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                {card.backgroundPath.endsWith('.mp4') ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  >
                    <source
                      src={card.backgroundPath}
                      type="video/mp4"
                    />
                  </video>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${card.backgroundPath})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )}
                {/* Overlay gradient */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
                  }}
                />
              </Box>

              {/* Content Overlay */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  p: { xs: 3, md: 4 },
                  color: 'white',
                }}
              >
                <Stack spacing={2}>
                  {/* Title */}
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      fontSize: { xs: '2rem', md: '3rem' },
                      lineHeight: 1.1,
                    }}
                  >
                    {card.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      maxWidth: { xs: '100%', md: '60%' },
                      lineHeight: 1.5,
                    }}
                  >
                    {card.description}
                  </Typography>

                  {/* Button */}
                  {card.buttonText && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleButtonClick(card.navigateTo)}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: 'text.primary',
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          '&:hover': {
                            bgcolor: 'white',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {card.buttonText}
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

AgentCarousel.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      backgroundPath: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      buttonText: PropTypes.string,
      navigateTo: PropTypes.string,
    }),
  ).isRequired,
  autoplay: PropTypes.bool,
  speed: PropTypes.number,
};

export default AgentCarousel; 