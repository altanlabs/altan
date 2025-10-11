import { Tooltip } from '@mui/material';

import Iconify from '../../../../iconify/Iconify';

export const getIdColumnDef = ({ handleExpandRecord }) => ({
  headerName: 'Id',
  field: 'id',
  headerCheckboxSelection: true,
  headerComponent: (params) => (
    <div className="flex items-center gap-2">
      <Iconify
        icon="mdi:key"
        fontSize="small"
        sx={{ opacity: 0.7 }}
      />
      <span>{params.displayName}</span>
    </div>
  ),
  checkboxSelection: true,
  width: 40,
  pinned: 'left',
  lockPosition: true,
  suppressMovable: true,
  editable: false,
  sortable: true,
  valueGetter: (params) => {
    return params.data?.id || '';
  },
  sort: 'asc',
  comparator: (valueA, valueB) => {
    return String(valueA).localeCompare(String(valueB));
  },
  mainMenuItems: [
    'sortAscending',
    'sortDescending',
    'separator',
    'pinSubMenu',
    'autoSizeThis',
    'autoSizeAll',
  ],
  cellRenderer: (params) => {
    if (!params.value) return null;
    const truncatedId = typeof params.value === 'string' ? params.value.slice(0, 4) : params.value;
    return (
      <div className="flex items-center justify-center w-full h-full group relative">
        <Tooltip
          title="Edit record"
          enterDelay={400}
          enterNextDelay={400}
          leaveDelay={0}
          TransitionProps={{ timeout: 100 }}
          sx={{ cursor: 'pointer' }}
        >
          <Iconify
            icon="mdi:pencil"
            color="text.secondary"
            className="cursor-pointer mr-2"
            width={12}
            onClick={(e) => {
              e.stopPropagation();
              handleExpandRecord(params.data.id);
            }}
          />
        </Tooltip>
        <span className="text-xs font-mono">{truncatedId}</span>
      </div>
    );
  },
});
