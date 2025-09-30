import { Tooltip } from '@mui/material';
import { format } from 'date-fns';

import Iconify from '../../../../iconify/Iconify';

export const getCreatedAtColumnDef = () => ({
  headerName: 'Created At',
  field: 'created_at',
  width: 160,
  headerComponent: (params) => (
    <div className="flex items-center gap-2">
      <Iconify
        icon="mdi:calendar-plus"
        fontSize="small"
        sx={{ opacity: 0.7 }}
      />
      <span>{params.displayName}</span>
    </div>
  ),
  editable: false,
  sortable: true,
  filter: 'agDateColumnFilter',
  filterParams: {
    comparator: (filterLocalDateAtMidnight, cellValue) => {
      if (!cellValue) return -1;
      const cellDate = new Date(cellValue);
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      } else if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
      return 0;
    },
  },
  mainMenuItems: ['sortAscending', 'sortDescending', 'separator', 'autoSizeThis', 'autoSizeAll'],
  cellRenderer: (params) => {
    const isNewRecord =
      params.data.id === '__new__' ||
      params.data.id === '+' ||
      !params.data.id ||
      params.data.id === '';
    if (!params.value || isNewRecord) return null;

    try {
      const dateObj = new Date(params.value);
      const formatted = format(dateObj, 'PPp'); // Format: Apr 29, 2021, 5:34 PM

      return (
        <Tooltip
          title={formatted}
          enterDelay={400}
          enterNextDelay={400}
          leaveDelay={0}
          TransitionProps={{ timeout: 100 }}
        >
          <div>{formatted}</div>
        </Tooltip>
      );
    } catch (error) {
      console.error('Error formatting date:', error);
      return params.value;
    }
  },
});
