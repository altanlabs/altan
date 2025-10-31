import { Box, Drawer, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import DeploymentCard from './components/DeploymentCard.jsx';
import DeploymentHistory from './components/DeploymentHistory.jsx';
import PublishDialog from './components/PublishDialog.jsx';
import SettingsDrawer from './components/SettingsDrawer.jsx';
import useGetInterfaceServerStatus from './hooks/useGetInterfaceServerStatus.js';
import InterfaceLayout from './InterfaceLayout.jsx';
import { useHermesWebSocket } from '../../../providers/websocket/HermesWebSocketProvider.jsx';
import { selectViewType } from '../../../redux/slices/altaners';
import { clearCodeBaseState } from '../../../redux/slices/codeEditor.js';
import { makeSelectInterfaceById, makeSelectSortedCommits, getInterfaceById } from '../../../redux/slices/general';
// import { optimai } from '../../../utils/axios';
import { dispatch, useSelector } from '../../../redux/store.js';

function Interface({ id, chatIframeRef: chatIframeRefProp = null }) {
  const theme = useTheme();
  const ws = useHermesWebSocket();
  const { enqueueSnackbar } = useSnackbar();
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
  // const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'
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
    // Get the latest commit hash (first in the sorted array)
    const latestCommit = commits?.[0]?.commit_hash;
    if (!latestCommit) return '';

    const queryParams = new URLSearchParams({
      theme: theme.palette.mode,
      hideSnippet: 'true',
    });
    const baseUrl = `https://${ui.repo_name}.previews.altan.ai/`;
    console.log('baseUrl', baseUrl);
    return baseUrl ? `${baseUrl}?${queryParams.toString()}` : '';
  }, [ui?.repo_name, commits, theme.palette.mode, currentPath]);

  // Production URL - either deployment_url or {interface.name}.altanlabs.com or custom domain
  const productionUrl = useMemo(() => {
    if (!ui) return null;

    // First, check if there are any successful deployments
    const hasSuccessfulDeployments =
      ui.deployments?.items?.length > 0 &&
      ui.deployments.items.some(
        (deployment) =>
          deployment.status === 'PROMOTED' ||
          deployment.status === 'SUCCESS' ||
          deployment.status === 'COMPLETED',
      );

    // Only show production URL if there are successful deployments
    if (!hasSuccessfulDeployments) {
      return null;
    }

    // Default to {interface.name}.altanlabs.com
    if (ui.name) {
      return `https://${ui.name}.altanlabs.com${currentPath}`;
    }

    return null;
  }, [ui, currentPath]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleReload = useCallback(async () => {
    setIsLoading(true);
    // Refetch the interface data to get latest commits and deployments
    if (id) {
      await dispatch(getInterfaceById(id));
    }
    // Reload the iframe
    if (!!iframeRef.current) {
      setIframeUrl('');
      setTimeout(() => {
        setIframeUrl(baseIframeUrl);
      }, 0);
    }
  }, [baseIframeUrl, id]);

  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  // const handleSettingsOpen = () => {
  //   setIsSettingsOpen(true);
  // };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  // Fetch interface if not available in Redux store
  useEffect(() => {
    if (!ui && id) {
      dispatch(getInterfaceById(id));
    }
  }, [ui, id]);

  useEffect(() => {
    const iframe = iframeRef?.current;
    return () => {
      if (iframe) {
        iframe.src = 'about:blank';
        iframe.remove();
      }
    };
  }, []);

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
    if (baseIframeUrl) {
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
    return () => {
      dispatch(clearCodeBaseState());
    };
  }, []);

  // Listen for deployment completion events
  useEffect(() => {
    const handleDeploymentCompleted = (event) => {
      enqueueSnackbar(event.detail.message, {
        variant: 'success',
        autoHideDuration: 4000,
      });
    };

    window.addEventListener('deployment-completed', handleDeploymentCompleted);
    return () => {
      window.removeEventListener('deployment-completed', handleDeploymentCompleted);
    };
  }, [enqueueSnackbar]);

  // Watch for new commits and set loading state
  useEffect(() => {
    const latestCommit = commits?.[0]?.commit_hash;
    if (latestCommit && latestCommit !== lastCommitRef.current) {
      lastCommitRef.current = latestCommit;

      // Set loading state when new commit arrives
      if (viewType === 'preview') {
        setIsLoading(true);
      }
    }
  }, [commits, viewType]);

  if (!ui) return null;

  return (
    <>
      {latestDeployment && <DeploymentCard deployment={latestDeployment} />}
      <InterfaceLayout
        id={id}
        chatIframeRef={chatIframeRef}
        isLoading={isLoading}
        status={status}
        iframeUrl={iframeUrl}
        productionUrl={productionUrl}
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

export default memo(Interface);
