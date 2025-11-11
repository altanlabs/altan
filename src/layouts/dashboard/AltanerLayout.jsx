/* eslint-disable react/display-name */
import { Box } from '@mui/material';
import { useEffect, memo } from 'react';
import { Outlet, useParams, useLocation, useHistory } from 'react-router-dom';

import AltanerHeader from './header/AltanerHeader.jsx';
import Main from './Main.jsx';
import LoadingScreen from '../../components/loading-screen/LoadingScreen.jsx';
import { useHermesWebSocket } from '../../providers/websocket/HermesWebSocketProvider.jsx';
import {
  clearCurrentAltaner,
  getAltanerById,
  selectCurrentAltaner,
} from '../../redux/slices/altaners';
import { getConnections, getConnectionTypes } from '../../redux/slices/connections';
import { getFlows, selectIsLoadingFlow, selectInitializedFlow } from '../../redux/slices/flows';
import {
  getAccount,
  getAccountAttribute,
  getAccountMembers,
  getRoles,
} from '../../redux/slices/general';
import { dispatch, useSelector } from '../../redux/store';

const selectAccountId = (state) => state.general.account?.id;
const selectAccountLoading = (state) => state.general.generalLoading.account;
const selectAccountInitialized = (state) => state.general.generalInitialized.account;

const AltanerLayout = () => {
  const location = useLocation();
  const history = useHistory();
  
  // Parse search params manually for React Router v5
  const searchParams = new URLSearchParams(location.search);
  const setSearchParams = (newParams) => {
    history.replace({
      pathname: location.pathname,
      search: newParams.toString()
    });
  };
  
  const ws = useHermesWebSocket();
  const accountInitialized = useSelector(selectAccountInitialized);
  const accountLoading = useSelector(selectAccountLoading);
  const flowsLoading = useSelector(selectIsLoadingFlow);
  const flowsInitialized = useSelector(selectInitializedFlow);

  const accountId = useSelector(selectAccountId);
  const { altanerId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);

  useEffect(() => {
    if (altanerId !== altaner?.id) {
      dispatch(getAltanerById(altanerId));
    }
  }, [altaner?.id, altanerId]);

  useEffect(() => {
    if (!flowsLoading && flowsInitialized && altaner && altaner.components.items.length > 0 && altaner.components.items.some(component => component.type === 'flows')) {
      dispatch(getFlows(accountId));
    }
  }, [altaner, accountId, flowsLoading, flowsInitialized]);

  useEffect(() => {
    return () => dispatch(clearCurrentAltaner());
  }, []);

  useEffect(() => {
    if (!!ws?.isOpen && !!accountId) {
      ws.subscribe(`account:${accountId}`);
    }
  }, [ws?.isOpen, accountId, ws]);

  useEffect(() => {
    if (!accountId && ws?.isOpen) {
      ws.disconnect();
    }
  }, [accountId, ws, ws?.isOpen]);

  useEffect(() => {
    dispatch(getConnectionTypes());
  }, []);

  useEffect(() => {
    if (!!accountId && !accountInitialized && !accountLoading) {
      dispatch(getAccount()).then(() => {
        dispatch(getConnections(accountId));
        dispatch(getAccountMembers(accountId));
        [
          ['altaners', 'subscriptions'],
          ['bases', 'rooms', 'interfaces', 'workflows'],
          ['webhooks', 'apikeys', 'agents', 'developer_apps', 'apps'],
        ].forEach((keys) => dispatch(getAccountAttribute(accountId, keys)));
      });
    }
  }, [accountId, accountInitialized, accountLoading]);

  useEffect(() => {
    const id = searchParams.get('template');
    if (!!id?.length) {
      // Remove the template param from current URL
      searchParams.delete('template');
      setSearchParams(searchParams);
      // Navigate to the new clone template page
      history.push(`/clone/${id}`);
    }
  }, [location.search, history, searchParams, setSearchParams]);

  useEffect(() => {
    dispatch(getRoles());
  }, []);

  if (!accountInitialized || !!accountLoading) return <LoadingScreen />;

  return (
    <>
      <AltanerHeader />

      <Box
        sx={{
          display: { lg: 'flex' },
          minHeight: { lg: 1 },
        }}
      >
        <Main>
          <Outlet />
        </Main>
      </Box>
    </>
  );
};

export default memo(AltanerLayout);
