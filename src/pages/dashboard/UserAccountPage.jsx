import { Box, Stack } from '@mui/material';
import queryString from 'query-string';
import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

import StaticDrawerNav from './altaners/nav/StaticDrawerNav';
import APIKeys from './APIKeys';
import LoadingScreen from '../../components/loading-screen/LoadingScreen';
import useResponsive from '../../hooks/useResponsive';
import { CompactLayout } from '../../layouts/dashboard';
import { selectAccount } from '../../redux/slices/general';
import {
  AccountGeneral,
  AccountMembers,
} from '../../sections/@dashboard/user/account';
import AccountBilling from '../../sections/@dashboard/user/account/AccountBilling';
import StripeConnect from '../../sections/@dashboard/user/account/AccountStripeSetup';

// ----------------------------------------------------------------------

const selectAccountLoading = (state) => state.general.isLoading;

function UserAccountPage() {
  const isSmallScreen = useResponsive('down', 'sm');
  const account = useSelector(selectAccount);
  const isLoading = useSelector(selectAccountLoading);
  const location = useLocation();
  const history = useHistory();
  const { tab } = queryString.parse(location.search);
  const [currentTab, setCurrentTab] = useState(tab || 'general');

  useEffect(() => {
    // Update URL when currentTab changes
    history.push(`?tab=${currentTab}`, { replace: true });
  }, [currentTab, history.push]);

  const TABS = useMemo(
    () => ({
      general: {
        id: 'general',
        name: 'General',
        icon: 'ic:round-account-box',
        component: <AccountGeneral key={account.id} />,
      },
      team: {
        id: 'team',
        name: 'Team',
        icon: 'fluent-mdl2:team-favorite',
        component: <AccountMembers />,
      },
      billing: {
        id: 'billing',
        name: 'Billing',
        icon: 'mdi:currency-usd',
        component: <AccountBilling key={account.id} />,
      },
      api: {
        id: 'api',
        name: 'API Keys',
        icon: 'fluent:key-24-filled',
        component: <APIKeys />,
      },
      stripe: {
        id: 'stripe',
        name: 'Stripe',
        icon: 'simple-icons:stripe',
        component: <StripeConnect key={account.id} />,
      },
    }),
    [account],
  );

  const handleTabChange = useCallback((newTab) => {
    setCurrentTab(newTab);
  }, []);

  const navItems = useMemo(() => Object.values(TABS), [TABS]);

  if (!account || !Object.keys(account).length || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <CompactLayout title="Workspace Settings · Altan" noPadding>
      <Stack
        height="100%"
        width="100%"
        direction={isSmallScreen ? 'column' : 'row'}
      >
        <StaticDrawerNav
          components={navItems}
          activeTab={currentTab}
          onTabChange={handleTabChange}
          showSettings={false}
          showRoom={false}
        />
        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
          {!!currentTab && TABS[currentTab]?.component}
        </Box>
      </Stack>
    </CompactLayout>
  );
}

export default memo(UserAccountPage);
