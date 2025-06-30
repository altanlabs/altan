import { Stack, Box, IconButton, Tooltip } from '@mui/material';
import Fuse from 'fuse.js';
import React, { useCallback, useState, useMemo, useEffect, memo, useRef } from 'react';
import { useHistory, useParams } from 'react-router';

import Workflow from './Workflow.jsx';
import NoEntityPlaceholder from '../../../components/databases/placeholders/NoEntityPlaceholder.jsx';
import DeleteDialog from '../../../components/dialogs/DeleteDialog.jsx';
import CollapsibleDrawer from '../../../components/drawer/CollapsibleDrawer.jsx';
import Iconify from '../../../components/iconify/Iconify.jsx';
import AltanLogo from '../../../components/loaders/AltanLogo.jsx';
import { useSettingsContext } from '../../../components/settings/SettingsContext.jsx';
import { useDebounce } from '../../../hooks/useDebounce';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch';
import AltanerComponentDialog from '../../../pages/dashboard/altaners/components/AltanerComponentDialog.jsx';
import {
  deleteWorkflow,
  duplicateWorkflow,
  getFlows,
  patchFlow,
  selectFlowStateInitialized,
  selectFlowStateLoading,
} from '../../../redux/slices/flows';
import { dispatch, useSelector } from '../../../redux/store';
import CreateFlowDialog from '../jobs/CreateFlowDialog.jsx';

const flowsLoadingSelector = selectFlowStateLoading('flows');
const flowsInitializedSelector = selectFlowStateInitialized('flows');
const selectAccountId = (state) => state.general.account?.id;
const selectFlows = (state) => state.flows.flows;

