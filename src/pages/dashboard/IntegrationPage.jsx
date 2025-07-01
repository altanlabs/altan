import { Box, Stack } from '@mui/material';
import React, { useState, useEffect, memo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import ConnectionsPage from './ConnectionsPage.jsx';
import useResponsive from '../../hooks/useResponsive';
import { CompactLayout } from '../../layouts/dashboard';
import StaticDrawerNav from './altaners/nav/StaticDrawerNav.jsx';
import ConnectionTypeCreator from '../../sections/@dashboard/ConnectionTypeCreator.jsx';
import CustomApps from '../../sections/@dashboard/CustomApps.jsx';
import DevApps from '../../sections/@dashboard/DevApps.jsx';

const TABS = {
  connections: {
    id: 'connections',
    name: 'Connections',
    icon: 'mdi:plug',
    component: <ConnectionsPage />,
  },
  custom_apps: {
    id: 'custom_apps',
    name: 'Custom Apps',
    icon: 'mdi:package-variant-closed',
    component: <CustomApps />,
  },
  integration_creator: {
    id: 'integration_creator',
    name: 'Integration Creator',
    icon: 'carbon:build-image',
    component: <ConnectionTypeCreator />,
  },
  dev_apps: {
    id: 'dev_apps',
    name: 'Dev Apps',
    icon: 'fluent:window-dev-tools-16-regular',
    component: <DevApps />,
  },
};

function IntegrationPage() {
  // const account = useSelector(selectAccount);
  const isSmallScreen = useResponsive('down', 'sm');
  const location = useLocation();
  const history = useHistory();
  const [currentTab, setCurrentTab] = useState('connections');

  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);
  const setSearchParams = (newParams) => {
    history.replace({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };

  // const accountId = useMemo(() => account?.id, [account?.id]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam in TABS) {
      setCurrentTab(tabParam);
    } else {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('tab', 'connections');
      setSearchParams(newSearchParams);
    }
  }, [location.search]);

  // useEffect(() => {
  //   if (accountId) {
  //     dispatch(fetchAccountPayments());
  //   }
  // }, [accountId]);

  const handleTabChange = useCallback(
    (newTab) => {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('tab', newTab);
      setSearchParams(newSearchParams);
    },
    [location.search],
  );

  return (
    <CompactLayout title="Integration · Altan">
      <Stack
        height="100%"
        width="100%"
        direction={isSmallScreen ? 'column' : 'row'}
      >
        <StaticDrawerNav
          components={TABS}
          activeTab={currentTab}
          onTabChange={handleTabChange}
          showSettings={false}
          showRoom={false}
        />
        <Box
          sx={{
            flexGrow: 1,
            p: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {TABS[currentTab]?.component}
        </Box>
      </Stack>
    </CompactLayout>
  );
}

export default memo(IntegrationPage);
