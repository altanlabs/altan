import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import useBrowserNotifications from '../hooks/useBrowserNotifications';
import { useHermesWebSocket } from './websocket/HermesWebSocketProvider.jsx';
import { getConnections, getConnectionTypes } from '../redux/slices/connections';
import {
  getAccount,
  getAccountAttribute,
  getAccountMembers,
  getRoles,
} from '../redux/slices/general';
import { fetchNotifications } from '../redux/slices/notifications';
import { dispatch, useSelector } from '../redux/store';
import { optimai } from '../utils/axios.js';

const selectAccountId = (state) => state.general.account?.id;
const selectAccountLoading = (state) => state.general.generalLoading.account;
const selectAccountInitialized = (state) => state.general.generalInitialized.account;

/**
 * DashboardDataProvider handles all the backend initialization logic
 * (WebSocket subscriptions, account fetching, etc.) without affecting layout.
 * Use this when you need dashboard data but want full control over the UI layout.
 */
const DashboardDataProvider = ({ children }) => {
  const location = useLocation();
  const history = useHistory();
  const ws = useHermesWebSocket();

  const accountInitialized = useSelector(selectAccountInitialized);
  const accountLoading = useSelector(selectAccountLoading);
  const accountId = useSelector(selectAccountId);
  const user = useSelector((state) => state.general.user);

  // Enable browser notifications for this user
  useBrowserNotifications();

  // WebSocket subscription for account
  useEffect(() => {
    if (!!ws?.isOpen && !!accountId && !!user) {
      ws.subscribe(`account:${accountId}`);
    }
  }, [ws, accountId, user]);

  // Disconnect WebSocket when no account or user
  useEffect(() => {
    if ((!accountId || !user) && ws?.isOpen) {
      ws.disconnect();
    }
  }, [accountId, user, ws]);

  // Fetch roles
  useEffect(() => {
    if (user) {
      dispatch(getRoles());
    }
  }, [user]);

  // Email verification check
  useEffect(() => {
    if (user && user.email_verified === false && window.location.pathname !== '/auth/verify') {
      window.location.href = '/auth/verify';
      return;
    }
  }, [user]);

  // Fetch connection types
  useEffect(() => {
    if (user) {
      dispatch(getConnectionTypes());
    }
  }, [user]);

  // Fetch account and related data
  useEffect(() => {
    if (!!accountId && !accountInitialized && !accountLoading) {
      dispatch(getAccount()).then(() => {
        [['subscriptions', 'altaners', 'agents', 'interfaces']].forEach((keys) => dispatch(getAccountAttribute(accountId, keys)));
        dispatch(fetchNotifications());
        dispatch(getConnections(accountId));
        dispatch(getAccountMembers(accountId));
      });
    }
  }, [accountId, accountInitialized, accountLoading]);

  // Handle cloned_template query param
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
  }, [location.search, location.pathname, history]);

  // Update cloned agents
  useEffect(() => {
    if (accountId && user) {
      optimai.get(`/agent/update-cloned-agents?account_id=${accountId}`).catch(() => {});
    }
  }, [accountId, user]);

  return children;
};

DashboardDataProvider.propTypes = {
  children: PropTypes.node,
};

export default DashboardDataProvider;
