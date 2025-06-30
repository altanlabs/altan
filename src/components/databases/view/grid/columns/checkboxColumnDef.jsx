import Iconify from '../../../../iconify';

export const getCheckboxColumnDef = ({ field, getCommonFieldMenuItems }) => ({
  field: field.db_field_name,
  headerName: field.name,
  width: 120,
  editable: false,
  cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  valueParser: (params) => {
    return params.newValue === 'true' || params.newValue === true;
  },
  cellRenderer: (params) => {
    const checkboxOptions = field.options?.checkbox_options || {
      icon: 'mdi:check',
      color: '#22C55E',
    };

    const isChecked = params.value === true || params.value === 'true';

    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const newValue = !isChecked;

      params.api.stopEditing();
      params.node.setDataValue(params.column.colId, newValue);
    };

    return (
      <div
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid',
          borderColor: isChecked ? checkboxOptions.color : '#9DA4AE',
          borderRadius: '4px',
          backgroundColor: isChecked ? checkboxOptions.color : 'transparent',
          transition: 'all 0.2s ease',
        }}
      >
        {isChecked && (
          <Iconify
            icon={checkboxOptions.icon}
            style={{
              color: '#FFFFFF',
              width: 16,
              height: 16,
            }}
          />
        )}
      </div>
    );
  },
  headerComponent: (params) => {
    const checkboxOptions = field.options?.checkbox_options || {
      icon: 'mdi:check',
      color: '#22C55E',
    };

    return (
      <div className="flex items-center gap-2">
        <Iconify
          icon={checkboxOptions.icon}
          style={{
            color: checkboxOptions.color,
            width: 20,
            height: 20,
            opacity: 0.7,
          }}
        />
        <span>{params.displayName}</span>
      </div>
    );
  },
  mainMenuItems: (params) => getCommonFieldMenuItems(field, params),
});
