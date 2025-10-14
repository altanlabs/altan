import React from 'react';

// Custom Iframe Component with header and controls
const CustomIframe = ({ src, title = 'Embedded content', style, ...props }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const iframeRef = React.useRef(null);
  const containerRef = React.useRef(null);

  // Extract domain from URL for display
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const handleOpenInNewTab = () => {
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current?.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current?.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Check if custom height is provided
  const hasCustomHeight = !!(style?.height || props.height);
  const customHeight = hasCustomHeight ? style?.height || props.height : null;

  return (
    <>
      {/* Add styles for fullscreen mode */}
      {isFullscreen && (
        <style>
          {`
            body { overflow: hidden; }
            :fullscreen { 
              width: 100vw !important; 
              height: 100vh !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
            :-webkit-full-screen { 
              width: 100vw !important; 
              height: 100vh !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
            :-moz-full-screen { 
              width: 100vw !important; 
              height: 100vh !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
            :-ms-fullscreen { 
              width: 100vw !important; 
              height: 100vh !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
          `}
        </style>
      )}
      <div
        ref={containerRef}
        className={`relative w-full mx-auto my-4 rounded-xl overflow-hidden shadow-lg border border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm ${
          isFullscreen
            ? '!fixed !inset-0 !z-50 !m-0 !rounded-none !h-screen !w-screen !border-none !shadow-none'
            : ''
        }`}
        style={
          isFullscreen
            ? {
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                borderRadius: 0,
                background: '#000',
              }
            : {}
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          {/* URL Display */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <svg
              className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-mono">
              {getDomain(src)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenInNewTab}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
              title="Open in new tab"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <svg
                className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isFullscreen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Iframe Content */}
        <div
          className={`relative ${isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[250px]'}`}
          style={
            isFullscreen
              ? {}
              : hasCustomHeight
                ? { height: customHeight }
                : { height: '250px', minHeight: '250px', maxHeight: '400px' }
          }
        >
          <iframe
            ref={iframeRef}
            src={src}
            title={title}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            {...props}
          />
        </div>
      </div>
    </>
  );
};

export default CustomIframe;

