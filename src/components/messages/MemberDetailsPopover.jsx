import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Popover,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import { memo } from 'react';
import { useSelector } from 'react-redux';

import { selectMe, patchMember } from '../../redux/slices/room';
import { dispatch } from '../../redux/store';
import { formatDate } from '../../utils/dateUtils.js';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import Iconify from '../iconify/Iconify.jsx';

const DetailRow = ({ label, value, copyable = false }) => (
  <Box sx={{ display: 'flex', mb: 0.5 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ minWidth: 100, fontWeight: 500 }}
    >
      {label}:
    </Typography>
    {copyable ? (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          variant="caption"
          sx={{ fontFamily: 'monospace' }}
        >
          {value || 'N/A'}
        </Typography>
      </Box>
    ) : (
      <Typography
        variant="caption"
        sx={{ wordBreak: 'break-word' }}
      >
        {value || 'N/A'}
      </Typography>
    )}
  </Box>
);

const MemberDetailsPopover = ({ isOpen, anchorEl, onClose, member, memberName, picture }) => {
  const me = useSelector(selectMe);

  if (!member) return null;

  const isAgent = member.member?.member_type === 'agent' || member.member_type === 'agent';
  const memberType = member.member?.member_type || member.member_type || 'member';

  // Fix: Default to mention_only when undefined
  const agentInteraction = member?.agent_interaction || 'mention_only';

  const handleEditAgent = () => {
    if (isAgent && (member.member?.agent?.id || member.agent?.id)) {
      const agentId = member.member?.agent?.id || member.agent?.id;
      window.open(`/agent/${agentId}`, '_blank');
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!member?.id) {
      console.error('No member ID available for role change');
      return;
    }
    try {
      await dispatch(
        patchMember({
          action: 'set_role',
          body: { room_member_id: member.id, role: newRole },
        }),
      );
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleAgentInteractionChange = async (newInteraction) => {
    if (!member?.id) {
      console.error('No member ID available for agent interaction change');
      return;
    }
    try {
      await dispatch(
        patchMember({
          action: 'agent_interaction',
          body: { room_member_id: member.id, agent_interaction: newInteraction },
        }),
      );
    } catch (error) {
      console.error('Error changing agent interaction:', error);
    }
  };

  const handleMemberAction = async (action, actionData = {}) => {
    if (!member?.id) {
      console.error('No member ID available for member action');
      return;
    }
    try {
      switch (action) {
        case 'kick':
        case 'readmit':
        case 'mute':
        case 'unmute':
        case 'vblock':
        case 'unvblock':
          await dispatch(
            patchMember({
              action,
              body: { room_member_id: member.id, ...actionData },
            }),
          );
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error performing member action:', error);
    }
  };

  const canShowSettings = me && ['admin', 'owner'].includes(me.role || 'viewer');
  const canManageRoles = canShowSettings && (member?.role !== 'owner' || (me && me.role === 'owner'));
  const canManageAgentInteraction = canShowSettings && isAgent;

  const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
    { label: 'Listener', value: 'listener' },
    { label: 'Viewer', value: 'viewer' },
  ];

  if (me && me.role === 'owner' && member?.role !== 'owner') {
    roleOptions.push({ label: 'Owner', value: 'owner' });
  }

  const agentInteractionOptions = [
    { label: 'Mention Only', value: 'mention_only' },
    { label: 'Always Respond', value: 'always' },
  ];

  // Safely get values with fallbacks
  const memberId = member?.id || 'Unknown';
  const memberRole = member?.role || 'member';
  const dateCreation = member?.date_creation || null;
  const agentDescription = member?.member?.agent?.description || member?.agent?.description || '';

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: {
            maxWidth: 320,
            maxHeight: 500,
            overflow: 'auto',
          },
        },
      }}
    >
      <Box sx={{ p: 2, maxWidth: 320 }}>
        <Stack spacing={1.5}>
          {/* Header with avatar and name */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <CustomAvatar
              sx={{ width: 48, height: 48 }}
              variant="circular"
              src={picture}
              name={memberName || 'Unknown User'}
            />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight="medium"
              >
                {memberName || 'Unknown User'}
              </Typography>
              {agentDescription && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {agentDescription}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Action Buttons and Controls */}
          <Stack
            spacing={1}
            sx={{ mt: 1 }}
          >
            {/* Edit Agent Button (only for agents) */}
            {isAgent && (
              <Button
                variant="outlined"
                size="small"
                startIcon={
                  <Iconify
                    icon="eva:edit-fill"
                    width={16}
                  />
                }
                onClick={handleEditAgent}
                fullWidth
              >
                Edit Agent
              </Button>
            )}

            {/* Kick/Readmit Button */}
            {canShowSettings && (
              <Button
                variant="outlined"
                size="small"
                color={member?.is_kicked ? 'success' : 'error'}
                startIcon={
                  <Iconify
                    icon={member?.is_kicked ? 'mdi:account-plus' : 'mdi:account-minus'}
                    width={16}
                  />
                }
                onClick={() => handleMemberAction(member?.is_kicked ? 'readmit' : 'kick')}
                fullWidth
              >
                {member?.is_kicked ? 'Readmit Member' : 'Kick Member'}
              </Button>
            )}

            {/* Role Select Dropdown */}
            {canManageRoles && (
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>Role</InputLabel>
                <Select
                  value={memberRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  label="Role"
                  startAdornment={
                    <Iconify
                      icon="mdi:account-star"
                      width={16}
                      sx={{ mr: 1 }}
                    />
                  }
                >
                  {roleOptions.map((role) => (
                    <MenuItem
                      key={role.value}
                      value={role.value}
                    >
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Agent Interaction Select Dropdown */}
            {canManageAgentInteraction && (
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>Agent Mode</InputLabel>
                <Select
                  value={agentInteraction}
                  onChange={(e) => handleAgentInteractionChange(e.target.value)}
                  label="Agent Mode"
                  startAdornment={
                    <Iconify
                      icon="fluent:comment-multiple-mention-16-filled"
                      width={16}
                      sx={{ mr: 1 }}
                    />
                  }
                >
                  {agentInteractionOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>

          <Divider />

          {/* Member details */}
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontSize: '0.65rem', fontWeight: 600 }}
            >
              MEMBER DETAILS
            </Typography>
            <Box sx={{ mt: 0.5, pl: 1 }}>
              <DetailRow
                label="Member ID"
                value={memberId}
                copyable
              />
              <DetailRow
                label="Created"
                value={formatDate(dateCreation)}
              />
              <DetailRow
                label="Type"
                value={memberType}
              />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Popover>
  );
};

export default memo(MemberDetailsPopover);
