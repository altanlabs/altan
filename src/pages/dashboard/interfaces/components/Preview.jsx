import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useCallback, useState, useEffect } from 'react';

import IframeControls from './IframeControls';
import LoadingFrame from './LoadingFrame';
import PreviewErrorOverlay from './PreviewErrorOverlay';
import {
  selectNavigationPath,
  selectShouldRefresh,
  selectShouldOpenInNewTab,
  selectIframeViewMode,
  selectPreviewMode,
  selectActionId,
  clearActions,
  setPreviewMode,
} from '../../../../redux/slices/previewControl';
import { useSelector, dispatch } from '../../../../redux/store';
import { optimai } from '../../../../utils/axios';

function Preview({
  interfaceId,
  status,
  iframeUrl,
  productionUrl,
  handleIframeLoad,
  iframeRef,
  fatalError,
  chatIframeRef,
  isLoading,
  apiError,
}) {
  const [isSendingError, setIsSendingError] = useState(false);
  const [isHardRestarting, setIsHardRestarting] = useState(false);

  // Debug logging
  useEffect(() => {
    if (apiError) {
      console.log('Preview component received apiError:', apiError);
    }
  }, [apiError]);

  // Redux state selectors
  const navigationPath = useSelector(selectNavigationPath);
  const shouldRefresh = useSelector(selectShouldRefresh);
  const shouldOpenInNewTab = useSelector(selectShouldOpenInNewTab);
  const iframeViewMode = useSelector(selectIframeViewMode);
  const previewMode = useSelector(selectPreviewMode);
  const actionId = useSelector(selectActionId);

  // Determine the current URL based on preview mode
  const currentUrl = previewMode === 'production' && productionUrl ? productionUrl : iframeUrl;

  // Effect to automatically adjust preview mode when switching interfaces (projects)
  useEffect(() => {
    if (!productionUrl) {
      dispatch(setPreviewMode('development'));
    } else {
      dispatch(setPreviewMode('production'));
    }
  }, [interfaceId, productionUrl]); // Added productionUrl to dependencies

  // Effect to update iframe src when currentUrl changes
  useEffect(() => {
    if (iframeRef.current && currentUrl && iframeRef.current.src !== currentUrl) {
      // eslint-disable-next-line no-param-reassign
      iframeRef.current.src = currentUrl;
    }
  }, [currentUrl, iframeRef]);

  // Effect to handle Redux actions
  useEffect(() => {
    if (!actionId) return;

    if (navigationPath && iframeRef.current) {
      try {
        const currentUrl = new URL(iframeRef.current.src);
        currentUrl.pathname = navigationPath;
        const newUrl = currentUrl.toString();

        // Create a new iframe element to replace the current one
        const iframe = iframeRef.current;
        const newIframe = iframe.cloneNode();
        newIframe.src = newUrl;
        newIframe.onload = handleIframeLoad;
        iframe.parentNode.replaceChild(newIframe, iframe);

        // Update the ref to point to the new iframe
        // eslint-disable-next-line no-param-reassign
        iframeRef.current = newIframe;
      } catch {
        // console.error('Error navigating to path:', error);
      }
    }

    if (shouldRefresh && iframeRef.current) {
      const iframe = iframeRef.current;
      const currentSrc = iframe.src;
      iframe.src = '';
      iframe.src = currentSrc;
    }

    if (shouldOpenInNewTab) {
      const url = iframeRef.current?.src || currentUrl;
      if (url) {
        window.open(url, '_blank');
      }
    }

    // Clear actions after processing
    dispatch(clearActions());
  }, [
    actionId,
    navigationPath,
    shouldRefresh,
    shouldOpenInNewTab,
    iframeRef,
    handleIframeLoad,
    currentUrl,
  ]);

  // Handler to send error to agent (if targeting 'ai')
  const sendErrorToAgent = useCallback(
    async (data) => {
      if (isSendingError) {
        return;
      }
      setIsSendingError(true);
      try {
        await optimai.post(`/interfaces/dev/${interfaceId}/send-dev-error`, data);
      } catch {
        // console.error('Error sending error to agent:', err);
      } finally {
        const timeoutId = setTimeout(() => setIsSendingError(false), 4000);
        return () => clearTimeout(timeoutId);
      }
    },
    [interfaceId, isSendingError],
  );

  // Handler for hard restart
  const handleHardRestart = useCallback(async () => {
    if (isHardRestarting) return;

    setIsHardRestarting(true);
    try {
      await optimai.post(`/interfaces/dev/${interfaceId}/clear-cache-restart`);
      // Optionally reload the iframe after restart
      setTimeout(() => {
        if (iframeRef.current) {
          const currentSrc = iframeRef.current.src;
          // eslint-disable-next-line no-param-reassign
          iframeRef.current.src = '';
          // eslint-disable-next-line no-param-reassign
          iframeRef.current.src = currentSrc;
        }
      }, 2000);
    } catch {
      // console.error('Error performing hard restart:', err);
    } finally {
      setIsHardRestarting(false);
    }
  }, [interfaceId, isHardRestarting, iframeRef]);

  return (
    <Box
      flex={1}
      sx={{ position: 'relative' }}
    >
      {apiError?.type === 'api_500' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white z-50 p-8">
          <div className="relative max-w-lg w-full p-6 rounded-2xl shadow-2xl border border-red-500/30 bg-gray-900/60 backdrop-blur-lg text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 rounded-2xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2 mb-4">
                ⚠️ Error with preview
              </h2>
              <p className="text-gray-300 mb-6">
                {apiError.message}
              </p>
              <button
                className="w-full px-6 py-3 bg-blue-500/20 hover:bg-blue-500/50 text-blue-300 hover:text-white rounded-xl shadow-md transition-all duration-300 ease-in-out backdrop-blur-lg border border-blue-400/40 hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleHardRestart}
                disabled={isHardRestarting}
              >
                {isHardRestarting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                    Restarting...
                  </span>
                ) : (
                  'Try hard restart'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {(!status || status === 'stopped' || status === 'running:stalled') &&
        previewMode === 'development' && !apiError && <LoadingFrame status={status} />}
      {(status === 'running' || previewMode === 'production') && !apiError && (
        <>
          <iframe
            id="preview-iframe"
            src={currentUrl}
            onLoad={handleIframeLoad}
            ref={iframeRef}
            allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
            style={{
              width: iframeViewMode === 'mobile' ? '375px' : '100%',
              height: '100%',
              border: 'none',
              margin: iframeViewMode === 'mobile' ? '0 auto' : undefined,
              display: 'block',
            }}
          />
          {fatalError && (
            <PreviewErrorOverlay
              error={fatalError}
              sendErrorToAgent={sendErrorToAgent}
            />
          )}
          <IframeControls
            previewIframeRef={iframeRef}
            chatIframeRef={chatIframeRef}
            interfaceId={interfaceId}
            key={isLoading}
          />
        </>
      )}
    </Box>
  );
}

Preview.propTypes = {
  status: PropTypes.string,
  iframeUrl: PropTypes.string.isRequired,
  productionUrl: PropTypes.string,
  handleIframeLoad: PropTypes.func.isRequired,
  iframeRef: PropTypes.object.isRequired,
  chatIframeRef: PropTypes.object.isRequired,
  fatalError: PropTypes.object,
  interfaceId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  apiError: PropTypes.object,
};

export default memo(Preview);
