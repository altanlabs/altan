import {
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Skeleton,
  Stack,
  Button,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Switch,
  Tooltip,
} from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
import PropTypes from 'prop-types';
import React, { memo, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext.ts';
import { WorkflowCarousel } from '../../../components/carousel';
import SearchField from '../../../components/custom-input/SearchField';
import Iconify from '../../../components/iconify';
import IconRenderer from '../../../components/icons/IconRenderer';
import useResponsive from '../../../hooks/useResponsive';
import TemplateMarketplace from '../../../pages/dashboard/marketplace/templates/TemplateMarketplace';
import { selectConnectionTypes } from '../../../redux/slices/connections';
import { selectFlowStateInitialized, selectFlowStateLoading } from '../../../redux/slices/flows';
import { selectCustomConnectionTypes } from '../../../redux/slices/general/index.ts';

// Selector for all connection types (system + custom)
const selectAllConnectionTypes = createSelector(
  [selectConnectionTypes, selectCustomConnectionTypes],
  (conns, myConns) => [...conns, ...(myConns ?? [])],
);

const flowsLoadingSelector = selectFlowStateLoading('flows');
const flowsInitializedSelector = selectFlowStateInitialized('flows');
const selectFlows = (state) => state.flows.flows;
// Helper function to format date (you might want to move this to a utils file)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

const WorkflowRow = ({ workflow, onClick, onStatusChange }) => {
  const allConnectionTypes = useSelector(selectAllConnectionTypes);
  const name = workflow.name || workflow.public_name || 'Unnamed Workflow';
  const isActive = workflow.is_active;
  const lastModified = workflow.last_modified;

  const getConnectionTypeObjects = () => {
    const connectionTypeIds = workflow.meta_data?.connection_types || [];
    if (connectionTypeIds.length > 0 && allConnectionTypes.length > 0) {
      return connectionTypeIds
        .map((typeId) => allConnectionTypes.find((connType) => connType.id === typeId))
        .filter(Boolean);
    }
    return [];
  };

  const actualConnectionTypes = getConnectionTypeObjects();

  return (
    <TableRow
      hover
      onClick={onClick}
      sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell
        component="th"
        scope="row"
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
        >
          <Iconify
            icon="ph:lightning-fill"
            width={20}
            color={isActive ? 'warning.main' : 'text.disabled'}
          />
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ maxWidth: 250 }}
          >
            {name}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
        >
          {actualConnectionTypes.slice(0, 4).map((ct) => (
            <Tooltip
              title={ct.name}
              key={ct.id}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconRenderer
                  icon={ct?.external_app?.icon || ct.icon}
                  size={18}
                />
              </Box>
            </Tooltip>
          ))}
          {actualConnectionTypes.length > 4 && (
            <Tooltip title={`${actualConnectionTypes.length - 4} more`}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  bgcolor: 'action.hover',
                  borderRadius: '4px',
                }}
              >
                +{actualConnectionTypes.length - 4}
              </Box>
            </Tooltip>
          )}
          {actualConnectionTypes.length === 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              No connections
            </Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell>{formatDate(lastModified)}</TableCell>
      <TableCell>
        <Switch
          checked={isActive}
          onChange={(e) => {
            e.stopPropagation(); // Prevent row click
            onStatusChange(workflow.id, e.target.checked);
          }}
          size="small"
        />
      </TableCell>
    </TableRow>
  );
};

