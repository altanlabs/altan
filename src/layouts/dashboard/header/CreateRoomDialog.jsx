import { useTheme } from '@mui/material/styles';
import React, { memo, useState, useEffect, useCallback } from 'react';

import RoomAdvancedSection from './room-dialog/RoomAdvancedSection';
import RoomAvatarSection from './room-dialog/RoomAvatarSection';
import RoomDialogFooter from './room-dialog/RoomDialogFooter';
import RoomDialogHeader from './room-dialog/RoomDialogHeader';
import RoomFeaturesSection from './room-dialog/RoomFeaturesSection';
import RoomParticipantsSection from './room-dialog/RoomParticipantsSection';
import RoomPrivacySection from './room-dialog/RoomPrivacySection';
import RoomSettingsSection from './room-dialog/RoomSettingsSection';
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
import { uploadMedia } from '../../../utils/media';

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
    description: '',
    avatar_url: '',
    external_id: '',
    users: [],
    agents: [],
    policy: {
      privacy: 'account',
      default_role: 'member',
      agent_interaction: 'always',
      agent_timeout: null,
      max_members: null,
      memory_enabled: true,
      cagi_enabled: false,
      voice_enabled: false,
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
        description: roomData.description || '',
        avatar_url: roomData.avatar_url || '',
        external_id: roomData.external_id || '',
        users: mappedUsers,
        agents: mappedAgents,
        policy: {
          privacy: roomData.policy?.privacy || 'account',
          default_role: roomData.policy?.default_role || 'member',
          agent_interaction: roomData.policy?.agent_interaction || 'always',
          agent_timeout: roomData.policy?.agent_timeout || null,
          max_members: roomData.policy?.max_members || null,
          memory_enabled: roomData.policy?.memory_enabled ?? true,
          cagi_enabled: roomData.policy?.cagi_enabled ?? false,
          voice_enabled: roomData.policy?.voice_enabled ?? false,
        },
      });
    } else if (!editMode) {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        avatar_url: '',
        external_id: '',
        users: [],
        agents: [],
        policy: {
          privacy: 'account',
          default_role: 'member',
          agent_interaction: 'always',
          agent_timeout: null,
          max_members: null,
          memory_enabled: true,
          cagi_enabled: false,
          voice_enabled: false,
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

      // Reset form only if creating
      if (!editMode) {
        setFormData({
          name: '',
          description: '',
          avatar_url: '',
          external_id: '',
          users: [],
          agents: [],
          policy: {
            privacy: 'account',
            default_role: 'member',
            agent_interaction: 'always',
            agent_timeout: null,
            max_members: null,
            memory_enabled: true,
            cagi_enabled: false,
            voice_enabled: false,
          },
        });
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      // Error handling
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleDropSingleFile = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        try {
          const mediaUrl = await uploadMedia(file);
          setFormData((prev) => ({ ...prev, avatar_url: mediaUrl }));
        } catch {
          // Handle error silently
        }
      }
    },
    [],
  );

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      showCloseButton={false}
      maxWidth="lg"
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '16px',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          height: '90vh',
          maxHeight: '900px',
          position: 'relative',
          overflow: 'hidden',
        },
      }}
    >
      <form onSubmit={handleSubmit} className="h-full flex flex-col relative">
        {/* Absolute Header */}
        <RoomDialogHeader
          editMode={editMode}
          onClose={handleClose}
          isSubmitting={isSubmitting}
        />

        {/* Scrollable Content with custom scrollbar */}
        <div
          className="flex-1 overflow-y-auto pt-[140px] pb-[120px] px-12 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent hover:scrollbar-thumb-violet-500/40"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(139, 92, 246, 0.2) transparent',
          }}
        >
          <div className="flex flex-col gap-10 max-w-4xl mx-auto">
            {/* Avatar and Name */}
            <RoomAvatarSection
              formData={formData}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
              onAvatarDrop={handleDropSingleFile}
            />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

            {/* Privacy */}
            <RoomPrivacySection
              formData={formData}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
            />

            {/* Settings Row */}
            <RoomSettingsSection
              formData={formData}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
            />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

            {/* Participants */}
            <RoomParticipantsSection
              formData={formData}
              isSubmitting={isSubmitting}
              availableMembers={availableMembers}
              availableAgents={availableAgents}
              membersLoading={membersLoading}
              agentsLoading={agentsLoading}
              setFormData={setFormData}
            />

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />

            {/* Features */}
            <RoomFeaturesSection
              formData={formData}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
            />

            {/* Advanced Settings */}
            <RoomAdvancedSection
              formData={formData}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
            />
          </div>
        </div>

        {/* Absolute Footer */}
        <RoomDialogFooter
          editMode={editMode}
          isSubmitting={isSubmitting}
          formData={formData}
          onClose={handleClose}
        />
      </form>
    </CustomDialog>
  );
};

export default memo(CreateRoomDialog);
