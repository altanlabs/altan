// @mui
import { Stack, AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// react
import { memo, useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

// local components
import AccountPopover from './AccountPopover.jsx';
import AltanerComponentContextMenu from './AltanerComponentContextMenu.jsx';
import AltanerNav from './AltanerNav.jsx';

// components
import { HoverBorderGradient } from '../../../components/aceternity/buttons/hover-border-gradient.tsx';
import DeleteDialog from '../../../components/dialogs/DeleteDialog.jsx';
import VersionHistoryDrawer from '../../../components/drawers/VersionHistoryDrawer';
import Iconify from '../../../components/iconify';

// config
import { HEADER } from '../../../config-global';

// hooks
import useResponsive from '../../../hooks/useResponsive';

// sections
import AltanerComponentDialog from '../../../pages/dashboard/altaners/components/AltanerComponentDialog.jsx';
import PublishVersionDialog from '../../../pages/dashboard/altaners/components/PublishVersionDialog.jsx';
import TemplateSettings from '../../../pages/dashboard/altaners/components/TemplateSettings.jsx';
import AltanerSwitcher from '../../../pages/dashboard/altaners/nav/AltanerSwitcher.jsx';

// redux
import {
  deleteAltanerComponentById,
  selectCurrentAltaner,
  selectSortedAltanerComponents,
} from '../../../redux/slices/altaners';
import { useSelector } from '../../../redux/store';

// utils
import { bgBlur } from '../../../utils/cssStyles';

function AltanerHeader() {
  const theme = useTheme();
  const history = useHistory();
  const { altanerId, altanerComponentId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);
  const isMobile = useResponsive('down', 'sm');
  const [openComponentDialog, setOpenComponentDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [openVersionHistory, setOpenVersionHistory] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(
    altanerComponentId || Object.keys(sortedComponents || {})[0] || '',
  );
  const dispatch = useDispatch();

  // Update activeTab when altanerComponentId changes
  useEffect(() => {
    if (altanerComponentId) {
      setActiveTab(altanerComponentId);
    } else if (sortedComponents && Object.keys(sortedComponents).length > 0) {
      setActiveTab(Object.keys(sortedComponents)[0]);
    }
  }, [altanerComponentId, sortedComponents]);

  const handleContextMenu = useCallback((event, componentId) => {
    event.preventDefault();
    setSelectedComponentId(componentId);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
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
      console.error('Missing component ID or altaner ID for opening in new tab');
      return;
    }

    const component = sortedComponents?.[selectedComponentId];
    let url = `/altaners/${altanerId}/c/${selectedComponentId}`;

    if (component?.type === 'base' && component?.params?.ids?.[0]) {
      url = `/altaners/${altanerId}/c/${selectedComponentId}/b/${component.params.ids[0]}`;
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
      console.error('No component selected for deletion');
      return;
    }

    setIsSubmitting(true);
    dispatch(deleteAltanerComponentById(selectedComponentId))
      .then(() => {
        setDeleteDialogOpen(false);
        setSelectedComponentId(null);
      })
      .catch((error) => {
        console.error('Failed to delete component:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [dispatch, selectedComponentId]);

  return (
    <>
      <AppBar
        sx={{
          boxShadow: 'none',
          height: HEADER.H_MOBILE,
          zIndex: 3,
          ...bgBlur({
            color: theme.palette.background.default,
          }),
          transition: theme.transitions.create(['height'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
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
          >
            {altaner?.id ? (
              <Box sx={{ px: isMobile ? 0.5 : 1 }}>
                <AltanerSwitcher />
              </Box>
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

          <Stack
            direction="row"
            alignContent="center"
            alignItems="center"
            spacing={1}
            sx={{ height: HEADER.H_MOBILE }}
          >
            {altaner?.id &&
              (isMobile ? (
                <></>
              ) : (
                <Stack
                  direction="row"
                  spacing={0}
                  alignItems="center"
                >
                  <IconButton
                    size="small"
                    onClick={() => setOpenVersionHistory(true)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="History"
                  >
                    <Iconify
                      icon="mdi:history"
                      className="w-5 h-5"
                    />
                  </IconButton>
                  <IconButton onClick={() => setOpenSettings(true)}>
                    <Iconify icon="mdi:cog" />
                  </IconButton>
                  <button
                    className="transition-all duration-200 px-3 py-1 text-xs bg-white/80 dark:bg-black/20 text-black dark:text-gray-200 flex items-center justify-center font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-full"
                    onClick={() => setOpenPublishDialog(true)}
                  >
                    <Iconify
                      icon="mdi:rocket-launch-outline"
                      width={14}
                    />
                    <Typography sx={{ ml: 0.5 }}>Publish</Typography>
                  </button>
                </Stack>
              ))}
            <AccountPopover />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Centralized navigation component */}
      {sortedComponents && (
        <AltanerNav
          components={sortedComponents}
          activeTab={activeTab}
          altanerId={altanerId}
          onTabChange={setActiveTab}
          onContextMenu={handleContextMenu}
          onAddClick={() => setOpenComponentDialog(true)}
        />
      )}

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
      />
    </>
  );
}

export default memo(AltanerHeader);
