import { Add as AddIcon } from '@mui/icons-material';
import { Box, Button, Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { listPlanGroups } from '@redux/slices/subscriptions';

import GroupDialog from './GroupDialog';
import GroupEditor from './GroupEditor';

const SubscriptionManager = () => {
  const dispatch = useDispatch();
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);

  const accountId = useSelector((state) => state.general.account.id);
  const { planGroups, initialized, isLoading } = useSelector((state) => state.subscriptions);

  useEffect(() => {
    if (accountId && !initialized && !isLoading) {
      dispatch(listPlanGroups(accountId));
    }
  }, [dispatch, accountId, initialized, isLoading]);

  useEffect(() => {
    if (planGroups.length > 0) {
      setCurrentGroup(planGroups[0]);
    }
  }, [planGroups]);

  const handleOpenGroupDialog = useCallback(() => {
    setIsGroupDialogOpen(true);
  }, []);

  const handleCloseGroupDialog = useCallback(() => {
    setIsGroupDialogOpen(false);
  }, []);

  const handleSelectGroup = useCallback((event, newValue) => {
    setCurrentGroup(newValue);
  }, []);

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', width: '100%', p: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{ gap: 2 }}
      >
        <Autocomplete
          options={planGroups}
          getOptionLabel={(option) => option.name}
          value={currentGroup}
          onChange={handleSelectGroup}
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select a Group"
              variant="outlined"
              sx={{ flexGrow: 1 }}
            />
          )}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenGroupDialog}
          sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Create New Group
        </Button>
      </Box>

      {currentGroup && (
        <GroupEditor
          groupId={currentGroup.id}
          isAltaner={false}
        />
      )}

      <GroupDialog
        open={isGroupDialogOpen}
        onClose={handleCloseGroupDialog}
        currentGroup={null}
      />
    </Box>
  );
};

export default SubscriptionManager;
