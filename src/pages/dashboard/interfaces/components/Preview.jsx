import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { memo, useCallback, useState } from 'react';

import IframeControls from './IframeControls';
import LoadingFrame from './LoadingFrame';
import PreviewErrorOverlay from './PreviewErrorOverlay';
import HireAnExpert from '../../../../components/HireAnExpert';
import { optimai } from '../../../../utils/axios';

function Preview({
  interfaceId,
  status,
  iframeUrl,
  viewMode,
  handleIframeLoad,
  iframeRef,
  fatalError,
  chatIframeRef,
  isLoading,
}) {
  const [openHireExpert, setOpenHireExpert] = useState(false);
  const [isSendingError, setIsSendingError] = useState(false);

  // Handler to send error to agent (if targeting 'ai')
  const sendErrorToAgent = useCallback(
    async (data) => {
      if (isSendingError) {
        return;
      }
      setIsSendingError(true);
      try {
        await optimai.post(`/interfaces/dev/${interfaceId}/send-dev-error`, data);
      } catch (err) {
        console.error('Error sending error to agent:', err);
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
      {(!status || status === 'stopped') && <LoadingFrame status={status} />}
      {status === 'running' && (
        <>
          <iframe
            id="preview-iframe"
            src={iframeUrl}
            onLoad={handleIframeLoad}
            ref={iframeRef}
            allow="clipboard-read; clipboard-write; fullscreen; camera; microphone; geolocation; payment; accelerometer; gyroscope; usb; midi; cross-origin-isolated; gamepad; xr-spatial-tracking; magnetometer; screen-wake-lock; autoplay"
            style={{
              width: viewMode === 'mobile' ? '375px' : '100%',
              height: '100%',
              border: 'none',
              margin: viewMode === 'mobile' ? '0 auto' : undefined,
              display: 'block',
            }}
          />
          {fatalError && (
            <PreviewErrorOverlay
              error={fatalError}
              sendErrorToAgent={sendErrorToAgent}
              setOpenHireExpert={setOpenHireExpert}
            />
          )}
          <HireAnExpert
            open={openHireExpert}
            setOpen={setOpenHireExpert}
            iconSize={15}
          />
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
  viewMode: PropTypes.string.isRequired,
  handleIframeLoad: PropTypes.func.isRequired,
  iframeRef: PropTypes.object.isRequired,
  chatIframeRef: PropTypes.object.isRequired,
  fatalError: PropTypes.object,
  interfaceId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default memo(Preview);
