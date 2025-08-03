import { Box, Drawer, useTheme } from '@mui/material';
// import { useSnackbar } from 'notistack';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import DeploymentCard from './components/DeploymentCard.jsx';
import DeploymentHistory from './components/DeploymentHistory.jsx';
import PublishDialog from './components/PublishDialog.jsx';
import SettingsDrawer from './components/SettingsDrawer.jsx';
import useGetInterfaceServerStatus from './hooks/useGetInterfaceServerStatus.js';
import InterfaceLayout from './InterfaceLayout.jsx';
import LoadingScreen from '../../../components/loading-screen';
import { useWebSocket } from '../../../providers/websocket/WebSocketProvider.jsx';
import { clearCodeBaseState } from '../../../redux/slices/codeEditor.js';
import { makeSelectInterfaceById, makeSelectSortedCommits } from '../../../redux/slices/general';
import { selectViewType } from '../../../redux/slices/altaners';
// import { optimai } from '../../../utils/axios';
import { dispatch, useSelector } from '../../../redux/store.js';

function InterfacePage({ id, showRoom = false, chatIframeRef: chatIframeRefProp = null }) {
  const theme = useTheme();
  const ws = useWebSocket();
  // const { enqueueSnackbar } = useSnackbar();
  const iframeRef = useRef(null);
  const chatIframeRefCustom = useRef(null);
  const chatIframeRef = chatIframeRefProp || chatIframeRefCustom;

  const selectInterfaceById = useMemo(makeSelectInterfaceById, []);
  const selectSortedCommits = useMemo(makeSelectSortedCommits, []);
  const ui = useSelector((state) => selectInterfaceById(state, id));
  const commits = useSelector((state) => selectSortedCommits(state, id));
  const viewType = useSelector(selectViewType);
  const lastCommitRef = useRef(commits?.[0]?.commit_hash);
  // const [currentPath, setCurrentPath] = useState('/');
  const currentPath = '/';
  const [iframeUrl, setIframeUrl] = useState('');
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'
  const [latestDeployment, setLatestDeployment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  const {
    status,
    // isStarting
  } = useGetInterfaceServerStatus(id, viewType === 'preview');

  const baseIframeUrl = useMemo(() => {
    if (!ui?.repo_name) return '';
    const queryParams = new URLSearchParams({
      theme: theme.palette.mode,
      hideSnippet: 'true',
    });
    const baseUrl = `https://${ui.repo_name}.preview.altan.ai${currentPath}`;
    return baseUrl ? `${baseUrl}?${queryParams.toString()}` : '';
  }, [ui?.repo_name, theme.palette.mode, currentPath]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleReload = useCallback(() => {
    setIsLoading(true);
    if (!!iframeRef.current) {
      setIframeUrl('');
      setTimeout(() => {
        setIframeUrl(baseIframeUrl);
      }, 0);
    }
  }, [baseIframeUrl]);

  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    let timeoutId;

    if (status === 'running') {
      timeoutId = setTimeout(handleReload, 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleReload, status]);

  useEffect(() => {
    return () => {
      if (iframeRef?.current) {
        iframeRef.current.src = 'about:blank';
        iframeRef.current.remove();
      }
    };
  }, [iframeRef]);

  useEffect(() => {
    if (ui?.deployments?.items) {
      const sortedDeployments = [...ui.deployments.items].sort(
        (a, b) => new Date(b.date_creation) - new Date(a.date_creation),
      );
      const latest = sortedDeployments[0];
      if (latest && latest.status !== 'PROMOTED') {
        setLatestDeployment(latest);
      } else {
        setLatestDeployment(null);
      }
    }
  }, [ui?.deployments?.items]);

  useEffect(() => {
    if (!!baseIframeUrl) {
      setIframeUrl(baseIframeUrl);
    }
  }, [baseIframeUrl]);

  useEffect(() => {
    if (!ui?.repo_name || !ws?.isOpen) return;

    const topic = `ifdevserver-streamlogs:${ui.repo_name}`;
    ws.subscribe(topic);

    return () => {
      ws.unsubscribe(topic);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws?.isOpen, ui?.repo_name]);

  useEffect(() => {
    return () => dispatch(clearCodeBaseState());
  }, []);

  // Add effect to watch for new commits
  useEffect(() => {
    const latestCommit = commits?.[0]?.commit_hash;
    if (latestCommit && latestCommit !== lastCommitRef.current) {
      lastCommitRef.current = latestCommit;
      // Only trigger reload if we're in preview mode
      if (viewType === 'preview') {
        handleReload();
      }
    }
  }, [commits, handleReload, viewType]);

  if (!ui) return <LoadingScreen />;

  return (
    <>
      {/* {latestDeployment && <DeploymentCard deployment={latestDeployment} />} */}
      <InterfaceLayout
        id={id}
        chatIframeRef={chatIframeRef}
        isLoading={isLoading}
        viewMode={viewMode}
        status={status}
        iframeUrl={iframeUrl}
        handleIframeLoad={handleIframeLoad}
        iframeRef={iframeRef}
      />
      {/* Drawer for viewing deployments */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer}
      >
        <Box
          sx={{ width: 350, p: 2 }}
          role="presentation"
        >
          <DeploymentHistory
            ui={ui}
            handleReload={handleReload}
          />
        </Box>
      </Drawer>
      {isSettingsOpen && (
        <SettingsDrawer
          open={isSettingsOpen}
          onClose={handleSettingsClose}
          ui={ui}
        />
      )}
      <PublishDialog
        open={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        interfaceId={ui?.id}
        name={ui?.name}
        deploymentUrl={ui?.deployment_url}
      />
    </>
  );
}

export default memo(InterfacePage);
