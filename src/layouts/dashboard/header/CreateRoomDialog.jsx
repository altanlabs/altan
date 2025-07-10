import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  CircularProgress,
  Avatar,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { memo, useState, useEffect } from 'react';

import CustomDialog from '../../../components/dialogs/CustomDialog';
import {
  selectAccountId,
  selectAccount,
  getAccountAttribute,
  getAccountMembers,
  selectAccountAssetsLoading,
  selectAccountAssetsInitialized,
} from '../../../redux/slices/general';
import { createRoom, updateRoom } from '../../../redux/slices/room';
import { useSelector, dispatch } from '../../../redux/store';

const CreateRoomDialog = ({ open, onClose, onSuccess, editMode = false, roomData = null }) => {
  const theme = useTheme();
  const accountId = useSelector(selectAccountId);
  const account = useSelector(selectAccount);
  const agentsLoading = useSelector(selectAccountAssetsLoading('agents'));
  const membersLoading = useSelector(selectAccountAssetsLoading('members'));
  const agentsInitialized = useSelector(selectAccountAssetsInitialized('agents'));
  const membersInitialized = useSelector(selectAccountAssetsInitialized('members'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    users: [],
    agents: [],
    policy: {
      privacy: 'account',
      default_role: 'member',
      agent_interaction: 'always',
      memory_enabled: true,
      cagi_enabled: false,
    },
  });

  // Load agents and members when dialog opens
  useEffect(() => {
    if (open && !agentsInitialized && !agentsLoading) {
      dispatch(getAccountAttribute(accountId, ['agents']));
    }
    if (open && !membersInitialized && !membersLoading) {
      dispatch(getAccountMembers(accountId));
    }
  }, [open, accountId, agentsInitialized, agentsLoading, membersInitialized, membersLoading]);

  // Pre-populate form when editing
  useEffect(() => {
    if (editMode && roomData && open) {
      const selectedUsers = roomData.users || [];
      const selectedAgents = roomData.agents || [];

      // Map users to match the format expected by the form
      const mappedUsers = selectedUsers.map(user => ({
        user: user,
        id: user.id,
      }));

      // Map agents to match the format expected by the form
      const mappedAgents = selectedAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        avatar_url: agent.avatar_url,
      }));

      setFormData({
        name: roomData.name || '',
        users: mappedUsers,
        agents: mappedAgents,
        policy: {
          privacy: roomData.policy?.privacy || 'account',
          default_role: roomData.policy?.default_role || 'member',
          agent_interaction: roomData.policy?.agent_interaction || 'always',
          memory_enabled: roomData.policy?.memory_enabled ?? true,
          cagi_enabled: roomData.policy?.cagi_enabled ?? false,
        },
      });
    } else if (!editMode) {
      // Reset form for create mode
      setFormData({
        name: '',
        users: [],
        agents: [],
        policy: {
          privacy: 'account',
          default_role: 'member',
          agent_interaction: 'always',
          memory_enabled: true,
          cagi_enabled: false,
        },
      });
    }
  }, [editMode, roomData, open]);

  const availableAgents = account?.agents || [];

  // Filter out duplicates and current user from members
  const availableMembers = React.useMemo(() => {
    if (!account?.members) return [];

    const members = account.members;

    // Create a Set to track unique user IDs and filter out duplicates
    const seenUserIds = new Set();
    const filteredMembers = [];

    for (const member of members) {
      const userId = member.user?.id;
      if (userId && !seenUserIds.has(userId)) {
        seenUserIds.add(userId);
        filteredMembers.push(member);
      }
    }

    return filteredMembers;
  }, [account?.members]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const roomDataPayload = {
        ...formData,
        account_id: accountId,
        users: formData.users.map(member => member.user.id),
        agents: formData.agents.map(agent => agent.id),
      };

      let result;
      if (editMode && roomData) {
        // Update existing room
        result = await dispatch(updateRoom(roomDataPayload));
      } else {
        // Create new room
        result = await dispatch(createRoom(roomDataPayload));
      }

      console.log(`Room ${editMode ? 'updated' : 'created'}:`, result);

      // Reset form only if creating
      if (!editMode) {
        setFormData({
          name: '',
          description: '',
          avatar_url: '',
          users: [],
          agents: [],
          policy: {
            privacy: 'account',
            default_role: 'member',
            agent_interaction: 'always',
            memory_enabled: true,
            cagi_enabled: false,
          },
        });
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} room:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle>{editMode ? 'Edit Room' : 'Create New Room'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Room Name"
              value={formData.name}
              variant="filled"
              onChange={handleInputChange('name')}
              required
              fullWidth
              disabled={isSubmitting}
            />
            <Autocomplete
              fullWidth
              disabled={isSubmitting}
              disablePortal={false}
              sx={{
                '& .MuiPopper-root': {
                  width: '100% !important',
                },
                '& .MuiAutocomplete-listbox': {
                  width: '100%',
                },
              }}
              options={[
                { value: 'account', label: 'Account' },
                { value: 'public', label: 'Public' },
                { value: 'private', label: 'Private' },
              ]}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value?.value}
              value={
                formData.policy.privacy
                  ? { value: formData.policy.privacy, label: formData.policy.privacy.charAt(0).toUpperCase() + formData.policy.privacy.slice(1) }
                  : null
              }
              onChange={(event, newValue) => {
                handleInputChange('policy.privacy')({
                  target: { value: newValue ? newValue.value : '' },
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Privacy"
                  variant="filled"
                />
              )}
              PopperProps={{
                style: {
                  zIndex: 99999,
                },
                placement: 'bottom-start',
              }}
              slotProps={{
                popper: {
                  style: {
                    zIndex: 99999,
                  },
                },
              }}
              ListboxProps={{
                style: {
                  maxHeight: '200px',
                },
              }}
            />

            <Autocomplete
              multiple
              fullWidth
              disabled={isSubmitting}
              options={availableMembers}
              getOptionLabel={(option) => `${option.user.first_name} ${option.user.last_name}` || `${option.user.email}`}
              isOptionEqualToValue={(option, value) => option.user.id === value.user.id}
              value={formData.users}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  users: newValue,
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Invite Members"
                  variant="filled"
                  placeholder="Select members to invite"
                />
              )}
              loading={membersLoading}
              loadingText="Loading members..."
              noOptionsText="No members available"
              renderOption={(props, option) => (
                <li {...props}>
                  <Avatar sx={{ mr: 2 }} src={option.user.avatar_url}>
                    {option.user.first_name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{`${option.user.first_name} ${option.user.last_name}`}</Typography>
                    <Typography variant="body2" color="text.secondary">{option.user.email}</Typography>
                  </Box>
                </li>
              )}
            />

            <Autocomplete
              multiple
              fullWidth
              disabled={isSubmitting}
              options={availableAgents}
              getOptionLabel={(option) => option.name || `Agent ${option.id}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={formData.agents}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  agents: newValue,
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Invite Agents"
                  variant="filled"
                  placeholder="Select agents to invite"
                />
              )}
              loading={agentsLoading}
              loadingText="Loading agents..."
              noOptionsText="No agents available"
              renderOption={(props, option) => (
                <li {...props}>
                  <Avatar sx={{ mr: 2 }} src={option.avatar_url}>
                    {option.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{option.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{`Agent ${option.id}`}</Typography>
                  </Box>
                </li>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !formData.name.trim()}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isSubmitting ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Room' : 'Create Room')}
          </Button>
        </DialogActions>
      </form>
    </CustomDialog>
  );
};

export default memo(CreateRoomDialog);
