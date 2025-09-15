import { getDefaultColumnDef } from './defaultColumnDef';

export const getLongTextColumnDef = ({
  field,
  getCommonFieldMenuItems,
  onEditField,
  additionalProps = {},
}) => ({
  ...getDefaultColumnDef({
    field,
    getCommonFieldMenuItems,
    onEditField,
    cellEditor: 'agLargeTextCellEditor',
    additionalProps: {
      headerComponent: (params) => {
        const IconComponent = field.icon;

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
            <IconComponent
              fontSize="small"
              sx={{ opacity: 0.7 }}
            />
            <span>{params.displayName}</span>
          </div>
        );
      },
      minWidth: 240,
      width: 300,
      maxWidth: 800,
      cellEditorParams: {
        maxLength: 100000,
      },
      tooltipField: field.db_field_name,
      cellRenderer: (params) => {
        if (!params.value) return null;
        const account = params.data?.account;
        return (
          <div
            className="flex items-center gap-2"
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              padding: '8px 12px',
            }}
          >
            <span
              className="truncate"
              style={{ maxWidth: account ? '70%' : '100%' }}
            >
              {params.value}
            </span>
            {account && (
              <span
                className="text-xs text-gray-500 dark:text-gray-400 truncate"
                style={{ maxWidth: '30%' }}
              >
                @{account}
              </span>
            )}
          </div>
        );
      },
      cellStyle: {
        padding: 0,
      },
      ...additionalProps,
    },
  }),
});
