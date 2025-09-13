/* eslint-disable react/display-name */
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, memo, useMemo } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';

import ProjectHeader from './header/ProjectHeader.jsx';
import Main from './Main.jsx';
import LoadingScreen from '../../components/loading-screen/LoadingScreen.jsx';
// import VoiceConversation from '../../pages/dashboard/components/VoiceConversation.jsx';
import { VoiceConversationProvider } from '../../providers/voice/VoiceConversationProvider.jsx';
import { useWebSocket } from '../../providers/websocket/WebSocketProvider.jsx';
import {
  clearCurrentAltaner,
  getAltanerById,
  selectCurrentAltaner,
  selectSortedAltanerComponents,
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

const ACCOUNT_ENTITIES = [
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
  'agent',
  'user',
  'workflow',
  'deployment',
  'interface',
  'base',
];

const selectAccountId = (state) => state.general.account?.id;
const selectAccountLoading = (state) => state.general.generalLoading.account;
const selectAccountInitialized = (state) => state.general.generalInitialized.account;

const ProjectLayout = ({ children }) => {
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
  const ws = useWebSocket();
  const accountInitialized = useSelector(selectAccountInitialized);
  const accountLoading = useSelector(selectAccountLoading);
  const accountId = useSelector(selectAccountId);
  const { altanerId, componentId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);

  // Get current component and interface ID
  const currentComponent = sortedComponents?.[componentId];
  const isInterfaceComponent = currentComponent?.type === 'interface';
  const interfaceId = isInterfaceComponent ? currentComponent?.params?.id : null;

  // Memoize dynamic variables to prevent re-renders
  const dynamicVariables = useMemo(() => {
    const baseVariables = {
      '[$vars].message_id': 'test',
      '[$vars].room.meta_data.components.base.id': 'test',
      ...(altaner?.room_id && { '[$vars].room_id': altaner.room_id }),
      ...(altanerId && { '[$vars].room.meta_data.altaner.id': altanerId }),
    };

    if (interfaceId) {
      baseVariables['[$vars].room.meta_data.components.interface.params.id'] = interfaceId;
    }

    return baseVariables;
  }, [interfaceId, altaner?.room_id, altanerId]);

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
          ['subscriptions'],
          // ['altaners'],
          // ['interfaces'],
          ['workflows'],
          ['agents'],
        ].forEach((keys) => dispatch(getAccountAttribute(accountId, keys)));
        dispatch(getFlows(accountId));
        dispatch(fetchNotifications());
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
    <VoiceConversationProvider>
      <ProjectHeader />

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

ProjectLayout.propTypes = {
  children: PropTypes.node,
};

export default memo(ProjectLayout);
