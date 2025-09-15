export const getDefaultColumnDef = ({
  field,
  getCommonFieldMenuItems,
  onEditField,
  cellEditor = 'agLargeTextCellEditor',
  additionalProps = {},
}) => ({
  field: field.db_field_name,
  headerName: field.name,
  width: 250,
  minWidth: 100, // Further increased to accommodate longer text
  maxWidth: 600, // Add max width to prevent columns from being too wide
  editable: true,
  resizable: true,
  sortable: true,
  filter: true,
  suppressSizeToFit: true,
  autoHeight: false,
  wrapText: true,
  cellEditorPopup: true,

  // Simple cell style that doesn't interfere with AG-Grid's layout
  cellStyle: (params) => {
    const fieldName = field.name?.toLowerCase() || field.db_field_name?.toLowerCase() || '';
    const isCurrencyField =
      field.type === 'number' &&
      (fieldName.includes('price') ||
        fieldName.includes('cost') ||
        fieldName.includes('revenue') ||
        fieldName.includes('amount') ||
        fieldName.includes('fee') ||
        fieldName.includes('salary') ||
        fieldName.includes('budget') ||
        fieldName.includes('total'));

    return {
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      ...(isCurrencyField && {
        justifyContent: 'flex-end',
        paddingRight: '12px',
        fontWeight: '500',
        color: '#059669', // Green color for currency
      }),
    };
  },

  // Add tooltip to show full content on hover for long text
  tooltipField: field.db_field_name,

  valueFormatter: (params) => {
    if (field.type === 'number') {
      const value = params.value;
      if (value === null || value === undefined || value === '') return '';

      // Check if this looks like a currency field based on field name
      const fieldName = field.name?.toLowerCase() || field.db_field_name?.toLowerCase() || '';
      const isCurrencyField =
        fieldName.includes('price') ||
        fieldName.includes('cost') ||
        fieldName.includes('revenue') ||
        fieldName.includes('amount') ||
        fieldName.includes('fee') ||
        fieldName.includes('salary') ||
        fieldName.includes('budget') ||
        fieldName.includes('total');

      if (isCurrencyField) {
        // Format as currency
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Number(value));
      }

      return Number(value)
        .toFixed(2)
        .replace(/\.?0+$/, '');
    }
    return params.value;
  },

  headerComponent: (params) => {
    const IconComponent = field.icon;

    // Check if this looks like a currency field for number types
    const fieldName = field.name?.toLowerCase() || field.db_field_name?.toLowerCase() || '';
    const isCurrencyField =
      field.type === 'number' &&
      (fieldName.includes('price') ||
        fieldName.includes('cost') ||
        fieldName.includes('revenue') ||
        fieldName.includes('amount') ||
        fieldName.includes('fee') ||
        fieldName.includes('salary') ||
        fieldName.includes('budget') ||
        fieldName.includes('total'));

    const handleHeaderClick = (e) => {
      e.stopPropagation();
      if (onEditField) {
        onEditField(field);
      }
    };

    return (
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleHeaderClick}
        title="Click to edit field"
      >
        {isCurrencyField ? (
          <span style={{ fontSize: '16px', opacity: 0.7 }}>$</span>
        ) : IconComponent ? (
          <IconComponent
            fontSize="small"
            sx={{ opacity: 0.7 }}
          />
        ) : null}
        <span>{params.displayName}</span>
      </div>
    );
  },

  cellRenderer: undefined,
  cellEditor,
  mainMenuItems: (params) => getCommonFieldMenuItems(field, params),

  // Disable auto-size to maintain our width settings
  suppressAutoSize: true,

  ...additionalProps,
});

// Helper function to auto-size columns based on content
export const autoSizeColumns = (gridApi, columnIds = null) => {
  if (gridApi) {
    if (columnIds) {
      gridApi.autoSizeColumns(columnIds);
    } else {
      gridApi.sizeColumnsToFit();
    }
  }
};

// Helper function to set optimal column widths
export const setOptimalColumnWidths = (gridApi, columnApi) => {
  if (gridApi && columnApi) {
    const allColumnIds = columnApi.getAllColumns().map((col) => col.getColId());

    // Auto-size all columns first
    gridApi.autoSizeColumns(allColumnIds);

    // Then ensure no column is too narrow or too wide
    allColumnIds.forEach((colId) => {
      const column = columnApi.getColumn(colId);
      if (column) {
        const currentWidth = column.getActualWidth();
        if (currentWidth < 150) {
          columnApi.setColumnWidth(colId, 150);
        } else if (currentWidth > 400) {
          columnApi.setColumnWidth(colId, 400);
        }
      }
    });
  }
};
