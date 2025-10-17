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
import { optimai_pods } from '../../../../utils/axios';

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
}) {
  const [isSendingError, setIsSendingError] = useState(false);

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
  // Only force development mode if there's NO production URL
  useEffect(() => {
    if (!productionUrl) {
      // No production URL means we can only use development
      dispatch(setPreviewMode('development'));
    }
    // If productionUrl exists, respect the user's localStorage preference
    // Don't force it to production anymore
  }, [interfaceId, productionUrl]);

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
        await optimai_pods.post(`/interfaces/dev/${interfaceId}/send-dev-error`, data);
      } catch {
        // console.error('Error sending error to agent:', err);
      } finally {
        const timeoutId = setTimeout(() => setIsSendingError(false), 4000);
        return () => clearTimeout(timeoutId);
      }
    },
    [interfaceId, isSendingError],
  );

  return (
    <Box
      flex={1}
      sx={{ position: 'relative' }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: iframeViewMode === 'desktop' ? 'stretch' : 'flex-start',
          pt: iframeViewMode === 'mobile' || iframeViewMode === 'tablet' ? 2 : 0,
        }}
      >
        <Box
          sx={{
            width:
              iframeViewMode === 'mobile'
                ? '375px'
                : iframeViewMode === 'tablet'
                  ? '768px'
                  : '100%',
            height: iframeViewMode === 'desktop' ? '100%' : 'calc(100% - 16px)',
            maxWidth: '100%',
            borderRadius: iframeViewMode === 'mobile' || iframeViewMode === 'tablet' ? 2 : 0,
            overflow: 'hidden',
            boxShadow:
              iframeViewMode === 'mobile' || iframeViewMode === 'tablet'
                ? '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)'
                : 'none',
            border:
              iframeViewMode === 'mobile' || iframeViewMode === 'tablet'
                ? '1px solid rgba(0, 0, 0, 0.08)'
                : 'none',
            position: 'relative',
          }}
        >
          <iframe
            id="preview-iframe"
            src={currentUrl}
            onLoad={handleIframeLoad}
            ref={iframeRef}
            allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        </Box>
      </Box>
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
};

export default memo(Preview);
