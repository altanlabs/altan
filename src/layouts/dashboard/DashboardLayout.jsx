import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useState, useEffect, memo, useCallback, Suspense, lazy } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import Header from './header';
import FloatingNavigation from './header/FloatingNavigation';
import Main from './Main.jsx';
import AltanAgentWidget from '../../components/AltanAgentWidget.jsx';
import FloatingVoiceWidget from '../../components/FloatingVoiceWidget.jsx';
import AltanLogo from '../../components/loaders/AltanLogo.jsx';
import useResponsive from '../../hooks/useResponsive';
import { VoiceConversationProvider } from '../../providers/voice/VoiceConversationProvider.jsx';
import { useWebSocket } from '../../providers/websocket/WebSocketProvider.jsx';
import { getConnections, getConnectionTypes } from '../../redux/slices/connections';
import { getFlows } from '../../redux/slices/flows';
import {
  getAccount,
  getAccountAttribute,
  getAccountMembers,
  getRoles,
} from '../../redux/slices/general';
import { fetchNotifications } from '../../redux/slices/notifications';
import { dispatch, useSelector } from '../../redux/store';
import { optimai } from '../../utils/axios.js';

const AltanLogoFixed = (
  <AltanLogo
    wrapped
    fixed
  />
);

// eslint-disable-next-line react/display-name
const Loadable = (Component) => (props) => (
  <Suspense fallback={AltanLogoFixed}>
    <Component {...props} />
  </Suspense>
);

const AltanerFromIdea = lazy(() => import('../../components/clone/AltanerFromIdea.jsx'));

const ACCOUNT_ENTITIES = [
  'actionexecution',
  'taskexecution',
  'altaner',
  'subscription',
  'template',
  'general',
  'space',
  'thread',
  'message',
  'media',
  'connection',
  'tool',
  'resource',
  'agent',
  'user',
  'workflow',
  'flowexecution',
  'webhook',
  'webhooksubscription',
  'form',
  'deployment',
  'interface',
  'base',
];

const selectAccountId = (state) => state.general.account?.id;
const selectAccountLoading = (state) => state.general.generalLoading.account;
const selectAccountInitialized = (state) => state.general.generalInitialized.account;

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const history = useHistory();

  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);
  const setSearchParams = (newParams) => {
    history.replace({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };

  const [idea, setIdea] = useState('');
  const [open, setOpen] = useState(false);
  const ws = useWebSocket();

  const hideHeader = searchParams.get('hideHeader') === 'true';
  const accountInitialized = useSelector(selectAccountInitialized);
  const accountLoading = useSelector(selectAccountLoading);
  const accountId = useSelector(selectAccountId);
  const user = useSelector((state) => state.general.user);

  const handleToggleNav = useCallback(() => setOpen((prev) => !prev), []);

  const handleCloseNav = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!!ws?.isOpen && !!accountId && !!user) {
      ws.subscribe(ACCOUNT_ENTITIES.map((entity) => `account:${accountId}:entities:${entity}`));
    }
  }, [ws?.isOpen, accountId, user]);

  useEffect(() => {
    if ((!accountId || !user) && ws?.isOpen) {
      ws.disconnect();
    }
  }, [accountId, user, ws?.isOpen]);

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
          ['altaners'],
          ['subscriptions'],
          ['interfaces'],
          ['agents'],
          ['webhooks', 'apikeys', 'developer_apps', 'apps', 'connections'],
        ].forEach((keys) => dispatch(getAccountAttribute(accountId, keys)));
        dispatch(getFlows(accountId));
        dispatch(fetchNotifications());
      });
    }
  }, [accountId, accountInitialized, accountLoading]);

  useEffect(() => {
    const id = searchParams.get('cloned_template');
    if (!!id?.length) {
      // Remove the cloned_template param from current URL
      searchParams.delete('cloned_template');
      setSearchParams(searchParams);
      // Navigate to the new clone template page
      history.push(`/clone/${id}`);
    }

    const ideaParam = searchParams.get('idea');
    if (ideaParam) {
      setIdea(ideaParam);
      searchParams.delete('idea');
      setSearchParams(searchParams);
    }
  }, [location.search, history, searchParams, setSearchParams]);

  const handleClose = useCallback(() => setIdea(''), []);

  useEffect(() => {
    if (accountId && user) {
      optimai.get(`/agent/update-cloned-agents?account_id=${accountId}`).catch(() => {});
    }
  }, [accountId, user]);

  // Check if we should hide FloatingNavigation on mobile in /room path
  const isMobile = useResponsive('down', 'md'); // Mobile is anything below md breakpoint
  const shouldHideFloatingNav = location.pathname.startsWith('/room') && isMobile;

  // Check if we should show AltanAgentWidget based on current route
  const shouldShowAgentWidget = useCallback(() => {
    const { pathname } = location;

    // Show widget on these exact paths
    const allowedPaths = ['/', '/agents', '/flows', '/usage'];

    // Check for exact matches first
    if (allowedPaths.includes(pathname)) {
      return true;
    }

    // Don't show on specific ID-based routes
    if (pathname.match(/^\/agent\/[^/]+$/) || pathname.match(/^\/flow\/[^/]+$/)) {
      return false;
    }

    return false;
  }, [location]);

  return (
    <VoiceConversationProvider>
      {!hideHeader && <Header onOpenNav={handleToggleNav} />}
      {!shouldHideFloatingNav && <FloatingNavigation />}
      {user && <FloatingVoiceWidget />}
      {shouldShowAgentWidget() && <AltanAgentWidget />}

      {!!idea && !!user && Loadable(AltanerFromIdea)({ idea, onClose: handleClose })}
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
