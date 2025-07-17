import { Box, IconButton, Stack, Typography, useTheme, Chip } from '@mui/material';
import { useState, useEffect, memo, useCallback, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useHistory } from 'react-router-dom';

import ReadmeDialog from './components/ReadmeDialog';
import RevenueMetrics from './components/RevenueMetrics';
import RevenueMetricsDialog from './components/RevenueMetricsDialog';
import useGetInterfaceServerStatus from './interfaces/hooks/useGetInterfaceServerStatus.js';
// eslint-disable-next-line import/no-unresolved
import { HoverBorderGradient } from '../../components/aceternity/buttons/hover-border-gradient.js';
import Iconify from '../../components/iconify/index.js';
import LoadingScreen from '../../components/loading-screen/LoadingScreen.jsx';
import { optimai } from '../../utils/axios.js';
import InterfaceRemixLayout from './interfaces/components/InterfaceRemixLayout.jsx';

// ----------------------------------------------------------------------

const RemixPage = () => {
  const theme = useTheme();
  const { altanerId } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uiInterface, setUiInterface] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('interface');
  const history = useHistory();
  const iframeRef = useRef(null);
  const [iframeUrl, setIframeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [arrDialogOpen, setArrDialogOpen] = useState(false);
  // Find the interface component from the app's components
  const interfaceComponent = useMemo(
    () => app?.components?.items?.find((item) => item.type === 'interface'),
    [app?.components?.items],
  );

  // Fetch both app and interface data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const appResponse = await optimai.get(`/altaner/${altanerId}`);
        const appData = appResponse.data.altaner;
        const accountData = appResponse.data.account;
        setApp({ ...appData, account: accountData });

        const interfaceId = appData?.components?.items?.find((item) => item.type === 'interface')
          ?.params?.id;

        if (interfaceId) {
          const interfaceResponse = await optimai.get(`/interfaces/${interfaceId}`);
          setUiInterface(interfaceResponse.data.interface);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [altanerId]);

  // Only get server status if there's no deployment_url
  const { status } = useGetInterfaceServerStatus(
    interfaceComponent?.params?.id,
    uiInterface && !uiInterface.deployment_url,
  );

  // Update baseIframeUrl calculation using useMemo to handle different component types
  const baseIframeUrl = useMemo(() => {
    const component = app?.components?.items?.find((item) => item.type === selectedComponent);
    if (!component) return '';

    if (selectedComponent === 'interface') {
      if (!uiInterface) return '';
      if (uiInterface.deployment_url) return uiInterface.deployment_url;
      if (!uiInterface.repo_name) return '';
      const queryParams = `theme=${theme.palette.mode}&hideSnippet=true`;
      return `https://${uiInterface.repo_name}.preview.altan.ai?${queryParams}`;
    }

    if (selectedComponent === 'base' && component.params?.ids?.[0]) {
      return `https://www.altan.ai/database/${component.params.ids[0]}`;
    }

    return '';
  }, [uiInterface, theme.palette.mode, selectedComponent, app?.components?.items]);

  // Update handleIframeLoad and handleReload to match Interface.jsx
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

  // Add effect to set initial iframe URL
  useEffect(() => {
    if (!!baseIframeUrl) {
      setIframeUrl(baseIframeUrl);
    }
  }, [baseIframeUrl]);

  // Update the reload effect - only run for preview URLs
  useEffect(() => {
    if (interfaceComponent && !interfaceComponent.deployment_url && status === 'running') {
      const timeoutId = setTimeout(handleReload, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [status, handleReload, interfaceComponent]);

  const handleRemixClick = () => {
    history.push(`/?template=${app.template.selected_version_id}`, { replace: true });
  };

  const handleComponentClick = (type) => {
    setSelectedComponent(type);
    setIsLoading(true);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!app) {
    return <div>App not found</div>;
  }

  return (
    <>
      <Box
        title="Altan"
        noPadding
        sx={{ height: '100%' }}
      >
        <Helmet>
          <title>Altan</title>
        </Helmet>

        <Stack
          height="100%"
          spacing={2}
          paddingTop={2}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              height: '20px',
              width: '100%',
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <IconButton
                onClick={() => history.push('/xsup/activity')}
                aria-label="Go back"
              >
                <Iconify icon="mdi:arrow-left" />
              </IconButton>

              <Typography variant="h5">{app.name}</Typography>

              <Typography
                variant="body2"
                onClick={() => history.push(`/accounts/${app.account_id}`)}
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                by {app.account}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: {
                  xs: 'none',
                  sm: 'flex',
                },
              }}
            >
              {app?.components?.items
                .filter(
                  (component) =>
                    component.type === 'interface' ||
                    (Array.isArray(component.params?.ids) && component.params.ids.length !== 0),
                )
                .sort((a, b) => a.position - b.position)
                .map((component) => (
                  <Chip
                    key={component.id}
                    icon={
                      <Iconify
                        icon={component.icon}
                        sx={{ width: 16, height: 16, color: '#60a5fa' }}
                      />
                    }
                    label={component.name}
                    size="small"
                    onClick={() => handleComponentClick(component.type)}
                  />
                ))}
              <RevenueMetrics
                arr={app.template?.meta_data?.arr}
                isVerified={app.template?.meta_data?.arr_verified}
              />
              {app.template?.description && (
                <Chip
                  icon={
                    <Iconify
                      icon="mdi:file-document-outline"
                      sx={{ width: 16, height: 16, color: 'inherit' }}
                    />
                  }
                  label="README"
                  sx={{
                    bgcolor: 'rgba(32, 101, 209, 0.16)',
                    color: '#60a5fa',
                    border: 'none',
                    cursor: 'pointer',
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(32, 101, 209, 0.24)',
                    },
                  }}
                  size="small"
                  onClick={() => setDescriptionDialogOpen(true)}
                />
              )}
            </Stack>

            <HoverBorderGradient
              containerClassName={`group relative rounded-full p-[1px] ${
                !app.is_clonable
                  ? 'bg-gray-800/40'
                  : 'bg-gradient-to-r from-indigo-500/30 to-violet-500/30'
              }`}
              as="button"
              className={`transition-all duration-200 min-w-[100px] h-[32px] text-sm ${
                !app.is_clonable
                  ? 'bg-gray-900/40 text-gray-600 cursor-not-allowed'
                  : 'bg-black/40 text-white/90 backdrop-blur-sm hover:bg-black/60'
              } rounded-full flex items-center justify-center px-3`}
              onClick={app.is_clonable ? handleRemixClick : undefined}
              disabled={!app.is_clonable}
              disableAnimation={!app.is_clonable}
            >
              <Iconify
                icon="solar:copy-bold-duotone"
                sx={{
                  mr: 0.5,
                  width: 16,
                  height: 16,
                  opacity: !app.is_clonable ? 0.5 : 0.9,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  opacity: !app.is_clonable ? 0.5 : 0.9,
                  letterSpacing: '0.01em',
                }}
              >
                {app.template?.meta_data?.price
                  ? `Clone $${(app.template.meta_data.price / 100).toFixed(0)}`
                  : 'Clone'}
              </Typography>
            </HoverBorderGradient>
          </Box>

          <InterfaceRemixLayout
            uiInterface={uiInterface}
            app={app}
            handleReload={handleReload}
            isLoading={isLoading}
            status={status}
            iframeUrl={iframeUrl}
            handleIframeLoad={handleIframeLoad}
            iframeRef={iframeRef}
          />
        </Stack>
      </Box>

      <ReadmeDialog
        open={descriptionDialogOpen}
        onClose={() => setDescriptionDialogOpen(false)}
        appName={app.name}
        description={app.template?.description}
      />

      <RevenueMetricsDialog
        open={arrDialogOpen}
        onClose={() => setArrDialogOpen(false)}
        arr={app?.template?.meta_data?.arr}
        isVerified={app?.template?.meta_data?.arr_verified}
      />
    </>
  );
};

export default memo(RemixPage);
