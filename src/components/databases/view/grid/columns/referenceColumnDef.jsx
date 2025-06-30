import RecordChip from '../../../records/RecordChip';

export const getReferenceColumnDef = ({ field, table, getCommonFieldMenuItems }) => ({
  field: field.db_field_name,
  headerName: field.name,
  editable: true,
  cellEditor: 'ReferenceField',
  cellEditorPopup: true,
  cellEditorPopupPosition: 'under',
  valueParser: (params) => {
    if (!params.newValue || params.newValue === '') {
      return null;
    }
    // Return the single value directly
    return params.newValue;
  },
  valueFormatter: (params) => {
    if (!params.value) return '';
    const referenceOptions = field.options?.reference_options;
    const tableName = referenceOptions?.foreign_table_name || 'Record';
    return `${tableName} ${params.value}`;
  },
  cellRenderer: (params) => {
    if (!params.value) return null;
    const referenceOptions = field.options?.reference_options;
    const foreignTableId = referenceOptions?.foreign_table;

    return (
      <div className="h-full w-full flex items-center overflow-visible p-1">
        <div className="flex flex-wrap gap-1 min-w-0 w-full">
          <RecordChip
            key={`${foreignTableId}-${params.value}`}
            baseId={table.base_id}
            tableId={foreignTableId}
            recordId={params.value}
          />
        </div>
      </div>
    );
  },
  headerComponent: (params) => {
    const IconComponent = field.icon;
    return (
      <div className="flex items-center gap-2">
        <IconComponent
          fontSize="small"
          sx={{ opacity: 0.7 }}
        />
        <span>{params.displayName}</span>
      </div>
    );
  },
  cellEditorParams: {
    referenceOptions: field.options,
    baseId: table.base_id,
    tableId: table.id,
  },
  minWidth: 200,
  flex: 1,
  mainMenuItems: (params) => {
    const commonItems = getCommonFieldMenuItems(field, params);
    const referenceSpecificItems = [
      {
        name: 'Copy field URL',
        icon: '<span class="ag-icon ag-icon-link"></span>',
        action: () => {
          const url = `${window.location.origin}/field/${field.id}`;
          navigator.clipboard.writeText(url);
        },
      },
      {
        name: 'Edit field description',
        icon: '<span class="ag-icon ag-icon-info"></span>',
        action: () => {
          console.log('Edit description:', field.name);
        },
      },
    ];

    const insertIndex = commonItems.indexOf('separator') + 1;
    commonItems.splice(insertIndex, 0, ...referenceSpecificItems, 'separator');

    return commonItems;
  },
});
