// @mui
import { ListItemButton } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

// config
import { NAV } from '../../../../config-global';

// ----------------------------------------------------------------------

export const ListItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active, theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  height: NAV.H_DASHBOARD_ITEM,
  // Active
  ...(active && {
    color: theme.palette.primary.main,
    ...theme.typography.subtitle2,
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
  }),
}));
