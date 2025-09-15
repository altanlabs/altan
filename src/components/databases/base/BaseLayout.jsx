import React, { memo, useState, useCallback } from 'react';

import TableTabs from './TableTabs.jsx';
import LoadingFallback from '../../LoadingFallback.jsx';
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
  // Local pagination state
  const [paginationInfo, setPaginationInfo] = useState(null);
  const [paginationHandlers, setPaginationHandlers] = useState(null);

  // Handle pagination changes from child components
  const handlePaginationChange = useCallback((paginationData) => {
    setPaginationInfo(paginationData.paginationInfo);
    setPaginationHandlers(paginationData.handlers);
  }, []);

  // ------------------
  // Main Content Block: TableTabs on top and Table view below.
  // Uses min-w-0 to allow flex sizing without overflow.
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
          paginationInfo={paginationInfo}
          onGoToFirstPage={paginationHandlers?.onGoToFirstPage}
          onGoToLastPage={paginationHandlers?.onGoToLastPage}
          onGoToNextPage={paginationHandlers?.onGoToNextPage}
          onGoToPreviousPage={paginationHandlers?.onGoToPreviousPage}
        />
      </div>
      <div className="flex-1 relative overflow-auto min-w-0">
        {(state.isTableSwitching || isTableLoading) && <LoadingFallback />}
        {tableId && viewId && !state.isTableSwitching && (
          <Table
            tableId={tableId}
            viewId={viewId}
            baseId={baseId}
            onPaginationChange={handlePaginationChange}
            triggerImport={triggerImport}
          />
        )}
      </div>
    </div>
  );
}

export default memo(BaseLayout);
