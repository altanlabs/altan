import { useMediaQuery } from '@mui/material';
import React, { memo } from 'react';

import TableTabs from './TableTabs.jsx';
import LoadingFallback from '../../LoadingFallback.jsx';
import Table from '../table/Table.jsx';

function BaseLayout({
  baseId,
  base,
  hideChat,
  tableId,
  handleTabChange,
  handleOpenCreateTable,
  handleDeleteTable,
  handleRenameTable,
  state,
  isTableLoading,
  viewId,
}) {
  // Detect mobile screens using Material UI breakpoint
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = React.useState(1);

  // ------------------
  // Main Content Block: TableTabs on top and Table view below.
  // Uses min-w-0 to allow flex sizing without overflow.
  return (
    <div className="flex flex-col h-full min-w-0">
      <div className="flex-1 relative overflow-auto">
        {(state.isTableSwitching || isTableLoading) && <LoadingFallback />}
        {tableId && viewId && !state.isTableSwitching && (
          <Table
            tableId={tableId}
            viewId={viewId}
            baseId={baseId}
          />
        )}
      </div>
      <TableTabs
        activeTableId={tableId}
        onTableChange={handleTabChange}
        onCreateTable={handleOpenCreateTable}
        onDeleteTable={handleDeleteTable}
        onRenameTable={handleRenameTable}
        isLoading={state.isTableSwitching}
        baseId={baseId}
      />
    </div>
  );

  // // Mobile (Small screens) View: Uses Tabs.
  // if (isMobile) {
  //   return (
  //     <div className="flex flex-col h-full w-full overflow-hidden">
  //       <Tabs
  //         value={tabValue}
  //         onChange={(_, newValue) => setTabValue(newValue)}
  //         variant="fullWidth"
  //         indicatorColor="primary"
  //         textColor="primary"
  //       >
  //         {baseId && <Tab label="Chat" />}
  //         <Tab label="Main" />
  //       </Tabs>
  //       {baseId && tabValue === 0 && !hideChat && (
  //         <div className="h-[calc(100%-48px)] overflow-auto">
  //           <AltanerDrawer
  //             externalRoomId={`base_${baseId}`}
  //             side="left"
  //             initialDrawerOpen={!hideChat}
  //             accountId={base?.account_id}
  //           />
  //         </div>
  //       )}
  //       {tabValue === (baseId ? 1 : 0) && (
  //         <div className="h-[calc(100%-48px)] overflow-auto">{mainContent}</div>
  //       )}
  //     </div>
  //   );
  // }

  // // ------------------
  // // Desktop (Large Screens) View: Use resizable panels.
  // // We simulate minimum and maximum widths by setting percentage limits.
  // return (
  //   <PanelGroup
  //     direction="horizontal"
  //     className="w-full h-full"
  //   >
  //     {/* Left Panel: AltanerDrawer */}
  //     {baseId && !hideChat && (
  //       <Panel
  //         defaultSize={25}
  //         minSize={15} // ~15% -> on a 1600px screen = ~240px minimum
  //         maxSize={40} // Maximum width of 40% ensures the main content remains usable.
  //         className="overflow-auto"
  //       >
  //         <AltanerDrawer
  //           externalRoomId={`base_${baseId}`}
  //           side="left"
  //           initialDrawerOpen={!hideChat}
  //           accountId={base?.account_id}
  //         />
  //       </Panel>
  //     )}
  //     {/* Only show resize handle if there is a drawer (baseId exists) */}
  //     {baseId && (
  //       <PanelResizeHandle className="bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-1 cursor-ew-resize" />
  //     )}
  //     {/* Right Panel: Main Content */}
  //     <Panel
  //       minSize={30}
  //       className="overflow-hidden min-w-0"
  //     >
  //       {mainContent}
  //     </Panel>
  //   </PanelGroup>
  // );
}

export default memo(BaseLayout);
