import { getDefaultColumnDef } from './defaultColumnDef';
import Iconify from '../../../../iconify';

export const getJsonColumnDef = ({ field, getCommonFieldMenuItems }) => ({
  ...getDefaultColumnDef({
    field,
    getCommonFieldMenuItems,
    cellEditor: 'JsonEditor',
    cellEditorPopup: true,
    cellEditorPopupPosition: 'under',
    valueParser: (params) => {
      if (!params.newValue) return null;
      return typeof params.newValue === 'string'
        ? params.newValue
        : JSON.stringify(params.newValue);
    },
    additionalProps: {
      cellRenderer: (params) => {
        try {
          const value = params.value;
          if (!value) return '';

          // If it's a string, try to parse it, otherwise use the value directly
          const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;

          // Get a preview of the JSON content
          const isObject = typeof jsonValue === 'object' && jsonValue !== null;
          const preview = isObject
            ? `${Object.keys(jsonValue).length} fields`
            : JSON.stringify(jsonValue).slice(0, 20) +
            (JSON.stringify(jsonValue).length > 20 ? '...' : '');

          return (
            <div className="flex items-center gap-2 w-full">
              <div
                className="rounded-full py-1 px-2 flex items-center gap-1 max-w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                onClick={() =>
                  params.api.startEditingCell({
                    rowIndex: params.rowIndex,
                    colKey: params.column.colId,
                  })}
                style={{ cursor: 'pointer', maxWidth: '100%' }}
              >
                <Iconify
                  icon="mdi:code-json"
                  style={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="truncate text-xs font-mono"
                  title={JSON.stringify(jsonValue, null, 2)}
                >
                  {preview}
                </span>
              </div>
            </div>
          );
        } catch {
          return (
            <div className="flex items-center gap-2 w-full">
              <div className="rounded-full py-1 px-2 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400">
                <Iconify
                  icon="mdi:alert-circle"
                  style={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                  }}
                />
                <span className="text-xs">Invalid JSON</span>
              </div>
            </div>
          );
        }
      },
      cellEditorParams: {
        maxLength: 100000,
      },
      width: 220,
      maxWidth: 300,
      cellClass: () => 'border-r border-gray-200',
      tooltipField: field.db_field_name,
    },
  }),
});
