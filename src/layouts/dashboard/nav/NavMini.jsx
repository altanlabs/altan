// @mui
import { Stack, Box } from '@mui/material';

// config
// utils
// components
import navConfig from './config-navigation';
import NavAccount from './NavAccount';
import NavToggleButton from './NavToggleButton';
import Logo from '../../../components/logo';
import { NavSectionMini } from '../../../components/nav-section';
//
import { NAV } from '../../../config-global';
import { selectNav } from '../../../redux/slices/general';
import { useSelector } from '../../../redux/store';
import { hideScrollbarX } from '../../../utils/cssStyles';

// ----------------------------------------------------------------------

export default function NavMini() {
  const renderDynamicNavConfig = (userPermissions) => {
    const filterItemsWithPermission = (items) =>
      items.filter((item) => userPermissions.includes(item.permission));

    const dynamicNavConfig = navConfig
      .map((section) => ({
        ...section,
        items: filterItemsWithPermission(section.items),
      }))
      .filter((section) => section.items.length > 0);

    return dynamicNavConfig;
  };
  const nav = useSelector(selectNav);

  const userPermissions = [
    ...nav,
    'view_dashboard',
    'view_flows',
    'view_agents',
    'view_bases',
    'view_team',
    'view_settings',
    'view_interfaces',
  ];
  const dynamicNavConfig = renderDynamicNavConfig(userPermissions);

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_DASHBOARD_MINI - 12,
        }}
      />

      <Stack
        sx={{
          pb: 2,
          height: 1,
          position: 'fixed',
          width: NAV.W_DASHBOARD_MINI,
          borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          ...hideScrollbarX,
        }}
      >
        <Stack
          spacing={2}
          sx={{
            pt: 2,
            pb: 2,
            px: 2.5,
            flexShrink: 0,
          }}
        >
          <Logo sx={{ mx: 'auto' }} />
          <NavAccount mini />
        </Stack>

        <NavSectionMini data={dynamicNavConfig} />
      </Stack>
    </Box>
  );
}
