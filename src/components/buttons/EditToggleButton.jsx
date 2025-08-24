import { Tooltip, Chip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

import Iconify from '../iconify';

/**
 * A toggle button for switching edit mode on/off
 * Uses the existing targeting system in IframeControls
 */
function EditToggleButton({ editMode, onToggle, disabled = false }) {
  const theme = useTheme();

  return (
    <Tooltip title={editMode ? 'Turn off Edit Mode' : 'Turn on Edit Mode'}>
      <Chip
        icon={
          <Iconify
            icon="fluent:window-location-target-20-filled"
            sx={{ width: 14, height: 14 }}
          />
        }
        size="small"
        onClick={onToggle}
        disabled={disabled}
        sx={{
          height: 24,
          minWidth: 30,
          fontSize: '0.75rem',
          fontWeight: 600,
          px: 1,
          cursor: 'pointer',
          backgroundColor: editMode
            ? alpha(theme.palette.secondary.main, 0.12)
            : alpha(theme.palette.grey[500], 0.08),
          color: editMode ? theme.palette.secondary.main : theme.palette.text.secondary,
          border: `1px solid ${
            editMode
              ? alpha(theme.palette.secondary.main, 0.24)
              : alpha(theme.palette.grey[500], 0.12)
          }`,
          transition: theme.transitions.create(['background-color', 'color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            backgroundColor: editMode
              ? alpha(theme.palette.secondary.main, 0.16)
              : alpha(theme.palette.grey[500], 0.12),
          },
          '& .MuiChip-label': {
            display: 'none', // Hide label, only show icon
          },
          '& .MuiChip-icon': {
            margin: 0,
            color: 'inherit',
          },
        }}
      />
    </Tooltip>
  );
}

export default EditToggleButton;
