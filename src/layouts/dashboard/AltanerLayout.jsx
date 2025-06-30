/* eslint-disable react/display-name */
import { Box } from '@mui/material';
import { useState, useEffect, memo, useCallback, Suspense, lazy } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';

import AltanerHeader from './header/AltanerHeader.jsx';
import Main from './Main.jsx';
import AltanLogo from '../../components/loaders/AltanLogo.jsx';
import LoadingScreen from '../../components/loading-screen/LoadingScreen.jsx';
import { useWebSocket } from '../../providers/websocket/WebSocketProvider.jsx';
import {
  clearCurrentAltaner,
  getAltanerById,
  selectCurrentAltaner,
} from '../../redux/slices/altaners';
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

const AltanLogoFixed = (
  <AltanLogo
    wrapped
    fixed
  />
);

const Loadable = (Component) => (props) => (
  <Suspense fallback={AltanLogoFixed}>
    <Component {...props} />
  </Suspense>
);

const CloneTemplate = lazy(() => import('../../components/clone/CloneTemplate.jsx'));

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

const AltanerLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [templateId, setTemplateId] = useState('');
  const ws = useWebSocket();
  const accountInitialized = useSelector(selectAccountInitialized);
  const accountLoading = useSelector(selectAccountLoading);
  const accountId = useSelector(selectAccountId);
  const { altanerId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);

  useEffect(() => {
    if (altanerId !== altaner?.id) {
      dispatch(getAltanerById(altanerId));
    }
  }, [altaner?.id, altanerId]);

  useEffect(() => {
    return () => dispatch(clearCurrentAltaner());
  }, []);

  useEffect(() => {
    if (!!ws?.isOpen && !!accountId) {
      ws.subscribe(ACCOUNT_ENTITIES.map((entity) => `account:${accountId}:entities:${entity}`));
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
          ['forms', 'webhooks', 'apikeys', 'agents', 'developer_apps', 'apps'],
        ].forEach((keys) => dispatch(getAccountAttribute(accountId, keys)));
        dispatch(getFlows(accountId));
        dispatch(fetchNotifications());
      });
    }
  }, [accountId, accountInitialized, accountLoading]);

  useEffect(() => {
    if (!templateId) {
      const id = searchParams.get('template');
      if (!!id?.length) {
        setTemplateId(id);
        searchParams.delete('template');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, setSearchParams, templateId]);

  useEffect(() => {
    dispatch(getRoles());
  }, []);

  const handleClose = useCallback(() => setTemplateId(''), []);

  if (!accountInitialized || !!accountLoading) return <LoadingScreen />;

  return (
    <>
      <AltanerHeader />

      {!!templateId && Loadable(CloneTemplate)({ templateId, onClose: handleClose })}

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
