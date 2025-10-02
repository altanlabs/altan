import { Tooltip, IconButton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';

import { setViewType, selectViewType } from '../../redux/slices/altaners';
import Iconify from '../iconify';

/**
 * A simple toggle button for switching between code and preview modes
 * Designed to match the glassmorphic button styling in DatabaseNavigationBar
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
    <Tooltip title={isCodeMode ? 'Close Code Editor' : 'Open Code Editor'}>
      <IconButton
        size="small"
        onClick={handleToggle}
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          color: isCodeMode ? theme.palette.primary.main : theme.palette.text.secondary,
          backgroundColor: isCodeMode
            ? alpha(theme.palette.primary.main, 0.15)
            : alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
          border: isCodeMode
            ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: theme.transitions.create(['all'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            transform: 'translateY(-1px)',
          },
        }}
      >
        <Iconify
          icon="mdi:code-tags"
          sx={{ width: 18, height: 18 }}
        />
      </IconButton>
    </Tooltip>
  );
}

export default CodeToggleButton;
