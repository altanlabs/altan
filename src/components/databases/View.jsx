// src/components/databases/View.jsx
import { memo } from 'react';

import { GridView } from './view/grid/GridView';

const View = memo(
  ({
    table,
    view,
    fields,
    records,
    totalRecords,
    loading,
    onPageChange,
    onPageSizeChange,
    queryParams,
    onAddField,
    onAddRecord,
    onUpdateRecord,
    onDeleteRecords,
    onLoadMore,
    hasMore,
    onPaginationChange,
    triggerImport,
    baseId,
  }) => {
    if (!view) {
      console.error('View Component: No view configuration provided');
      return <div>Error: View configuration is required</div>;
    }

    if (!table) {
      console.error('View Component: No table data provided');
      return <div>Error: Table data is required</div>;
    }

    // Render based on view type from the view configuration
    switch (view.type) {
      case 'grid':
        return (
          <GridView
            table={table}
            view={view}
            fields={fields}
            records={records}
            totalRecords={totalRecords}
            loading={loading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            queryParams={queryParams}
            onAddRecord={onAddRecord}
            onUpdateRecord={onUpdateRecord}
            onDeleteRecords={onDeleteRecords}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            onPaginationChange={onPaginationChange}
            triggerImport={triggerImport}
            baseId={baseId}
          />
        );

      // Future view types
      case 'gallery':
      case 'kanban':
      case 'calendar':
        console.warn(`View Component: ${view.type} view type not yet implemented`);
        return <div>{`${view.type} view is coming soon!`}</div>;

      default:
        console.error(`View Component: Unknown view type: ${view.type}`);
        return <div>Error: Unsupported view type</div>;
    }
  },
);

// Add display name to fix linter error
View.displayName = 'DatabaseView';

export default View;
