// ResponsiveInterfaceLayout.tsx
import { Tabs, Tab, useMediaQuery } from '@mui/material';
import React, { memo } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import LoadingFrame from './LoadingFrame';
import Iconify from '../../../../components/iconify';
import AltanerDrawer from '../../altaners/room/AltanerDrawer';

function InterfaceRemixLayout({
  uiInterface,
  app,
  handleReload,
  isLoading,
  status,
  iframeUrl,
  handleIframeLoad,
  iframeRef,
}) {
  // Use Material UI breakpoint for mobile detection
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = React.useState(1);

  // Main Preview Area – Header (with reload and open buttons) and preview iframe.
  const renderMainContent = () => (
    <div className="flex flex-col h-full">
      <div
        className="relative flex flex-row items-center space-x-1 p-1 border-b rounded-t-xl min-h-[40px]"
        // style={{
        //   border: '1px solid',
        //   borderColor: isLoading ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-divider)',
        //   backgroundColor: 'var(--mui-palette-grey-100)',
        // }}
      >
        {/* Reload Button */}
        <button
          onClick={handleReload}
          title="Reload Interface"
          disabled={isLoading}
          className="p-1"
        >
          <Iconify icon="mdi:refresh" />
        </button>

        {/* Info Text */}
        <div className="flex flex-row flex-1 items-center space-x-1">
          <p className="text-sm text-black dark:text-white font-mono">
            {uiInterface?.deployment_url || `${uiInterface?.repo_name}.preview.altan.ai`}
          </p>
        </div>

        {/* Open Deployment Button */}
        <div className="flex flex-row">
          <button
            onClick={() =>
              window.open(
                uiInterface?.deployment_url || `https://${uiInterface?.repo_name}.preview.altan.ai`,
                '_blank',
              )}
            title="Open Deployment in New Tab"
            className="p-1"
          >
            <Iconify icon="mdi:open-in-new" />
          </button>
        </div>

        {/* Animated Underline */}
        <div
          className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-150 ease-in-out ${
            isLoading ? 'w-full opacity-100' : 'w-0 opacity-0'
          }`}
        />
      </div>

      {/* Preview / Iframe Area */}
      <div className="flex-1 relative">
        {(!status || status === 'stopped') && !uiInterface?.deployment_url && (
          <LoadingFrame status={status} />
        )}
        {((status === 'running' && uiInterface?.repo_name) || uiInterface?.deployment_url) && (
          <iframe
            id="preview-iframe"
            src={iframeUrl}
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
        )}
      </div>
    </div>
  );

  // ─── MOBILE VIEW: TABS ──────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {uiInterface?.id && <Tab label="Chat" />}
          <Tab label="Preview" />
        </Tabs>
        {uiInterface?.id && tabValue === 0 && (
          <div className="h-[calc(100%-48px)] overflow-auto">
            <AltanerDrawer
              roomId={app.room_id}
              side="left"
              accountId={app.account_id}
            />
          </div>
        )}
        {tabValue === (uiInterface?.id ? 1 : 0) && (
          <div className="h-[calc(100%-48px)] overflow-auto">{renderMainContent()}</div>
        )}
      </div>
    );
  }

  // ─── DESKTOP VIEW: RESIZABLE PANELS ─────────────────────────────────────────────────
  return (
    <PanelGroup
      direction="horizontal"
      className="w-full h-full"
    >
      {/* Left Panel: AltanerDrawer (only rendered if uiInterface exists) */}
      {uiInterface?.id && (
        <Panel
          defaultSize={25} // 25% of total width
          minSize={15} // ~15% (~240px on wider screens)
          maxSize={40} // 40% maximum to preserve main area space
          className="overflow-auto"
        >
          <AltanerDrawer
            roomId={app.room_id}
            side="left"
            accountId={app.account_id}
          />
        </Panel>
      )}
      {uiInterface?.id && (
        <PanelResizeHandle className="bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-1 cursor-ew-resize" />
      )}
      {/* Right Panel: Main Preview Content */}
      <Panel
        minSize={uiInterface?.id ? 30 : 100} // If no interface panel, main takes full width.
        className="overflow-hidden min-w-0"
      >
        {renderMainContent()}
      </Panel>
    </PanelGroup>
  );
}

export default memo(InterfaceRemixLayout);
