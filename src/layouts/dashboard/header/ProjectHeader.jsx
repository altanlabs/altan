import { Capacitor } from '@capacitor/core';
// @mui
import {
  Stack,
  AppBar,
  Toolbar,
  Typography,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
// react
import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

// local components
import AltanerComponentContextMenu from './AltanerComponentContextMenu.jsx';
import ProjectNav from './ProjectNav.jsx';
// components
import { HoverBorderGradient } from '../../../components/aceternity/buttons/hover-border-gradient.tsx';
import CodeToggleButton from '../../../components/buttons/CodeToggleButton.jsx';
import DeleteDialog from '../../../components/dialogs/DeleteDialog.jsx';
import VersionHistoryDrawer from '../../../components/drawers/VersionHistoryDrawer';
import FormDialog from '../../../components/FormDialog.jsx';
import HeaderIconButton from '../../../components/HeaderIconButton.jsx';
import Iconify from '../../../components/iconify';
import URLNavigationBar from '../../../components/URLNavigationBar.jsx';
// config
import { HEADER } from '../../../config-global';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// sections
import AltanerComponentDialog from '../../../pages/dashboard/altaners/components/AltanerComponentDialog.jsx';
import PublishVersionDialog from '../../../pages/dashboard/altaners/components/PublishVersionDialog.jsx';
import TemplateSettings from '../../../pages/dashboard/altaners/components/TemplateSettings.jsx';
// import AltanerSwitcher from '../../../pages/dashboard/altaners/nav/AltanerSwitcher.jsx';
import SettingsDrawer from '../../../pages/dashboard/interfaces/components/SettingsDrawer.jsx';
import {
  deleteAltanerComponentById,
  selectCurrentAltaner,
  selectSortedAltanerComponents,
  selectViewType,
  selectDisplayMode,
  setDisplayMode,
  updateAltanerById,
} from '../../../redux/slices/altaners';
import { makeSelectInterfaceById } from '../../../redux/slices/general.js';
import {
  navigateToPath,
  refreshIframe,
  openInNewTab,
  toggleIframeViewMode,
  selectIframeViewMode,
} from '../../../redux/slices/previewControl';
import { useSelector } from '../../../redux/store';
// utils
import { bgBlur } from '../../../utils/cssStyles';

// Utility function to check if we're on iOS Capacitor platform
const isIOSCapacitor = () => {
  try {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    return isNative && platform === 'ios';
  } catch {
    return false;
  }
};

// Mobile Actions Menu Component
const MobileActionsMenu = ({ onDistribution, onHistory, onSettings, onUpgrade }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    handleClose();
    action();
  };

  return (
    <>
      <Tooltip title="More actions">
        <HeaderIconButton
          onClick={handleClick}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
          }}
        >
          <Iconify
            icon="mdi:dots-vertical"
            sx={{ width: 16, height: 16 }}
          />
        </HeaderIconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick(onDistribution)}>
          <ListItemIcon>
            <Iconify
              icon="mdi:broadcast"
              className="w-5 h-5"
            />
          </ListItemIcon>
          <ListItemText>Distribution</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick(onHistory)}>
          <ListItemIcon>
            <Iconify
              icon="mdi:history"
              className="w-5 h-5"
            />
          </ListItemIcon>
          <ListItemText>History</ListItemText>
        </MenuItem>
        {onSettings && (
          <MenuItem onClick={() => handleMenuItemClick(onSettings)}>
            <ListItemIcon>
              <Iconify
                icon="mdi:cog"
                className="w-5 h-5"
              />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleMenuItemClick(onUpgrade)}>
          <ListItemIcon>
            <Iconify
              icon="material-symbols:crown"
              className="w-5 h-5"
            />
          </ListItemIcon>
          <ListItemText>Upgrade</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

function ProjectHeader() {
  const theme = useTheme();
  const history = useHistory();
  const { altanerId, componentId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);
  const viewType = useSelector(selectViewType);
  const displayMode = useSelector(selectDisplayMode);
  const isMobile = useResponsive('down', 'sm');
  const dispatch = useDispatch();
  const isIOS = isIOSCapacitor();

  // Get iframe view mode from Redux
  const iframeViewMode = useSelector(selectIframeViewMode);

  const currentComponent = sortedComponents?.[componentId];
  const isInterfaceComponent = currentComponent?.type === 'interface';
  const interfaceId = isInterfaceComponent ? currentComponent?.params?.id : null;
  const selectInterfaceById = useMemo(makeSelectInterfaceById, []);
  const ui = useSelector((state) =>
    isInterfaceComponent && interfaceId ? selectInterfaceById(state, interfaceId) : null,
  );
  // Calculate production URL for the interface
  const productionUrl = useMemo(() => {
    if (!ui) return null;

    // First, check if there are any successful deployments
    const hasSuccessfulDeployments =
      ui.deployments?.items?.length > 0 &&
      ui.deployments.items.some(
        (deployment) => deployment.status === 'PROMOTED' || deployment.status === 'SUCCESS' || deployment.status === 'COMPLETED',
      );
    
    console.log('hasSuccessfulDeployments', hasSuccessfulDeployments);

    if (!hasSuccessfulDeployments) {
      return null; // No successful deployments, don't show toggle
    }

    // Check for custom domain first (from meta_data.domains)
    if (ui.meta_data?.domains) {
      const customDomains = Object.keys(ui.meta_data.domains);
      if (customDomains.length > 0) {
        return `https://${customDomains[0]}`;
      }
    }

    // Check for deployment_url
    if (ui.deployment_url) {
      return ui.deployment_url;
    }

    // Default to {interface.name}.altanlabs.com
    if (ui.name) {
      return `https://${ui.name}.altanlabs.com`;
    }

    return null;
  }, [ui]);
  const [openComponentDialog, setOpenComponentDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [openSettingsDrawer, setOpenSettingsDrawer] = useState(false);
  const [openVersionHistory, setOpenVersionHistory] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [openEditAltaner, setOpenEditAltaner] = useState(false);

  // Navigation handlers for URLNavigationBar using Redux
  const handleNavigateToPath = useCallback(
    (path) => {
      dispatch(navigateToPath(path));
    },
    [dispatch],
  );

  const handleToggleIframeViewMode = useCallback(() => {
    dispatch(toggleIframeViewMode());
  }, [dispatch]);

  const handleOpenIframeInNewTab = useCallback(() => {
    dispatch(openInNewTab());
  }, [dispatch]);

  const handleRefreshIframe = useCallback(() => {
    dispatch(refreshIframe());
  }, [dispatch]);

  useEffect(() => {
    if (isMobile && displayMode === 'chat') {
      dispatch(setDisplayMode('both'));
    }
  }, [isMobile, displayMode, dispatch]);

  useEffect(() => {
    const handleProjectComponentsUpdate = () => {
      // Update logic removed since projectNavState was unused
    };

    window.addEventListener('project-components-update', handleProjectComponentsUpdate);

    return () => {
      window.removeEventListener('project-components-update', handleProjectComponentsUpdate);
    };
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleEdit = useCallback(() => {
    setEditDialogOpen(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const handleOpenInNewTab = useCallback(() => {
    if (!selectedComponentId || !altanerId) {
      return;
    }

    const component = sortedComponents?.[selectedComponentId];
    let url = `/project/${altanerId}/c/${selectedComponentId}`;

    if (component?.type === 'base' && component?.params?.ids?.[0]) {
      url = `/project/${altanerId}/c/${selectedComponentId}`;
    } else if (component?.type === 'external_link' && component?.params?.url) {
      url = component.params.url;
    }

    window.open(url, '_blank');
    handleCloseContextMenu();
  }, [selectedComponentId, altanerId, sortedComponents, handleCloseContextMenu]);

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const confirmDelete = useCallback(() => {
    if (!selectedComponentId) {
      return;
    }

    setIsSubmitting(true);
    dispatch(deleteAltanerComponentById(selectedComponentId))
      .then(() => {
        setDeleteDialogOpen(false);
        setSelectedComponentId(null);
      })
      .catch((error) => {
        // Failed to delete component
        console.error('Failed to delete component:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [dispatch, selectedComponentId]);

  const handleConfirmEditAltaner = useCallback(
    async (data) => {
      try {
        await dispatch(updateAltanerById(altaner.id, data));
        setOpenEditAltaner(false);
      } catch (error) {
        // Failed to update altaner
        console.error('Failed to update altaner:', error);
      }
    },
    [dispatch, altaner?.id],
  );

  const editAltanerSchema = useMemo(
    () => ({
      properties: {
        name: {
          type: 'string',
          title: 'Name',
          default: altaner?.name,
        },
        description: {
          type: 'string',
          title: 'Description',
          default: altaner?.description,
        },
        icon_url: {
          type: 'string',
          title: 'Icon URL',
          default: altaner?.icon_url,
          'x-component': 'IconAutocomplete',
        },
      },
      required: ['name'],
    }),
    [altaner],
  );

  // Calculate safe area aware styles for iOS
  const getHeaderStyles = () => {
    const baseStyles = {
      boxShadow: 'none',
      height: HEADER.H_MOBILE,
      zIndex: 3,
      ...bgBlur({
        color: theme.palette.background.default,
      }),
      transition: theme.transitions.create(['height'], {
        duration: theme.transitions.duration.shorter,
      }),
    };

    if (isIOS) {
      return {
        ...baseStyles,
        paddingTop: 'env(safe-area-inset-top)',
        height: `calc(${HEADER.H_MOBILE}px + env(safe-area-inset-top))`,
      };
    }

    return baseStyles;
  };

  return (
    <>
      <AppBar sx={getHeaderStyles()}>
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            zIndex: 5,
            height: HEADER.H_MOBILE,
            px: isMobile ? '0.25rem' : '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            {altaner?.id ? (
              <>
                {sortedComponents && (
                  <ProjectNav
                    components={sortedComponents}
                    altanerId={altanerId}
                    onEditAltaner={() => setOpenEditAltaner(true)}
                  />
                )}
              </>
            ) : (
              <HoverBorderGradient
                containerClassName="group rounded-full bg-white dark:bg-black border-transparent"
                as="button"
                className="transition-all duration-200 w-[50px] h-[36px] group-hover:md:w-[170px] text-sm bg-slate-500 group-hover:bg-slate-700 dark:group-hover:bg-slate-300 text-black dark:text-white flex items-center space-x-1"
                onClick={() => history.push('/')}
                disableAnimation
              >
                <Iconify
                  className="text-white dark:text-black"
                  icon="eva:arrow-back-outline"
                />
                <Typography
                  noWrap
                  variant="body"
                  className="flex-no-wrap hidden group-hover:md:flex text-white dark:text-black"
                >
                  Back to dashboard
                </Typography>
              </HoverBorderGradient>
            )}
          </Stack>

          {altaner?.id && isInterfaceComponent && !isMobile && (
            <URLNavigationBar
              onNavigate={handleNavigateToPath}
              onToggleViewMode={handleToggleIframeViewMode}
              onOpenInNewTab={handleOpenIframeInNewTab}
              onRefresh={handleRefreshIframe}
              viewMode={iframeViewMode}
              productionUrl={productionUrl}
              disabled={!ui || viewType === 'code'}
            />
          )}

          {/* Middle section - URL Navigation Bar */}

          <Stack
            direction="row"
            alignContent="center"
            alignItems="center"
            sx={{ height: HEADER.H_MOBILE }}
          >
            {altaner?.id &&
              (isMobile ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <MobileActionsMenu
                    onDistribution={() => setOpenSettings(true)}
                    onHistory={() => setOpenVersionHistory(true)}
                    onSettings={
                      isInterfaceComponent && interfaceId ? () => setOpenSettingsDrawer(true) : null
                    }
                    onUpgrade={() => history.push('/pricing')}
                  />
                  <Tooltip title="Publish">
                    <HeaderIconButton
                      onClick={() => setOpenPublishDialog(true)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      <Iconify
                        icon="mdi:rocket-launch-outline"
                        sx={{ width: 16, height: 16 }}
                      />
                    </HeaderIconButton>
                  </Tooltip>
                </Stack>
              ) : (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                 
                  {altaner?.room_id && !isMobile && (
                    <Tooltip
                      title={displayMode === 'preview' ? 'Show Chat Sidebar' : 'Hide Chat Sidebar'}
                    >
                      <HeaderIconButton
                        onClick={() => {
                          // Toggle between preview and both modes only
                          const nextMode = displayMode === 'preview' ? 'both' : 'preview';
                          dispatch(setDisplayMode(nextMode));
                        }}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                        }}
                      >
                        <Iconify
                          icon={displayMode === 'preview' ? 'mdi:dock-right' : 'mdi:dock-left'}
                          sx={{ width: 16, height: 16 }}
                        />
                      </HeaderIconButton>
                    </Tooltip>
                  )}
                  <MobileActionsMenu
                    onDistribution={() => setOpenSettings(true)}
                    onHistory={() => setOpenVersionHistory(true)}
                    onSettings={
                      isInterfaceComponent && interfaceId ? () => setOpenSettingsDrawer(true) : null
                    }
                    onUpgrade={() => history.push('/pricing')}
                  />

                  {/* <Button
                    size="small"
                    color="inherit"
                    variant="soft"
                    startIcon={<Iconify icon="material-symbols:crown" />}
                    onClick={() => history.push('/pricing')}
                  >
                    Upgrade
                  </Button> */}

                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="mdi:rocket-launch-outline" sx={{ width: 16, height: 16 }} />}
                    onClick={() => setOpenPublishDialog(true)}
                    sx={{
                      height: 32,
                      borderRadius: 1.5,
                      px: 2,
                      minWidth: 'auto',
                    }}
                  >
                    Publish
                  </Button>
                </Stack>
              ))}
          </Stack>
        </Toolbar>
      </AppBar>

      <VersionHistoryDrawer
        open={openVersionHistory}
        onClose={() => setOpenVersionHistory(false)}
        versions={altaner?.template?.versions}
        selectedVersionId={altaner?.template?.selected_version_id}
      />

      <AltanerComponentContextMenu
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
        onEdit={handleEdit}
        onOpenInNewTab={handleOpenInNewTab}
        onDelete={handleDelete}
      />

      <DeleteDialog
        openDeleteDialog={deleteDialogOpen}
        handleCloseDeleteDialog={() => setDeleteDialogOpen(false)}
        confirmDelete={confirmDelete}
        isSubmitting={isSubmitting}
        message="Are you sure you want to delete this component? This action can't be undone."
      />

      {editDialogOpen && (
        <AltanerComponentDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedComponentId(null);
          }}
          altanerId={altanerId}
          altanerComponentId={selectedComponentId}
        />
      )}

      <AltanerComponentDialog
        altanerId={altanerId}
        open={openComponentDialog}
        onClose={() => setOpenComponentDialog(false)}
      />

      <TemplateSettings
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />

      <PublishVersionDialog
        open={openPublishDialog}
        onClose={() => setOpenPublishDialog(false)}
        altaner={altaner}
        ui={ui}
      />

      {!!ui && (
        <SettingsDrawer
          open={openSettingsDrawer}
          onClose={() => setOpenSettingsDrawer(false)}
          ui={ui}
        />
      )}

      <FormDialog
        open={openEditAltaner}
        onClose={() => setOpenEditAltaner(false)}
        schema={editAltanerSchema}
        title="Edit Project"
        description="Update the project details"
        onConfirm={handleConfirmEditAltaner}
      />
    </>
  );
}

export default memo(ProjectHeader);
