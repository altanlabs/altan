/* eslint-disable react/display-name */
import { Box, Tooltip, IconButton } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, memo, useMemo, useCallback } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';

import ProjectHeader from './header/ProjectHeader.jsx';
import Main from './Main.jsx';
import LoadingScreen from '../../components/loading-screen/LoadingScreen.jsx';
// import VoiceConversation from '../../pages/dashboard/components/VoiceConversation.jsx';
import { VoiceConversationProvider } from '../../providers/voice/VoiceConversationProvider.jsx';
import { useHermesWebSocket } from '../../providers/websocket/HermesWebSocketProvider';
import {
  clearCurrentAltaner,
  getAltanerById,
  selectCurrentAltaner,
  selectSortedAltanerComponents,
  setDisplayModeForProject,
  selectDisplayMode,
  selectOperateMode,
} from '../../redux/slices/altaners';
import { getConnections, getConnectionTypes } from '../../redux/slices/connections.ts';
import { getFlows } from '../../redux/slices/flows.ts';
import {
  getAccount,
  getAccountAttribute,
  getAccountMembers,
  getRoles,
} from '../../redux/slices/general/index.ts';
import { dispatch, useSelector } from '../../redux/store.ts';

const selectAccountId = (state) => state.general.account?.id;
const selectAccountLoading = (state) => state.general.generalLoading.account;
const selectAccountInitialized = (state) => state.general.generalInitialized.account;

const ProjectLayout = ({ children }) => {
  const location = useLocation();
  const history = useHistory();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchParams = new URLSearchParams(location.search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSearchParams = (newParams) => {
    history.replace({
      pathname: location.pathname,
      search: newParams.toString(),
    });
  };
  const ws = useHermesWebSocket();
  const accountInitialized = useSelector(selectAccountInitialized);
  const accountLoading = useSelector(selectAccountLoading);
  const accountId = useSelector(selectAccountId);
  const { altanerId, componentId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);
  const displayMode = useSelector(selectDisplayMode);
  const operateMode = useSelector(selectOperateMode);
  
  // Check if we're on the operate route (instant, no Redux delay)
  const isOperateRoute = location.pathname.endsWith('/operate');

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
          ['subscriptions'],
          ['agents'],
        ].forEach((keys) => dispatch(getAccountAttribute(accountId, keys)));
        dispatch(getFlows(accountId));
        // dispatch(fetchNotifications());
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

  const handleOpenSidebar = useCallback(() => {
    if (altanerId) {
      dispatch(setDisplayModeForProject({ altanerId, displayMode: 'both' }));
    }
  }, [altanerId]);

  if (!accountInitialized || !!accountLoading) return <LoadingScreen />;

  return (
    <VoiceConversationProvider>
      {!isOperateRoute && <ProjectHeader />}

      <Box
        sx={{
          display: { lg: 'flex' },
          minHeight: { lg: 1 },
        }}
      >
        <Main>{children}</Main>
      </Box>

      {/* Floating Sidebar Toggle - only show when in preview mode and altaner has room_id, but not in operate mode */}
      {!isOperateRoute && altaner?.room_id && displayMode === 'preview' && (
        <Tooltip title="Open Sidebar" placement="right" arrow>
          <IconButton
            onClick={handleOpenSidebar}
            sx={{
              position: 'fixed',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1001,
              width: 12,
              height: 56,
              minWidth: 'unset',
              padding: 0,
              borderRadius: '0 8px 8px 0',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: 'none',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                  : '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                width: 28,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.16)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                    : '0 4px 16px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
              }}
              className="chevron-icon"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <style>
              {`
                .MuiIconButton-root:hover .chevron-icon {
                  opacity: 0.7;
                }
              `}
            </style>
          </IconButton>
        </Tooltip>
      )}
    </VoiceConversationProvider>
  );
};

ProjectLayout.propTypes = {
  children: PropTypes.node,
};

export default memo(ProjectLayout);
