import { Tooltip, Chip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';

import { setViewType, selectViewType } from '../../redux/slices/altaners';
import Iconify from '../iconify';

/**
 * A simple toggle button for switching between code and preview modes
 * Designed to match the PROD/DEV chip styling in URLNavigationBar
 */
function CodeToggleButton() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const viewType = useSelector(selectViewType);

  const handleToggle = () => {
    dispatch(setViewType(viewType === 'preview' ? 'code' : 'preview'));
  };

  const isCodeMode = viewType === 'code';

  return (
    <Tooltip title={isCodeMode ? 'Turn off Code Editor' : 'Turn on Code Editor'}>
      <Chip
        icon={<Iconify icon="mdi:code-tags" sx={{ width: 14, height: 14 }} />}
        size="small"
        onClick={handleToggle}
        sx={{
          height: 24,
          minWidth: 30,
          fontSize: '0.75rem',
          fontWeight: 600,
          px: 1,
          cursor: 'pointer',
          backgroundColor: isCodeMode
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.grey[500], 0.08),
          color: isCodeMode
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
          border: `1px solid ${
            isCodeMode
              ? alpha(theme.palette.primary.main, 0.24)
              : alpha(theme.palette.grey[500], 0.12)
          }`,
          transition: theme.transitions.create(['background-color', 'color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            backgroundColor: isCodeMode
              ? alpha(theme.palette.primary.main, 0.16)
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

export default CodeToggleButton;
