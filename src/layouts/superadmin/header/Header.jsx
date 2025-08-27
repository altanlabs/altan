// @mui
import { Stack, AppBar, Toolbar, IconButton, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { memo } from 'react';

// utils
// hooks
import { Link as RouterLink, useHistory } from 'react-router-dom';

import Iconify from '../../../components/iconify';
import Logo from '../../../components/logo';
import { HEADER } from '../../../config-global';
import useResponsive from '../../../hooks/useResponsive';
// config

// components
import { PATH_DASHBOARD } from '../../../routes/paths';
import { bgBlur } from '../../../utils/cssStyles';
import AccountPopover from '../../dashboard/header/AccountPopover';

// ----------------------------------------------------------------------

const SECTIONS = [
  {
    id: 'internal',
    name: 'Internal',
    description: 'Manage internal assets from Altan core database.',
    link: PATH_DASHBOARD.super.internal,
    icon: 'fluent:table-24-filled',
  },
  {
    id: 'activity',
    name: 'Activity',
    description: 'Manage external assets from third-party solutions.',
    link: '/xsup/activity',
    icon: 'tabler:activity',
  },
  {
    id: 'external',
    name: 'External',
    description: 'Manage external assets from third-party solutions.',
    link: PATH_DASHBOARD.super.external,
    icon: 'tabler:api-app',
  },
];

const Header = () => {
  const theme = useTheme();
  const history = useHistory();
  const isSmallScreen = useResponsive('down', 'sm');

  const renderSections = SECTIONS.map((section) =>
    !isSmallScreen ? (
      <Button
        key={section.id}
        sx={{ height: 44 }}
        size="small"
        component={RouterLink}
        to={section.link}
        color="primary"
        startIcon={<Iconify icon={section.icon} />}
      >
        {section.name}
      </Button>
    ) : (
      <IconButton
        color="primary"
        key={section.id}
        onClick={() => history.push(section.link)}
      >
        <Iconify
          width={25}
          icon={section.icon}
        />
      </IconButton>
    ),
  );
  const renderContent = (
    <>
      <Logo minimal />
      {!isSmallScreen ? (
        <>
          <Button
            sx={{ height: 44, pl: 4 }}
            size="small"
            color="primary"
            component={RouterLink}
            to={PATH_DASHBOARD.super.root}
            startIcon={<Iconify icon="ic:twotone-admin-panel-settings" />}
          >
            Superadmin
          </Button>
          {renderSections}
        </>
      ) : (
        <>
          <IconButton
            color="primary"
            onClick={() => history.push(PATH_DASHBOARD.super.root)}
          >
            <Iconify
              width={25}
              icon="ic:twotone-admin-panel-settings"
            />
          </IconButton>
          {renderSections}
        </>
      )}
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        {/* <LanguagePopover /> */}
        {!isSmallScreen ? (
          <Button
            sx={{ height: 44 }}
            size="small"
            component={RouterLink}
            to="/"
            color="primary"
            startIcon={<Iconify icon="ic:twotone-home" />}
          >
            Back to platform
          </Button>
        ) : (
          <IconButton
            color="primary"
            onClick={() => history.replace('/')}
          >
            <Iconify
              width={25}
              icon="ic:twotone-home"
            />
          </IconButton>
        )}
        {/* <ContactsPopover /> */}
        <IconButton
          href="https://uptime.altan.ai/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'text.primary', width: 40, height: 40 }}
        >
          <Iconify
            icon="pajamas:status-health"
            width={35}
          />
        </IconButton>
        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        boxShadow: 'none',
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        width: '100%',
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          height: HEADER.H_MOBILE,
          px: { lg: 5 },
          pl: { lg: 3 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
};

export default memo(Header);
