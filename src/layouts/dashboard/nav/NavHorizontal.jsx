import { AppBar, Box, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { memo } from 'react';
// @mui

// config
import navConfig from './config-navigation';
import { NavSectionHorizontal } from '../../../components/nav-section';
import { HEADER } from '../../../config-global';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// components
//

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme();
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

  // Example usage
  const userPermissions = ['view_dashboard', 'view_flows', 'view_flows', 'view_agents'];
  const dynamicNavConfig = renderDynamicNavConfig(userPermissions);

  return (
    <AppBar
      component="nav"
      color="transparent"
      sx={{
        boxShadow: 0,
        top: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
        }}
      >
        <NavSectionHorizontal data={dynamicNavConfig} />
      </Toolbar>

      <Shadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);

// ----------------------------------------------------------------------

Shadow.propTypes = {
  sx: PropTypes.object,
};

function Shadow({ sx, ...other }) {
  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        height: 24,
        zIndex: -1,
        width: 1,
        m: 'auto',
        borderRadius: '50%',
        position: 'absolute',
        boxShadow: (theme) => theme.customShadows.z8,
        ...sx,
      }}
      {...other}
    />
  );
}
