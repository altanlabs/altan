// Helper functions for color manipulation and background effects

export const darkenColor = (color, amount = 0.4) => {
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);

  const getHex = (c) => {
    const hex = Math.round(c * (1 - amount) + 0 * amount).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${getHex(r)}${getHex(g)}${getHex(b)}`;
};

export const lightenColor = (color, amount = 0.4) => {
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);

  const getHex = (c) => {
    const hex = Math.round(c * (1 - amount) + 255 * amount).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${getHex(r)}${getHex(g)}${getHex(b)}`;
};

export function bgBlur(props) {
  // Destructure with defaults for color, blur, opacity, and imgUrl
  const { color = '#000000', blur = 6, opacity = 0.8, imgUrl, gradient } = props;

  // Utility function to apply alpha to a color or gradient
  const applyGradient = (gradient) => {
    // Gradient handling
    const type = gradient.type || 'linear'; // Default to linear gradient
    const direction = gradient.direction || 'to right'; // Default direction
    const colors = gradient.colors.join(', '); // Join colors for gradient string

    // Construct gradient string with opacity
    return `${type}-gradient(${direction}, ${colors})`;
  };

  // Background image handling with blur effect
  if (imgUrl) {
    return {
      position: 'relative',
      backgroundImage: `url(${imgUrl})`,
      '&:before': {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: '100%',
        height: '100%',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(${parseInt(color.substring(1, 3), 16)}, ${parseInt(color.substring(3, 5), 16)}, ${parseInt(color.substring(5, 7), 16)}, ${opacity})`,
      },
    };
  }

  if (gradient) {
    return {
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      background: applyGradient(gradient),
    };
  }

  // Return styles for solid color or gradient background without image
  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: `rgba(${parseInt(color.substring(1, 3), 16)}, ${parseInt(color.substring(3, 5), 16)}, ${parseInt(color.substring(5, 7), 16)}, ${opacity})`,
  };
}
