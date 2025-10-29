import { Tooltip, IconButton } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { setViewType, selectViewType } from '../../redux/slices/altaners';
import Iconify from '../iconify';
import analytics from '../../lib/analytics';

/**
 * A toggle button for switching between code and preview modes
 * Designed to match the header button styling (HeaderIconButton style)
 */
function CodeToggleButton({ disabled = false }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const viewType = useSelector(selectViewType);

  const handleToggle = () => {
    if (!disabled) {
      const newViewType = viewType === 'preview' ? 'code' : 'preview';
      dispatch(setViewType(newViewType));
      
      // Track code editor feature usage
      if (newViewType === 'code') {
        analytics.featureUsed('code_editor', {
          action: 'enabled',
        });
      }
    }
  };

  const isCodeMode = viewType === 'code';

  return (
    <Tooltip title={isCodeMode ? 'Turn off Code Editor' : 'Turn on Code Editor'}>
      <IconButton
        onClick={handleToggle}
        disabled={disabled}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          backgroundColor: isCodeMode
            ? alpha(theme.palette.primary.main, 0.12)
            : 'transparent',
          color: isCodeMode
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
          border: `1px solid ${isCodeMode
            ? alpha(theme.palette.primary.main, 0.24)
            : 'transparent'}`,
          '&:hover': {
            backgroundColor: isCodeMode
              ? alpha(theme.palette.primary.main, 0.16)
              : alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
          },
          '&:disabled': {
            color: theme.palette.text.disabled,
            backgroundColor: 'transparent',
            border: '1px solid transparent',
          },
          transition: theme.transitions.create(['background-color', 'color', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Iconify
          icon="mdi:code-tags"
          sx={{ width: 16, height: 16 }}
        />
      </IconButton>
    </Tooltip>
  );
}

CodeToggleButton.propTypes = {
  disabled: PropTypes.bool,
};

export default CodeToggleButton;
