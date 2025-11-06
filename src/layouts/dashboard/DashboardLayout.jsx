import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, memo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import Header from './header';
import FloatingNavigation from './header/FloatingNavigation';
import Main from './Main.jsx';
import CreditBalanceWarningDialog from '../../components/CreditBalanceWarningDialog';
import useBrowserNotifications from '../../hooks/useBrowserNotifications';
import { useCreditBalancePolling } from '../../hooks/useCreditBalancePolling';
import { useCreditWarnings } from '../../hooks/useCreditWarnings';
import useResponsive from '../../hooks/useResponsive';
import { VoiceConversationProvider } from '../../providers/voice/VoiceConversationProvider.jsx';
import { useHermesWebSocket } from '../../providers/websocket/HermesWebSocketProvider.jsx';
import { getConnections, getConnectionTypes } from '../../redux/slices/connections';
import { getFlows } from '../../redux/slices/flows.js';
import {
  getAccount,
  getAccountAttribute,
  getAccountMembers,
  getRoles,
  selectAccountCreditBalance,
  selectIsAccountFree,
} from '../../redux/slices/general';
import { fetchNotifications } from '../../redux/slices/notifications';
import { dispatch, useSelector } from '../../redux/store';
import { optimai } from '../../utils/axios.js';

// Note: AltanerFromIdea logic has been moved to CompactLayout for bubble convergence animation
// Project creation now happens through bubble convergence animation instead of a separate dialog

const selectAccountId = (state) => state.general.account?.id;
const selectAccountLoading = (state) => state.general.generalLoading.account;
const selectAccountInitialized = (state) => state.general.generalInitialized.account;

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const history = useHistory();
  const ws = useHermesWebSocket();

  const searchParams = new URLSearchParams(location.search);
  const hideHeader = searchParams.get('hideHeader') === 'true';
  const accountInitialized = useSelector(selectAccountInitialized);
  const accountLoading = useSelector(selectAccountLoading);
  const accountId = useSelector(selectAccountId);
  const user = useSelector((state) => state.general.user);
  const creditBalance = useSelector(selectAccountCreditBalance);
  const isAccountFree = useSelector(selectIsAccountFree);

  // Enable browser notifications for this user
  useBrowserNotifications();

  // Poll credit balance every 30 seconds
  useCreditBalancePolling(true);

  // Manage credit warning state
  const {
    showZeroBalanceWarning,
    showLowBalanceWarning,
    dismissZeroWarning,
    dismissLowWarning,
  } = useCreditWarnings(creditBalance, isAccountFree, accountId);

  const handleToggleNav = useCallback(() => {
    // Toggle navigation handler - kept for compatibility
  }, []);

  useEffect(() => {
    if (!!ws?.isOpen && !!accountId && !!user) {
      ws.subscribe(`account:${accountId}`);
    }
  }, [ws, accountId, user]);

  useEffect(() => {
    if ((!accountId || !user) && ws?.isOpen) {
      ws.disconnect();
    }
  }, [accountId, user, ws]);

  useEffect(() => {
    if (user) {
      dispatch(getRoles());
    }
  }, [user]);

  useEffect(() => {
    if (user && user.email_verified === false && window.location.pathname !== '/auth/verify') {
      window.location.href = '/auth/verify';
      return;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      dispatch(getConnectionTypes());
    }
  }, [user]);

  useEffect(() => {
    if (!!accountId && !accountInitialized && !accountLoading) {
      dispatch(getAccount()).then(() => {
        dispatch(getConnections(accountId));
        dispatch(getAccountMembers(accountId));
        [
          ['subscriptions'],
        ].forEach((keys) => dispatch(getAccountAttribute(accountId, keys)));
        dispatch(fetchNotifications());
        dispatch(getFlows(accountId));
      });
    }
  }, [accountId, accountInitialized, accountLoading]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('cloned_template');
    if (!!id?.length) {
      // Remove the cloned_template param from current URL
      searchParams.delete('cloned_template');
      history.replace({
        pathname: location.pathname,
        search: searchParams.toString(),
      });
      // Navigate to the new clone template page
      history.push(`/clone/${id}`);
    }
    // Note: ?idea= param is now handled by CompactLayout for bubble animation
  }, [location.search, location.pathname, history]);

  useEffect(() => {
    if (accountId && user) {
      optimai.get(`/agent/update-cloned-agents?account_id=${accountId}`).catch(() => {});
    }
  }, [accountId, user]);

  // Check if we should hide FloatingNavigation on mobile in /room path
  const isMobile = useResponsive('down', 'md'); // Mobile is anything below md breakpoint
  const shouldHideFloatingNav = location.pathname.startsWith('/room') && isMobile;

  // Check if we should show AltanAgentWidget based on current route
  // const shouldShowAgentWidget = useCallback(() => {
  //   const { pathname } = location;

  //   // Show widget on these exact paths
  //   const allowedPaths = ['/', '/agents', '/flows', '/usage'];

  //   // Check for exact matches first
  //   if (allowedPaths.includes(pathname)) {
  //     return true;
  //   }

  //   // Don't show on specific ID-based routes
  //   if (pathname.match(/^\/agent\/[^/]+$/) || pathname.match(/^\/flow\/[^/]+$/)) {
  //     return false;
  //   }

  //   return false;
  // }, [location]);

  return (
    <VoiceConversationProvider>
      {!hideHeader && <Header onOpenNav={handleToggleNav} />}
      {!shouldHideFloatingNav && <FloatingNavigation />}
      {/* {shouldShowAgentWidget() && <AltanAgentWidget />} */}

      {/* Credit Balance Warning Dialog */}
      <CreditBalanceWarningDialog
        showZeroBalanceWarning={showZeroBalanceWarning}
        showLowBalanceWarning={showLowBalanceWarning}
        onDismissZero={dismissZeroWarning}
        onDismissLow={dismissLowWarning}
      />

      {/* Project creation animation now handled by CompactLayout bubble convergence */}
      <Box
        sx={{
          display: { lg: 'flex' },
          minHeight: { lg: 1 },
        }}
      >
        <Main>{children}</Main>
      </Box>
    </VoiceConversationProvider>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node,
};

export default memo(DashboardLayout);
