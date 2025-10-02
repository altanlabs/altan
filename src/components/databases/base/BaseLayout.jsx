import React, { memo } from 'react';
import { useSelector } from 'react-redux';

import TableTabs from './TableTabs.jsx';
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
}) {
  const sqlTerminalMode = useSelector(selectSQLTerminalMode);

  // ------------------
  // Main Content Block: TableTabs on top and Table/SQL Terminal view below.
  // Uses min-w-0 to allow flex sizing without overflow.

  if (sqlTerminalMode) {
    return (
      <div className="flex flex-col h-full w-full min-w-0">
        <div className="flex-1 relative overflow-auto min-w-0">
          <SQLTerminal baseId={baseId} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-w-0">
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
    </div>
  );
}

export default memo(BaseLayout);
