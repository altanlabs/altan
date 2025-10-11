// Simple direct copy function that works everywhere
const directCopy = (text) => {
  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);

  // Select the text and copy
  textarea.select();
  document.execCommand('copy');

  // Clean up
  document.body.removeChild(textarea);
};

// Helper function to check if a row is a new record row
const isNewRecordRow = (data) => {
  if (!data || !data.id) return true;
  return data.id === '__new__' || data.id === '+' || data.id === '';
};

const createRecordContextMenuItems = ({
  selectedNodes,
  currentNode,
  params,
  handlers: { onDuplicateRecord, onDeleteRecords, handleExpandRecord, onAddRecord, onUpdateRecord },
}) => {
  const hasSelection = selectedNodes.length > 0;

  // Copy function that gets the focused cell value
  const handleCopy = () => {
    const { api, node, column } = params;
    if (!node || !node.data) return;

    // Get the focused cell or clicked cell value
    let textToCopy;

    // First, check if there's a specific focused cell
    const focusedCell = api.getFocusedCell();

    if (focusedCell) {
      // Get the value from the focused cell
      const focusedColId = focusedCell.column.getColId();
      textToCopy = node.data[focusedColId] || '';
    } else if (column) {
      // Get the value from the clicked column
      const colId = column.getColId();
      textToCopy = node.data[colId] || '';
    } else {
      // Fallback to ID if nothing else works
      textToCopy = node.data.id || '';
    }

    // Format the value to string
    textToCopy = String(textToCopy);

    // Use the foolproof copy method
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      // This method works in all browsers
      document.execCommand('copy');
    } catch (err) {
      // Silently fail - no UI alerts
      console.error('Copy failed, try again');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handlePaste = async () => {
    if (!navigator.clipboard) return;

    try {
      const text = await navigator.clipboard.readText();
      const rows = text
        .split('\n')
        .filter((row) => row.trim() !== '')
        .map((row) => row.split('\t'));

      if (rows.length === 0) return;

      if (isNewRecordRow(params.node?.data)) {
        handlePasteIntoNewRow(rows, params, onAddRecord);
      } else {
        handlePasteIntoExistingRow(rows, params, onUpdateRecord);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  return [
    {
      name: 'Duplicate record',
      icon: '<span class="ag-icon ag-icon-copy"></span>',
      action: () => {
        if (hasSelection) {
          selectedNodes.forEach((node) => onDuplicateRecord(node.data.id));
        } else if (currentNode) {
          onDuplicateRecord(currentNode.data.id);
        }
      },
      disabled: !hasSelection && (!currentNode || isNewRecordRow(currentNode.data)),
    },
    {
      name: 'Apply template',
      icon: '<span class="ag-icon ag-icon-paste"></span>',
      disabled: !hasSelection,
    },
    {
      name: 'Edit record',
      icon: '<span class="ag-icon ag-icon-edit"></span>',
      disabled: !params.node || isNewRecordRow(params.node.data),
      action: () => handleExpandRecord(params.node.data.id),
    },
    'separator',
    {
      name: 'Copy',
      shortcut: 'Ctrl+C',
      icon: '<span class="ag-icon ag-icon-copy"></span>',
      action: handleCopy,
    },
    {
      name: 'Paste',
      shortcut: 'Ctrl+V',
      icon: '<span class="ag-icon ag-icon-paste"></span>',
      action: handlePaste,
    },
    'separator',
    {
      name: 'Export',
      subMenu: ['csvExport', 'excelExport'],
    },
    'separator',
    {
      name: 'Delete records',
      menuIcon: 'delete',
      cssClasses: ['text-red-600'],
      action: () => {
        if (hasSelection) {
          const selectedIds = selectedNodes.map((node) => node.data.id);
          onDeleteRecords(selectedIds);
        } else if (currentNode && !isNewRecordRow(currentNode.data)) {
          onDeleteRecords([currentNode.data.id]);
        }
      },
      disabled: !hasSelection && (!currentNode || isNewRecordRow(currentNode.data)),
    },
  ];
};

const buildRangeContent = (api, startRow, endRow, visibleColumns, startColIndex, endColIndex) => {
  let content = '';
  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
    const rowNode = api.getDisplayedRowAtIndex(rowIndex);
    if (!rowNode) continue;

    const rowValues = [];
    for (let colIndex = startColIndex; colIndex <= endColIndex; colIndex++) {
      const column = visibleColumns[colIndex];
      const cellValue = rowNode.data[column.getColId()];
      rowValues.push(cellValue !== undefined ? String(cellValue) : '');
    }
    content += rowValues.join('\t') + '\n';
  }
  return content;
};

const handlePasteIntoNewRow = (rows, params, onAddRecord) => {
  const newRecords = rows
    .map((row) => {
      const fieldsPayload = {};
      const columnDefs = params.api.getColumnDefs();
      const startColIndex = getStartColumnIndex(params);

      row.forEach((value, i) => {
        const colIndex = startColIndex + i;
        if (colIndex < columnDefs.length && value.trim()) {
          const field = columnDefs[colIndex].field;
          if (field && field !== 'id') {
            fieldsPayload[field] = value;
          }
        }
      });

      return { fields: fieldsPayload };
    })
    .filter((record) => Object.keys(record.fields).length > 0);

  if (newRecords.length > 0) {
    onAddRecord({ records: newRecords });
  }
};

const handlePasteIntoExistingRow = (rows, params, onUpdateRecord) => {
  const firstRow = rows[0];
  if (firstRow.length === 0) return;

  const updatedData = { ...params.node.data };
  const columnDefs = params.api.getColumnDefs();
  const startColIndex = getStartColumnIndex(params);

  firstRow.forEach((value, i) => {
    const colIndex = startColIndex + i;
    if (colIndex < columnDefs.length) {
      const field = columnDefs[colIndex].field;
      if (field && field !== 'id') {
        updatedData[field] = value;
      }
    }
  });

  onUpdateRecord(updatedData.id, updatedData);
  params.api.applyTransaction({ update: [updatedData] });
};

const getStartColumnIndex = (params) => {
  if (!params.column) return 0;

  const startColIndex = params.api
    .getColumnDefs()
    .findIndex((col) => col.field === params.column.colDef.field);

  return startColIndex < 0 ? 0 : startColIndex;
};

export default createRecordContextMenuItems;
