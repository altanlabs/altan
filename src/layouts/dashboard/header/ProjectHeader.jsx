import { Capacitor } from '@capacitor/core';
import React, { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { 
  MoreVertical, 
  Rocket, 
  Crown, 
  History, 
  Settings as SettingsIcon,
  Radio 
} from 'lucide-react';

// local components
import AltanerComponentContextMenu from './AltanerComponentContextMenu.jsx';
import MobileNavigation from './components/MobileNavigation.jsx';
import ProjectNav from './ProjectNav.jsx';
// components
import { HoverBorderGradient } from '../../../components/aceternity/buttons/hover-border-gradient.tsx';
import DatabaseNavigationBar from '../../../components/databases/navigation/DatabaseNavigationBar.jsx';
import DeleteDialog from '../../../components/dialogs/DeleteDialog.jsx';
import EditProjectDialog from '../../../components/dialogs/EditProjectDialog.jsx';
import VersionHistoryDrawer from '../../../components/drawers/VersionHistoryDrawer';
import Iconify from '../../../components/iconify';
import InvitationMenuPopover from '../../../components/invitations/InvitationMenuPopover.jsx';
import URLNavigationBar from '../../../components/URLNavigationBar.jsx';
// config
import { HEADER } from '../../../config-global';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// sections
import AltanerComponentDialog from '../../../pages/dashboard/altaners/components/AltanerComponentDialog.jsx';
import PublishVersionDialog from '../../../pages/dashboard/altaners/components/PublishVersionDialog.jsx';
import TemplateSettings from '../../../pages/dashboard/altaners/components/TemplateSettings.jsx';
import DeploymentHistory from '../../../pages/dashboard/interfaces/components/DeploymentHistory.jsx';
// import AltanerSwitcher from '../../../pages/dashboard/altaners/nav/AltanerSwitcher.jsx';
import SettingsDrawer from '../../../pages/dashboard/interfaces/components/SettingsDrawer.jsx';
import {
  deleteAltanerComponentById,
  selectCurrentAltaner,
  selectSortedAltanerComponents,
  selectViewType,
  selectDisplayMode,
  setDisplayModeForProject,
} from '../../../redux/slices/altaners';
import { makeSelectInterfaceById, makeSelectSortedCommits, getInterfaceById, selectIsAccountFree } from '../../../redux/slices/general.js';
import { useSelector } from '../../../redux/store';

// shadcn components
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { Sheet, SheetContent } from '../../../components/ui/sheet';
import { cn } from '../../../lib/utils';

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
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>More actions</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDistribution}>
          <Radio className="h-4 w-4 mr-2" />
          Distribution
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onHistory}>
          <History className="h-4 w-4 mr-2" />
          History
        </DropdownMenuItem>
        {onSettings && (
          <DropdownMenuItem onClick={onSettings}>
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onUpgrade}>
          <Crown className="h-4 w-4 mr-2" />
          Upgrade
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function ProjectHeader() {
  const history = useHistory();
  const { altanerId, componentId, baseId: routeBaseId, tableId } = useParams();
  const altaner = useSelector(selectCurrentAltaner);
  const sortedComponents = useSelector(selectSortedAltanerComponents);
  const viewType = useSelector(selectViewType);
  const displayMode = useSelector(selectDisplayMode);
  const isMobile = useResponsive('down', 'sm');
  const dispatch = useDispatch();
  const isIOS = isIOSCapacitor();
  const isAccountFree = useSelector(selectIsAccountFree);

  const currentComponent = sortedComponents?.[componentId];
  const isInterfaceComponent = currentComponent?.type === 'interface';
  const isDatabaseComponent = currentComponent?.type === 'base';
  const interfaceId = isInterfaceComponent ? currentComponent?.params?.id : null;
  const selectInterfaceById = useMemo(makeSelectInterfaceById, []);
  const selectSortedCommits = useMemo(makeSelectSortedCommits, []);
  const ui = useSelector((state) =>
    isInterfaceComponent && interfaceId ? selectInterfaceById(state, interfaceId) : null,
  );
  const interfaceCommits = useSelector((state) =>
    interfaceId ? selectSortedCommits(state, interfaceId) : [],
  );

  // Check if interface has commits
  const hasInterfaceCommits = useMemo(() => {
    if (!interfaceId) return false;
    // If interface data hasn't loaded yet, don't show URL bar
    if (!ui) return false;
    // Only show URL bar if interface has commits
    return interfaceCommits && interfaceCommits.length > 0;
  }, [interfaceId, ui, interfaceCommits]);

  // Determine if publish button should be enabled
  // For interface components: need commits to publish
  // For other components: can always publish
  const canPublish = useMemo(() => {
    if (!isInterfaceComponent) return true; // Non-interface components can always publish
    return hasInterfaceCommits; // Interface components need commits
  }, [isInterfaceComponent, hasInterfaceCommits]);

  // Determine if More Actions menu should be shown
  // For interface components: only show if has commits
  // For other components: always show
  const shouldShowMoreActions = useMemo(() => {
    if (!isInterfaceComponent) return true; // Non-interface components always show menu
    return hasInterfaceCommits; // Interface components need commits
  }, [isInterfaceComponent, hasInterfaceCommits]);

  // Calculate production URL for the interface
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

    if (!hasSuccessfulDeployments) {
      return null;
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
  const [isDeploymentHistoryOpen, setIsDeploymentHistoryOpen] = useState(false);

  useEffect(() => {
    if (isMobile && displayMode === 'chat' && altanerId) {
      dispatch(setDisplayModeForProject({ altanerId, displayMode: 'both' }));
    }
  }, [isMobile, displayMode, dispatch, altanerId]);

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
        throw error;
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [dispatch, selectedComponentId]);

  return (
    <TooltipProvider>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-30",
          "transition-all duration-200",
          isIOS && "pt-[env(safe-area-inset-top)]"
        )}
        style={{
          height: isIOS ? `calc(${HEADER.H_MOBILE}px + env(safe-area-inset-top))` : `${HEADER.H_MOBILE}px`
        }}
      >
        <div
          className={cn(
            "flex items-center justify-between h-full py-1",
            isMobile ? "px-1" : "px-2"
          )}
        >
          <div className="flex items-center gap-2">
            {altaner?.id ? (
              <>
                {sortedComponents && (
                  isMobile ? (
                    <MobileNavigation
                      altaner={altaner}
                      onBackToDashboard={() => history.push('/')}
                    />
                  ) : (
                    <ProjectNav
                      components={sortedComponents}
                      altanerId={altanerId}
                      onEditAltaner={() => {
                        if (altaner?.id) {
                          setOpenEditAltaner(true);
                        }
                      }}
                    />
                  )
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
                <span className="hidden group-hover:md:flex text-white dark:text-black whitespace-nowrap">
                  Back to dashboard
                </span>
              </HoverBorderGradient>
            )}
          </div>

          {altaner?.id && isInterfaceComponent && !isMobile && hasInterfaceCommits && (
            <URLNavigationBar
              productionUrl={productionUrl}
              disabled={!ui || viewType === 'code'}
            />
          )}

          {altaner?.id && isDatabaseComponent && !isMobile && <DatabaseNavigationBar />}

          {/* Right section - Action buttons */}
          <div className="flex items-center h-full">
            {altaner?.id &&
              (isMobile ? (
                <div className="flex items-center gap-2">
                  {shouldShowMoreActions && (
                    <MobileActionsMenu
                      onDistribution={() => setOpenSettings(true)}
                      onHistory={() => setOpenVersionHistory(true)}
                      onSettings={
                        isInterfaceComponent && interfaceId && hasInterfaceCommits ? () => setOpenSettingsDrawer(true) : null
                      }
                      onUpgrade={() => history.push('/pricing')}
                    />
                  )}
                  {isInterfaceComponent && hasInterfaceCommits && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsDeploymentHistoryOpen(true)}
                          className="h-8 w-8"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Deployment History</TooltipContent>
                    </Tooltip>
                  )}
                  <InvitationMenuPopover isDashboard={true} />
                  {isAccountFree && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => history.push('/pricing')}
                          className="h-8 w-8"
                        >
                          <Crown className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Upgrade to unlock more features</TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        data-tour="publish-button"
                        variant={canPublish ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setOpenPublishDialog(true)}
                        disabled={!canPublish}
                        className="h-8 w-8"
                      >
                        <Rocket className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {!canPublish ? "Make some changes to publish your site to the internet, connect it to a domain" : "Publish"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {shouldShowMoreActions && (
                    <MobileActionsMenu
                      onDistribution={() => setOpenSettings(true)}
                      onHistory={() => setOpenVersionHistory(true)}
                      onSettings={
                        isInterfaceComponent && interfaceId && hasInterfaceCommits ? () => setOpenSettingsDrawer(true) : null
                      }
                      onUpgrade={() => history.push('/pricing')}
                    />
                  )}

                  {isInterfaceComponent && hasInterfaceCommits && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsDeploymentHistoryOpen(true)}
                          className="h-8 w-8"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Deployment History</TooltipContent>
                    </Tooltip>
                  )}
                  <InvitationMenuPopover isDashboard={true} />

                  {isAccountFree && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => history.push('/pricing')}
                      className="h-8"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade
                    </Button>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        data-tour="publish-button"
                        variant={canPublish ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setOpenPublishDialog(true)}
                        disabled={!canPublish}
                        className="h-8"
                      >
                        <Rocket className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {!canPublish ? "Make some changes to publish your site to the internet, connect it to a domain" : "Publish"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
          </div>
        </div>
      </header>

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

      <EditProjectDialog
        open={openEditAltaner}
        onClose={() => setOpenEditAltaner(false)}
        project={altaner}
      />

      {/* Deployment History Drawer */}
      <Sheet open={isDeploymentHistoryOpen} onOpenChange={setIsDeploymentHistoryOpen}>
        <SheetContent className="w-[400px] max-w-[90vw]">
          <DeploymentHistory
            ui={ui}
            handleReload={async () => {
              // Reload interface data to get latest commits and deployments
              if (interfaceId) {
                await dispatch(getInterfaceById(interfaceId));
              }
            }}
          />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

export default memo(ProjectHeader);
