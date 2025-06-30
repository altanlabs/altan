import { Chip } from '@mui/material';

import Iconify from '../../../../iconify/Iconify';
import RecordChip from '../../../records/RecordChip';

export const getUpdatedByColumnDef = ({ table }) => ({
  headerName: 'Updated By',
  field: 'updated_by',
  width: 140,
  headerComponent: (params) => (
    <div className="flex items-center gap-2">
      <Iconify
        icon="mdi:account-edit"
        fontSize="small"
        sx={{ opacity: 0.7 }}
      />
      <span>{params.displayName}</span>
    </div>
  ),
  editable: false,
  sortable: true,
  filter: true,
  mainMenuItems: ['sortAscending', 'sortDescending', 'separator', 'autoSizeThis', 'autoSizeAll'],
  cellRenderer: (params) => {
    if (params.data.id === '+') return null;

    if (!params.value) {
      return (
        <Chip
          label="System"
          size="small"
        />
      );
    }

    // Use RecordChip to display user from auth.users table
    return (
      <div className="h-full w-full flex items-center overflow-visible p-1">
        <div className="flex flex-wrap gap-1 min-w-0 w-full">
          <RecordChip
            baseId={table.base_id}
            tableId="auth.users"
            recordId={params.value}
          />
        </div>
      </div>
    );
  },
});
