/* eslint-disable react/display-name */
import { memo, useState, useEffect } from 'react';

const GridStatusPanel = memo((props) => {
  const { api } = props;

  const [totalRows, setTotalRows] = useState(0);
  const [selectedRows, setSelectedRows] = useState(0);

  useEffect(() => {
    if (!api) return;

    // Initial count - use setTimeout to avoid React rendering lifecycle issues
    setTimeout(() => {
      setTotalRows(api.getDisplayedRowCount() - 1); // Subtract 1 for the '+' row
    }, 0);

    // Set up event listeners for selection changes
    const onSelectionChanged = () => {
      setSelectedRows(api.getSelectedRows().length);
    };

    // Set up event listeners for row data changes
    const onModelUpdated = () => {
      setTotalRows(api.getDisplayedRowCount() - 1); // Subtract 1 for the '+' row
    };

    api.addEventListener('selectionChanged', onSelectionChanged);
    api.addEventListener('modelUpdated', onModelUpdated);

    return () => {
      api.removeEventListener('selectionChanged', onSelectionChanged);
      api.removeEventListener('modelUpdated', onModelUpdated);
    };
  }, [api]);

  return (
    <div className="flex items-center h-full px-4 text-sm">
      {selectedRows > 0 ? (
        <span>
          {selectedRows} selected of {totalRows} records
        </span>
      ) : (
        <span>{totalRows} records</span>
      )}
    </div>
  );
});

export default GridStatusPanel;
