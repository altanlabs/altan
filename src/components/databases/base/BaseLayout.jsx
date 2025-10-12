import { Box } from '@mui/material';
import React, { memo } from 'react';
import { useSelector } from 'react-redux';

import BaseSidebar from './BaseSidebar.jsx';
import TableTabs from './TableTabs.jsx';
import BaseOverview from './sections/overview/BaseOverview.jsx';
import BasePlaceholder from './sections/BasePlaceholder.jsx';
import BaseUsers from './sections/BaseUsers.jsx';
import BaseAuth from './sections/BaseAuth.jsx';
import BaseStorage from './sections/BaseStorage.jsx';
import useResponsive from '../../../hooks/useResponsive.js';
import { selectSQLTerminalMode } from '../../../redux/slices/bases';
import LoadingFallback from '../../LoadingFallback.jsx';
import SQLTerminal from '../sql/SQLTerminal.jsx';
import Table from '../table/Table.jsx';

function BaseLayout({
  baseId,
  tableId,
  handleTabChange,
  handleOpenCreateTable,
  handleDeleteTable,
  handleImportTable,
  state,
  isTableLoading,
  viewId,
  triggerImport,
  activeSection = 'overview',
  onSectionChange,
}) {
  const sqlTerminalMode = useSelector(selectSQLTerminalMode);
  const isMobile = useResponsive('down', 'md');

  // Render content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return <BaseOverview baseId={baseId} onNavigate={onSectionChange} />;
      case 'tables':
        return renderTablesContent();
      case 'users':
        return <BaseUsers baseId={baseId} onNavigate={onSectionChange} />;
      case 'auth':
        return <BaseAuth baseId={baseId} onNavigate={onSectionChange} />;
      case 'storage':
        return <BaseStorage baseId={baseId} onNavigate={onSectionChange} />;
      case 'functions':
        return <BasePlaceholder title="Edge Functions" description="Configure functions executed in your app." />;
      case 'secrets':
        return <BasePlaceholder title="Secrets" description="Store and manage environment variables securely." />;
      case 'logs':
        return <BasePlaceholder title="Logs" description="Monitor application logs to debug issues." />;
      default:
        return renderTablesContent();
    }
  };

  const renderTablesContent = () => (
    <>
      <div className="shrink-0 min-w-0 w-full">
        <TableTabs
          activeTableId={tableId}
          onTableChange={handleTabChange}
          onCreateTable={handleOpenCreateTable}
          onDeleteTable={handleDeleteTable}
          onImportTable={handleImportTable}
          isLoading={state.isTableSwitching}
          baseId={baseId}
        />
      </div>
      <div className="flex-1 relative overflow-auto min-w-0">
        {(state.isTableSwitching || isTableLoading) && <LoadingFallback />}
        {tableId && viewId && !state.isTableSwitching && (
          <Table
            tableId={tableId}
            viewId={viewId}
            baseId={baseId}
            triggerImport={triggerImport}
          />
        )}
      </div>
    </>
  );

  // SQL Terminal mode content
  if (sqlTerminalMode) {
    return (
      <Box
        className={`w-full h-full relative overflow-hidden ${
          isMobile ? '' : 'pb-2 px-2'
        }`}
      >
        <Box
          className={`flex flex-col h-full overflow-hidden`}
        >
          <div className="flex-1 relative overflow-auto min-w-0">
            <SQLTerminal baseId={baseId} />
          </div>
        </Box>
      </Box>
    );
  }

  // Main layout with sidebar and content
  return (
    <Box
      className={`w-full h-full relative overflow-hidden ${
        isMobile ? '' : 'pb-2 px-2'
      }`}
    >
      <Box
        className={`flex flex-row h-full overflow-hidden ${
          isMobile ? '' : 'border border-divider rounded-xl'
        }`}
      >
        {/* Left Sidebar */}
        <BaseSidebar
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          open={!isMobile}
        />

        {/* Main Content Area */}
        <Box className="flex-1 flex flex-col overflow-auto min-w-0">
          {renderSectionContent()}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(BaseLayout);
