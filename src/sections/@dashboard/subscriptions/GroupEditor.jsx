import { Edit as EditIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Box, Typography, Card, CardContent, IconButton, Tooltip, Button } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AltanerPlanDialog from './AltanerPlanDialog';
import GroupDialog from './GroupDialog';
import PlanDialog from './PlanDialog';
import DeleteDialog from '../../../components/dialogs/DeleteDialog';
import Iconify from '../../../components/iconify';
import { deleteAccountResource } from '../../../redux/slices/general';
import { deletePlan, deletePlanGroup } from '../../../redux/slices/subscriptions';

const GroupEditor = ({ groupId, isAltaner = false }) => {
  const dispatch = useDispatch();
  const { planGroups } = useSelector((state) => state.subscriptions);
  console.log('planGroups', planGroups);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  useEffect(() => {
    const group = planGroups.find((g) => g.id === groupId);
    setCurrentGroup(group);
  }, [groupId, planGroups]);

  const handleDeleteClick = useCallback((resourceType, resourceId, resourceName) => {
    setResourceToDelete({ type: resourceType, id: resourceId, name: resourceName });
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (resourceToDelete) {
      console.log('deleting', resourceToDelete);
      const reducers = {
        'subscription-plan': deletePlan,
        'subscription-plan-group': deletePlanGroup,
      };
      dispatch(
        deleteAccountResource(
          resourceToDelete.type,
          resourceToDelete.id,
          reducers[resourceToDelete.type],
        ),
      );
    }
    setDeleteDialogOpen(false);
    setResourceToDelete(null);
  }, [dispatch, resourceToDelete]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setResourceToDelete(null);
  }, []);

  const handleOpenGroupDialog = useCallback(() => {
    setIsGroupDialogOpen(true);
  }, []);

  const handleCloseGroupDialog = useCallback(() => {
    setIsGroupDialogOpen(false);
  }, []);

  const handleOpenPlanDialog = useCallback((plan = null) => {
    setSelectedPlan(plan);
    setIsPlanDialogOpen(true);
  }, []);

  const handleClosePlanDialog = useCallback(() => {
    setIsPlanDialogOpen(false);
    setSelectedPlan(null);
  }, []);

  const formatPrice = (priceInCents) => {
    return priceInCents != null ? `$${(priceInCents / 100).toFixed(2)}` : 'N/A';
  };

  if (!currentGroup) return null;

  const plans = currentGroup.plans?.items || [];

  return (
    <Card
      key={currentGroup.id}
      variant="outlined"
      sx={{ p: 2, width: '100%' }}
    >
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">{currentGroup.name}</Typography>
          <Box>
            <IconButton
              onClick={() =>
                window.open(`https://app.altan.ai/subscription?ids=${currentGroup.id}`, '_blank')}
            >
              <Iconify icon="carbon:view-filled" />
            </IconButton>
            <Tooltip title="Copy Group ID">
              <IconButton onClick={() => navigator.clipboard.writeText(currentGroup.id)}>
                <Iconify icon="carbon:copy" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleOpenGroupDialog}>
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() =>
                handleDeleteClick('subscription-plan-group', currentGroup.id, currentGroup.name)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
        >
          {currentGroup.description}
        </Typography>
        <Box mt={2}>
          <Typography variant="h6">Plans:</Typography>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={2}
            mt={1}
          >
            {plans.map((plan) => (
              <Card
                key={plan.id}
                sx={{ width: 300 }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">{plan.name || 'Unnamed Plan'}</Typography>
                    <Box>
                      <IconButton onClick={() => handleOpenPlanDialog(plan)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick('subscription-plan', plan.id, plan.name)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                  >
                    {plan.description || 'No description'}
                  </Typography>
                  <Box
                    mt={1}
                    mx={2}
                  >
                    <Typography variant="subtitle2">Features:</Typography>
                    <ul>
                      {Array.isArray(plan.meta_data?.features) &&
                      plan.meta_data.features.length > 0 ? (
                            plan.meta_data.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))
                          ) : (
                            <li>No features specified</li>
                          )}
                    </ul>
                  </Box>
                  <Box
                    mt={2}
                    mx={2}
                  >
                    <Typography variant="subtitle2">Billing Options:</Typography>
                    <ul>
                      {Array.isArray(plan.billing_options?.items) &&
                      plan.billing_options.items.length > 0 ? (
                            plan.billing_options.items.map((option, index) => (
                          <li key={index}>
                            {`Price: ${formatPrice(option.price)}, Currency: ${option.currency}, Frequency: ${option.billing_frequency || 'N/A'}, Cycle: ${option.billing_cycle || 'N/A'}`}
                          </li>
                        ))
                          ) : (
                            <li>No billing options specified</li>
                          )}
                    </ul>
                  </Box>
                </CardContent>
              </Card>
            ))}
            <Card
              sx={{ width: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Button
                variant="soft"
                startIcon={<AddIcon />}
                onClick={() => handleOpenPlanDialog(null)}
                sx={{ width: '100%', height: '100%' }}
              >
                Add Plan
              </Button>
            </Card>
          </Box>
        </Box>
      </CardContent>

      <GroupDialog
        open={isGroupDialogOpen}
        onClose={handleCloseGroupDialog}
        currentGroup={currentGroup}
      />

      {isAltaner ? (
        <AltanerPlanDialog
          open={isPlanDialogOpen}
          onClose={handleClosePlanDialog}
          currentPlan={selectedPlan}
          groupId={groupId}
        />
      ) : (
        <PlanDialog
          open={isPlanDialogOpen}
          onClose={handleClosePlanDialog}
          currentPlan={selectedPlan}
          groupId={groupId}
        />
      )}

      <DeleteDialog
        openDeleteDialog={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        confirmDelete={handleConfirmDelete}
        message={`Are you sure you want to delete ${resourceToDelete?.name}? This action can't be undone.`}
        confirmationText={resourceToDelete?.name}
      />
    </Card>
  );
};

export default GroupEditor;
