import { Box, CircularProgress } from '@mui/material';
import { memo, useState, useCallback } from 'react';

/**
 * OperateView - Minimal view for operate mode
 * Just shows the iframe without all the builder controls
 */
function OperateView({ altaner }) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  // Always use frontend_preview_url for operate mode
  const iframeUrl = altaner?.frontend_preview_url;

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setIframeError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setIframeError(true);
  }, []);

  // If altaner is not loaded yet, show loading
  if (!altaner) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // If no preview URL is available
  if (!iframeUrl) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No Preview Available</div>
          <div className="text-sm opacity-70">
            This project doesn't have a preview URL configured.
          </div>
          <div className="text-xs opacity-50 mt-2">
            frontend_preview_url is missing
          </div>
        </div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: 'background.default',
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper',
            zIndex: 1,
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}

      {/* Error state */}
      {iframeError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper',
            zIndex: 1,
          }}
        >
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Failed to Load</div>
            <div className="text-sm opacity-70 mb-4">
              The interface couldn't be loaded.
            </div>
            <button
              onClick={() => {
                setIframeError(false);
                setIsLoading(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </Box>
      )}

      {/* The actual iframe */}
      <iframe
        src={iframeUrl}
        title="App Preview"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: iframeError ? 'none' : 'block',
        }}
        allow="camera; microphone; geolocation; autoplay; encrypted-media; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
      />
    </Box>
  );
}

export default memo(OperateView);

