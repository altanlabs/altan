export const isMobile = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  // Regular expression covering a wider range of mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  // Testing user agent for mobile devices
  const isMobileDevice = mobileRegex.test(navigator.userAgent);

  // Additional check for touch capabilities (not exclusively mobile, but common in mobile devices)
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

  return isMobileDevice || isTouchDevice;
};