const Workflows = ({ filterIds = null, onNavigate, altanerComponentId, ...altanerProps }) => {
  const { animations } = useSettingsContext();
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedFlowToDelete, setSelectedFlowToDelete] = useState(null);
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const isFirstRender = useRef(true);
  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);
  const history = useHistory();;
  const { flowId: urlFlowId } = useParams();
  const flows = useSelector(selectFlows);
  // const types = useSelector(selectConnectionTypes);
  const accountId = useSelector(selectAccountId);
  const flowsLoading = useSelector(flowsLoadingSelector);
  const flowsInitialized = useSelector(flowsInitializedSelector);
  const [searchText, setSearchText] = useState('');
  const debouncedSearchQuery = useDebounce(searchText, 500);
  const searchInputRef = useRef(null);
  // const gridRef = useRef(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [editAltanerComponentOpen, setEditAltanerComponentOpen] = useState(false);
  const [sortByDate, setSortByDate] = useState(true); // true = newest first

  const filteredFlows = useMemo(() => {
    if (filterIds?.length === 0 && altanerProps?.altanerId) {
      return [];
    }

    let filtered = flows;

    // Step 1: Filter by IDs if `filterIds` is present
    if (filterIds?.length > 0) {
      filtered = filtered.filter((flow) => filterIds.includes(flow.id));
    }

    // Step 2: Filter further by `debouncedSearchQuery` if it exists
    if (debouncedSearchQuery?.length) {
      const options = {
        keys: ['name', 'description'], // Fields to search in
        threshold: 0.3, // Adjust sensitivity as needed
      };

      const fuse = new Fuse(filtered, options);
      filtered = fuse.search(debouncedSearchQuery).map((result) => result.item);
    }

    // Step 3: Sort by date_creation if sortByDate is enabled
    if (sortByDate) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.date_creation);
        const dateB = new Date(b.date_creation);
        return dateB - dateA; // Sort in descending order (newest first)
      });
    }

    return filtered;
  }, [flows, filterIds, altanerProps?.altanerId, debouncedSearchQuery, sortByDate]);

  useEffect(() => {
    if (!!accountId) {
      dispatch(getFlows(accountId));
    }
  }, [accountId]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (urlFlowId && flows.some((flow) => flow.id === urlFlowId)) {
      setSelectedFlowId(urlFlowId);
    } else if (filteredFlows.length > 0 && !selectedFlowId) {
      // Auto-select first workflow only if no URL parameter exists
      const firstFlowId = filteredFlows[0].id;
      if (altanerProps?.altanerId) {
        history.push(`w/${firstFlowId}`, { replace: true });
      }
      setSelectedFlowId(firstFlowId);
    }
  }, [flows, selectedFlowId, altanerProps?.altanerId, history.push, urlFlowId, filteredFlows]);

  const openDeleteDialog = useCallback((flowId) => setSelectedFlowToDelete(flowId), []);
  const closeDeleteDialog = useCallback(() => setSelectedFlowToDelete(null), []);

  const handleDelete = useCallback(() => {
    if (!selectedFlowToDelete) {
      return;
    }
    dispatchWithFeedback(deleteWorkflow(selectedFlowToDelete), {
      successMessage: 'Workflow deleted successfuly',
      errorMessage: 'There was an error deleting the workflow',
      useSnackbar: true,
      useConsole: {
        success: false,
        error: true,
      },
    }).then(() => {
      closeDeleteDialog();
      setSelectedFlowId(null);
    });
  }, [selectedFlowToDelete, dispatchWithFeedback, closeDeleteDialog]);

  const handleDuplicate = useCallback(
    (flowId) => {
      dispatchWithFeedback(duplicateWorkflow(flowId), {
        successMessage: 'Workflow duplicated successfully',
        errorMessage: 'There was an error duplicating the workflow',
        useSnackbar: true,
        useConsole: {
          success: false,
          error: true,
        },
      });
    },
    [dispatchWithFeedback],
  );

  const handleSwitchChange = useCallback(
    (flowId, is_active) =>
      dispatchWithFeedback(patchFlow(flowId, { is_active }), {
        successMessage: 'Flow status updated successfully!',
        errorMessage: 'Error updating Flow ',
        useSnackbar: true,
      }),
    [dispatchWithFeedback],
  );

  useEffect(() => {
    if (
      isFirstRender.current &&
      filteredFlows.length === 1 &&
      !selectedFlowId &&
      altanerProps?.altanerComponentId
    ) {
      setSelectedFlowId(filteredFlows[0].id);
    }
    isFirstRender.current = false;
  }, [altanerProps?.altanerComponentId, filteredFlows, selectedFlowId]);

  const handleGoBack = useCallback(() => {
    setSelectedFlowId(null);
    isFirstRender.current = false;
  }, []);

  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const contextMenuActions = useMemo(
    () => [
      // {
      //   name: 'Edit',
      //   action: (data) => {
      //     if (!data?.id) return;
      //     handleDuplicate(data.id);
      //   },
      //   icon: 'ic:twotone-content-copy',
      //   color: 'inherit',
      // },
      {
        type: 'conditional',
        name: (data) => {
          if (!data) return '';
          return !data.is_active ? 'Activate' : 'Deactivate';
        },
        action: (data) => {
          if (!data) return;
          handleSwitchChange(data.id, !data.is_active);
        },
        icon: (data) => (!data?.is_active ? 'line-md:switch-off' : 'line-md:switch'),
        color: (data) => (!data?.is_active ? 'error' : 'success'),
      },
      {
        name: 'Duplicate',
        action: (data) => {
          if (!data?.id) return;
          handleDuplicate(data.id);
        },
        icon: 'ic:twotone-content-copy',
        color: 'inherit',
      },
      {
        name: 'Delete',
        action: (data) => {
          if (!data?.id) return;
          openDeleteDialog(data.id);
        },
        icon: 'iconamoon:trash-fill',
        color: 'error',
      },
    ],
    [handleSwitchChange, handleDuplicate, openDeleteDialog],
  );

  const handleFlowSelect = useCallback(
    (flow) => {
      setSelectedFlowId(flow.id);
      setIsDrawerOpen(false); // Close drawer when selecting a workflow
      if (altanerProps?.altanerId) {
        onNavigate(altanerComponentId, { flowId: flow.id });
      } else {
        history.push(`/flows/${flow.id}`);
      }
    },
    [altanerProps?.altanerId, altanerComponentId, onNavigate, history.push],
  );

  const handleOpenEditAltanerComponent = useCallback(() => {
    setEditAltanerComponentOpen(true);
  }, []);

  const handleCloseEditAltanerComponent = useCallback(() => {
    setEditAltanerComponentOpen(false);
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <CollapsibleDrawer
        isOpen={isDrawerOpen}
        onToggle={toggleDrawer}
        items={filteredFlows}
        contextMenuItems={contextMenuActions}
        onItemClick={handleFlowSelect}
        onSearch={setSearchText}
        onCreateClick={handleOpenCreate}
        searchPlaceholder="Search flows..."
        selectedId={selectedFlowId}
        // renderItem={(flow) => (
        //   <Typography
        //     variant="subtitle1"
        //     noWrap
        //   >
        //     {flow.name}
        //   </Typography>
        // )}
        altanerId={altanerProps?.altanerId}
        altanerComponentId={altanerComponentId}
        disableAnimation={!animations.flows}
        sortComponent={
          <Tooltip title={sortByDate ? 'Sort by: Newest first' : 'Sort by: Name'}>
            <IconButton
              size="small"
              onClick={() => setSortByDate(!sortByDate)}
              sx={{ color: 'text.disabled' }}
            >
              <Iconify
                icon={
                  sortByDate ? 'mdi:sort-calendar-descending' : 'mdi:sort-alphabetical-ascending'
                }
              />
            </IconButton>
          </Tooltip>
        }
      />
      {/* Main Content Area */}
      <Box
        sx={{
          height: '100%',
          width: '100%',
        }}
      >
        {!!flowsLoading || !flowsInitialized ? (
          <Stack
            direction="row"
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
          >
            <AltanLogo />
          </Stack>
        ) : selectedFlowId ? (
          <Workflow
            id={selectedFlowId}
            key={`workflow-${selectedFlowId}`}
            {...(altanerProps ?? {})}
            onGoBack={handleGoBack}
          />
        ) : (
          <NoEntityPlaceholder
            title="Link or create your first flow"
            description="Quickly automate your tasks by creating workflows that connect your apps and services."
            buttonMessage="Create flow"
            onButtonClick={handleOpenCreate}
            secondaryButtonMessage="Link existing flow"
            secondaryOnButtonClick={handleOpenEditAltanerComponent}
          />
        )}
      </Box>

      {/* Keep existing dialogs */}
      <DeleteDialog
        openDeleteDialog={!!selectedFlowToDelete}
        handleCloseDeleteDialog={closeDeleteDialog}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message="Deleting this flow will delete all modules associated with it, are you sure you want to continue?"
      />
      <CreateFlowDialog
        open={openCreate}
        handleClose={handleCloseCreate}
        altanerComponentId={altanerComponentId}
      />

      {!!(altanerProps?.altanerId && altanerComponentId) && (
        <AltanerComponentDialog
          altanerId={altanerProps?.altanerId}
          open={editAltanerComponentOpen}
          onClose={handleCloseEditAltanerComponent}
          altanerComponentId={altanerComponentId}
        />
      )}
    </Box>
  );
};

export default memo(Workflows);
