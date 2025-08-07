import { deleteFieldThunk } from '../../../../../redux/slices/bases';
import { dispatch } from '../../../../../redux/store';

const createFieldContextMenuItems = (field, params, setEditField, tableId) => {
  return [
    {
      name: 'Edit field',
      icon: '<span class="ag-icon ag-icon-cut"></span>',
      action: () => {
        setEditField(field);
      },
    },
    {
      name: 'Duplicate field',
      disabled: true,
      icon: '<span class="ag-icon ag-icon-copy"></span>',
    },
    'separator',
    {
      name: 'Insert left',
      disabled: true,
      icon: '<span class="ag-icon ag-icon-left"></span>',
    },
    {
      name: 'Insert right',
      disabled: true,
      icon: '<span class="ag-icon ag-icon-right"></span>',
    },
    'separator',
    'sortAscending',
    'sortDescending',
    'separator',
    {
      name: 'Hide field',
      disabled: true,
      icon: '<span class="ag-icon ag-icon-eye-slash"></span>',
      action: () => {
        if (params.columnApi) {
          params.columnApi.setColumnVisible(field.name.toLowerCase(), false);
        }
      },
    },
    'separator',
    {
      name: 'Delete field',
      icon: '<span class="ag-icon ag-icon-cross"></span>',
      cssClasses: ['text-red-600'],
      action: () => {
        dispatch(deleteFieldThunk(tableId, field.id));
      },
    },
  ];
};

export default createFieldContextMenuItems;