WorkflowRow.propTypes = {
  workflow: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

const WorkflowRowSkeleton = memo(() => (
  <TableRow>
    <TableCell>
      <Skeleton
        variant="text"
        width={150}
      />
    </TableCell>
    <TableCell>
      <Skeleton
        variant="rectangular"
        width={80}
        height={24}
      />
    </TableCell>
    <TableCell>
      <Skeleton
        variant="text"
        width={100}
      />
    </TableCell>
    <TableCell>
      <Skeleton
        variant="circular"
        width={34}
        height={34}
      />
    </TableCell>
    <TableCell align="right">
      <Skeleton
        variant="circular"
        width={24}
        height={24}
      />
    </TableCell>
  </TableRow>
));
WorkflowRowSkeleton.displayName = 'WorkflowRowSkeleton';

const WorkflowsWidget = ({ initialSearchQuery = '' }) => {
  const history = useHistory();;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortOption, setSortOption] = useState('last_edited_newest');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [showAll, setShowAll] = useState(false);
  const [isCreateFlowDialogOpen, setIsCreateFlowDialogOpen] = useState(false);
  const isDesktop = useResponsive('up', 'md');
  const actualFlows = useSelector(selectFlows);
  const loading = useSelector(flowsLoadingSelector);
  const initialized = useSelector(flowsInitializedSelector);
  const { isAuthenticated } = useAuthContext();

  const filteredAndSortedWorkflows = useMemo(() => {
    if (!actualFlows) return [];
    return actualFlows
      .filter((workflow) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          workflow.name?.toLowerCase().includes(searchLower) ||
          workflow.description?.toLowerCase().includes(searchLower);

        const matchesActiveFilter =
          filterActive === 'all' ||
          (filterActive === 'active' && workflow.is_active) ||
          (filterActive === 'inactive' && !workflow.is_active);

        return matchesSearch && matchesActiveFilter;
      })
      .sort((a, b) => {
        // Add sorting logic if needed, similar to AltanersWidget
        // Example: by name or last modified date
        switch (sortOption) {
          case 'alphabetical_asc':
            return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
          case 'alphabetical_desc':
            return (b.name || '').toLowerCase().localeCompare((a.name || '').toLowerCase());
          case 'last_edited_newest':
          default:
            const dateA = new Date(a.last_modified || 0);
            const dateB = new Date(b.last_modified || 0);
            return dateB.getTime() - dateA.getTime();
        }
      });
  }, [actualFlows, searchQuery, sortOption, filterActive]);

  // Sample carousel cards data
  const carouselCards = [
    {
      backgroundPath: '/videos/flows/flow1.mp4',
      title: 'Automate Your Workflows',
      description: 'Create powerful automation workflows that connect your favorite apps and streamline your business processes.',
      buttonText: 'Get Started',
      navigateTo: '/auth/register',
      badge: 'NEW FEATURE',
    },
    {
      backgroundPath: '/videos/flows/flow1.mp4',
      title: 'Connect Everything',
      description: 'Integrate with hundreds of popular applications and services to build comprehensive automation solutions.',
      buttonText: 'Explore Integrations',
      navigateTo: '/auth/register',
      badge: 'POPULAR',
    },
    {
      backgroundPath: '/videos/flows/flow1.mp4',
      title: 'No-Code Solutions',
      description: 'Build complex workflows without writing a single line of code. Our visual editor makes automation accessible to everyone.',
      buttonText: 'Start Building',
      navigateTo: '/auth/register',
      badge: 'EASY',
    },
  ];

  // If user is not authenticated, show carousel and marketplace
  if (!isAuthenticated) {
    return (
      <Box>
        <WorkflowCarousel cards={carouselCards} />
        <TemplateMarketplace
          type="workflow"
          hideFilters
        />
      </Box>
    );
  }

  const handleStatusChange = (workflowId, newStatus) => {
    // TODO: Dispatch an action to update workflow status
    console.log(`Workflow ${workflowId} status changed to ${newStatus}`);
    // Example: dispatch(updateWorkflowStatus({ id: workflowId, is_active: newStatus }));
    // For now, we'll update local state if managing flows directly or rely on Redux to update
    // This part needs actual implementation with Redux or API call.
  };

  const handleClickWorkflow = (workflowId) => {
    history.push(`/flow/${workflowId}?goBack=true`);
  };

  const visibleWorkflows = showAll
    ? filteredAndSortedWorkflows
    : filteredAndSortedWorkflows.slice(0, 8);

  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2, mt: 1, px: 1 }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: { xs: 2, sm: 0 } }}
        >
          Workflows{' '}
          <Button
            color="inherit"
            onClick={() => setIsCreateFlowDialogOpen(true)}
          >
            Create Workflow
          </Button>
        </Typography>

        <CreateFlowDialog
          open={isCreateFlowDialogOpen}
          handleClose={() => setIsCreateFlowDialogOpen(false)}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'center' }}
        >
          <SearchField
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows..."
            variant="outlined"
            sx={{ minWidth: { sm: 200 } }}
          />
          {isDesktop && (
            <>
              <Divider
                orientation="vertical"
                flexItem
              />
              <FormControl
                size="small"
                variant="filled"
                sx={{ minWidth: { sm: 140 } }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterActive}
                  label="Status"
                  onChange={(e) => setFilterActive(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <FormControl
                size="small"
                variant="filled"
                sx={{ minWidth: { sm: 160 } }}
              >
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortOption}
                  label="Sort by"
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <MenuItem value="last_edited_newest">Last Modified</MenuItem>
                  <MenuItem value="alphabetical_asc">Alphabetical (A-Z)</MenuItem>
                  <MenuItem value="alphabetical_desc">Alphabetical (Z-A)</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </Stack>
      </Stack>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ mt: 2 }}
      >
        <Table
          sx={{ minWidth: 650 }}
          aria-label="workflows table"
        >
          <TableHead>
            <TableRow sx={{ '& th': { color: 'text.secondary', backgroundColor: 'action.hover' } }}>
              <TableCell>Name</TableCell>
              <TableCell>Connections</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>Status</TableCell>
              {/* <TableCell align="right">Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading || !initialized ? (
              [
                ...Array(
                  showAll
                    ? Math.min(filteredAndSortedWorkflows.length, 20)
                    : Math.min(filteredAndSortedWorkflows.length, 8) || 4,
                ),
              ].map((_, index) => <WorkflowRowSkeleton key={`skeleton-${index}`} />)
            ) : filteredAndSortedWorkflows?.length > 0 ? (
              visibleWorkflows.map((workflow) => (
                <WorkflowRow
                  key={workflow.id}
                  workflow={workflow}
                  onClick={() => handleClickWorkflow(workflow.id)}
                  onStatusChange={handleStatusChange} // Pass the handler here
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Iconify
                    icon="carbon:search"
                    width={60}
                    sx={{ color: 'text.disabled', mb: 2 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ color: 'text.secondary' }}
                  >
                    No workflows found
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.disabled' }}
                  >
                    Try adjusting your search or filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAndSortedWorkflows.length > 8 && !loading && initialized && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outlined"
          >
            {showAll ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      )}
      <TemplateMarketplace
        type="workflow"
        hideFilters
      />
    </Box>
  );
};

WorkflowsWidget.propTypes = {
  initialSearchQuery: PropTypes.string,
};

export default memo(WorkflowsWidget);
