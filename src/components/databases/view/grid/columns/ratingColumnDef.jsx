import { Icon } from '@iconify/react';

export const getRatingColumnDef = ({ field, getCommonFieldMenuItems }) => ({
  field: field.db_field_name,
  headerName: field.name,
  width: 160,
  editable: true,
  cellStyle: { display: 'flex', alignItems: 'center', paddingLeft: '12px' },
  valueParser: (params) => Number(params.newValue),
  cellRenderer: (params) => {
    const ratingOptions = field.options?.rating_options || {
      icon: 'mdi:star',
      color: '#EAB308',
      maximum: 5,
    };

    const handleClick = (newValue) => (e) => {
      e.stopPropagation();

      console.log('Rating click:', {
        currentValue: Number(params.value) || 0,
        newValue,
        colId: params.column.colId,
      });

      params.api.startEditingCell({
        rowIndex: params.node.rowIndex,
        colKey: params.column.colId,
      });

      params.api.stopEditing();
      params.node.setDataValue(
        params.column.colId,
        Number(params.value) === newValue ? null : newValue,
      );
    };

    return (
      <div
        style={{
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {[...Array(ratingOptions.maximum)].map((_, index) => (
          <Icon
            key={index}
            icon={ratingOptions.icon}
            className="transition-all duration-150 hover:scale-110"
            style={{
              color: index < (Number(params.value) || 0) ? ratingOptions.color : '#e2e8f0',
              width: 20,
              height: 20,
              cursor: 'pointer',
            }}
            onClick={handleClick(index + 1)}
          />
        ))}
      </div>
    );
  },
  headerComponent: (params) => {
    const ratingOptions = field.options?.rating_options || {
      icon: 'mdi:star',
      color: '#EAB308',
    };

    return (
      <div className="flex items-center gap-2">
        <Icon
          icon={ratingOptions.icon}
          style={{
            color: ratingOptions.color,
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
