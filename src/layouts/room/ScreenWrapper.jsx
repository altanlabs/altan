import { Box } from '@mui/material';
import Color from 'color';

import { lightenColor, darkenColor } from '@utils/styleUtils';

const generateBackgroundImage = (hasBackgroundImage, background_image, backgroundTargetColor, color, theme, matches) => {
  const adjustedColor = adjustColor(color, theme);
  const opacityLayer = theme === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,.6)';

  if (hasBackgroundImage) {
    return `linear-gradient(180deg, ${opacityLayer} 75%, ${backgroundTargetColor} 96%), url(${background_image})`;
  } else if (matches) {
    return `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${backgroundTargetColor} 95%), url(https://storage.googleapis.com/logos-chatbot-optimai/gradients/gradient_1.png)`;
  } else {
    return `linear-gradient(180deg, ${Color(adjustedColor).rotate(-15).hex()} 25%, ${Color(adjustedColor).rotate(-10).hex()} 50%, ${adjustedColor} 85%, ${backgroundTargetColor} 98%)`;
  }
};

const adjustColor = (color, theme) => {
  return theme === 'light' ? lightenColor(color) : darkenColor(color);
};

const ScreenWrapper = ({ children, hasBackgroundImage, background_image, backgroundTargetColor, brandColor, matches, theme }) => {
  const commonStyles = {
    position: 'absolute',
    top: 0,
    bottom: '70px',
    right: 0,
    left: 0,
    margin: 0,
    flexDirection: 'column',
    background: backgroundTargetColor,
    backgroundImage: generateBackgroundImage(hasBackgroundImage, background_image, backgroundTargetColor, brandColor, theme, matches),
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  return (
    <Box
      sx={{
        ...commonStyles,
        paddingBottom: !matches ? '3rem' : '2rem',
        paddingLeft: matches ? '6rem' : '1.5rem',
        paddingRight: matches ? '6rem' : '1.5rem',
        overflowY: !matches ? 'scroll' : 'auto',
        backdropFilter: !matches ? 'blur(10px)' : undefined,
      }}
    >
      {children}
    </Box>
  );
};

export default ScreenWrapper;
