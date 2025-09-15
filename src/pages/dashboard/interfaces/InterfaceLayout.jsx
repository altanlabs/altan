// ResponsiveInterfaceLayout.tsx
import { Box } from '@mui/material';
import React, { memo, useState } from 'react';
import { useSelector } from 'react-redux';

import Codebase from './components/code/Codebase.jsx';
import IframeControls from './components/IframeControls.jsx';
import Preview from './components/Preview';
import useResponsive from '../../../hooks/useResponsive.js';
import { selectViewType } from '../../../redux/slices/altaners';

/**
 * ResponsiveInterfaceLayout Component
 *
 * Desktop: Uses resizable panels for a split view.
 * Mobile: Uses tabs to toggle between the chat drawer and interface preview.
 */
function InterfaceLayout({
  id,
  chatIframeRef,
  isLoading,
  // viewMode,
  status,
  iframeUrl,
  productionUrl,
  handleIframeLoad,
  iframeRef,
}) {
  const [fatalError, setFatalError] = useState(null);
  const viewType = useSelector(selectViewType);
  const isMobile = useResponsive('down', 'md');

  // Main content: Toolbar and then either Preview or Codebase.
  const mainContent = (
    <Box
      className={`w-full h-full relative overflow-hidden ${
        isMobile ? '' : 'pb-2 px-2'
      }`}
    >
      <Box
        className={`flex flex-col h-full overflow-hidden ${
          isMobile ? '' : 'border border-divider rounded-xl'
        }`}
      >
        {viewType === 'preview' ? (
          <>
            <IframeControls
              interfaceId={id}
              previewIframeRef={iframeRef}
              chatIframeRef={chatIframeRef}
              fatalError={fatalError}
              setFatalError={setFatalError}
            />
            <Preview
              interfaceId={id}
              status={status}
              iframeUrl={iframeUrl}
              productionUrl={productionUrl}
              handleIframeLoad={handleIframeLoad}
              iframeRef={iframeRef}
              chatIframeRef={chatIframeRef}
              isLoading={isLoading}
              fatalError={fatalError}
            />
          </>
        ) : (
          <Codebase
            interfaceId={id}
            chatIframeRef={chatIframeRef}
          />
        )}
      </Box>
    </Box>
  );
  return mainContent;
}

export default memo(InterfaceLayout);
