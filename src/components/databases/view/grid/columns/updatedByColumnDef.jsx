import { Chip } from '@mui/material';
import { useSelector } from 'react-redux';

import Iconify from '../../../../iconify/Iconify';
import { createUserDisplayValueSelector } from '../../../../../redux/slices/bases';

const UserChip = ({ baseId, userId }) => {
  const userDisplayValue = useSelector(createUserDisplayValueSelector(baseId, userId));
  
  if (!userId) {
    return (
      <Chip
        label="System"
        size="small"
      />
    );
  }

  // If userDisplayValue is the same as userId, it means we couldn't find user data
  // So let's show a truncated version of the ID for better UX
  const displayLabel = userDisplayValue === userId 
    ? `${userId.substring(0, 8)}...` 
    : userDisplayValue;

  return (
    <Chip
      label={displayLabel}
      size="small"
      variant="outlined"
      sx={{
        height: '20px',
        '& .MuiChip-label': {
          fontSize: '0.75rem',
          lineHeight: '20px',
          px: 1,
          py: 0,
        },
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        borderColor: 'rgba(76, 175, 80, 0.2)',
        color: '#4CAF50',
      }}
    />
  );
};

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

    // Use cached user data instead of making individual API calls
    return (
      <div className="h-full w-full flex items-center overflow-visible p-1">
        <div className="flex flex-wrap gap-1 min-w-0 w-full">
          <UserChip
            baseId={table.base_id}
            userId={params.value}
          />
        </div>
      </div>
    );
  },
});
