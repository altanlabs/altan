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
import { getAccountAttribute } from '../../redux/slices/general';
import { dispatch, useSelector } from '../../redux/store';

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
  
  // Selectors for conditional loading
  const accountId = useSelector((state) => state.general.account?.id);
  const appsInitialized = useSelector((state) => state.general.accountAssetsInitialized.apps);
  const appsLoading = useSelector((state) => state.general.accountAssetsLoading.apps);
  const devAppsInitialized = useSelector((state) => state.general.accountAssetsInitialized.developer_apps);
  const devAppsLoading = useSelector((state) => state.general.accountAssetsLoading.developer_apps);

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

  // Conditional resource loading based on current tab
  useEffect(() => {
    if (!accountId) return;

    switch (currentTab) {
      case 'custom_apps':
        if (!appsInitialized && !appsLoading) {
          dispatch(getAccountAttribute(accountId, ['apps']));
        }
        break;
      case 'dev_apps':
        if (!devAppsInitialized && !devAppsLoading) {
          dispatch(getAccountAttribute(accountId, ['developer_apps']));
        }
        break;
      default:
        // No additional resources needed for connections and integration_creator tabs
        break;
    }
  }, [currentTab, accountId, appsInitialized, appsLoading, devAppsInitialized, devAppsLoading]);

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
