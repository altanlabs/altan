import { Box, Stack } from '@mui/material';
import React, { useState, useEffect, memo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState('connections');

  // const accountId = useMemo(() => account?.id, [account?.id]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam in TABS) {
      setCurrentTab(tabParam);
    } else {
      searchParams.set('tab', 'connections');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  // useEffect(() => {
  //   if (accountId) {
  //     dispatch(fetchAccountPayments());
  //   }
  // }, [accountId]);

  const handleTabChange = useCallback(
    (newTab) => {
      searchParams.set('tab', newTab);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
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
