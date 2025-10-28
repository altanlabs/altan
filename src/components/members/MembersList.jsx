import {
  Box,
  Typography,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { useState, memo } from 'react';
import { useSelector } from 'react-redux';

import { selectMembers, selectMe, patchMember } from '../../redux/slices/room';
import { dispatch } from '../../redux/store';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import Iconify from '../iconify/Iconify.jsx';
import MemberInviteDialog from '../room/drawer/MemberInviteDialog.jsx';
import { getMemberDetails } from '../room/utils';
import AgentOrbAvatar from '../agents/AgentOrbAvatar.jsx';

const MembersList = ({
  maxHeight = 400,
  showTitle = true,
  compact = false,
  showInviteButton = true,
  onMemberSelect,
  emptyMessage = 'No members to display.',
}) => {
  const members = useSelector(selectMembers);
  const me = useSelector(selectMe);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const membersList = Object.values(members?.byId || {}).filter(
    (member) => member && (!member.is_kicked || me?.role === 'admin'),
  );

  const handleMemberMenuClick = (event, member) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedMember(member);
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedMember(null);
  };

  const handleMemberAction = async (action, actionData = {}) => {
    if (!selectedMember) return;

    try {
      switch (action) {
        case 'kick':
        case 'readmit':
        case 'mute':
        case 'unmute':
        case 'vblock':
        case 'unvblock':
        case 'set_role':
        case 'agent_interaction':
          await dispatch(
            patchMember({
              action,
              body: { room_member_id: selectedMember.id, ...actionData },
            }),
          );
          break;
        case 'mention':
          // TODO: Implement mention functionality
          console.log('Mention member:', selectedMember);
          break;
        case 'block':
          // TODO: Implement block functionality
          console.log('Block member:', selectedMember);
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error performing member action:', error);
    }

    handleCloseContextMenu();
  };

  const getMenuItems = () => {
    if (!selectedMember || !me) return [];

    const role = me.role || 'viewer';
    const items = [];

    // Admin/Owner actions only
    if (['admin', 'owner'].includes(role)) {
      // Kick/Readmit - most important action
      if (selectedMember.role !== 'owner') {
        items.push({
          label: selectedMember.is_kicked ? 'Readmit Member' : 'Kick Member',
          icon: selectedMember.is_kicked ? 'mdi:account-plus' : 'mdi:account-minus',
          action: selectedMember.is_kicked ? 'readmit' : 'kick',
        });
      }

      // Role management (only show if member is not owner, or if I'm owner)
      if (selectedMember.role !== 'owner' || role === 'owner') {
        items.push({ type: 'divider' });

        const roleOptions = [
          { label: 'Admin', value: 'admin' },
          { label: 'Member', value: 'member' },
          { label: 'Listener', value: 'listener' },
          { label: 'Viewer', value: 'viewer' },
        ];

        if (role === 'owner' && selectedMember.role !== 'owner') {
          roleOptions.push({ label: 'Owner', value: 'owner' });
        }

        items.push({
          label: 'Change Role',
          icon: 'mdi:account-convert',
          type: 'submenu',
          children: roleOptions.map((r) => ({
            label: r.label,
            action: 'set_role',
            actionData: { role: r.value },
            isCurrentRole: r.value === selectedMember.role,
          })),
        });
      }

      // Agent interaction options
      if (selectedMember.member?.member_type === 'agent') {
        items.push({ type: 'divider' });
        items.push({
          label: 'Agent Interaction',
          icon: 'fluent:comment-multiple-mention-16-filled',
          type: 'submenu',
          children: [
            {
              label: 'Mention Only',
              action: 'agent_interaction',
              actionData: { agent_interaction: 'mention_only' },
              isCurrentRole: false,
            },
            {
              label: 'Always Respond',
              action: 'agent_interaction',
              actionData: { agent_interaction: 'always' },
              isCurrentRole: false,
            },
          ],
        });
      }
    }

    return items;
  };

  const handleMemberClick = (member) => {
    if (onMemberSelect) {
      onMemberSelect(member);
    }
  };

  return (
    <Stack spacing={compact ? 1 : 2}>
      {showTitle && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: compact ? 1 : 2,
          }}
        >
          <Typography
            variant={compact ? 'subtitle1' : 'h6'}
            sx={{ fontSize: compact ? '0.875rem' : '1rem', fontWeight: 600 }}
          >
            Members ({membersList.length})
          </Typography>
          {showInviteButton && <MemberInviteDialog />}
        </Box>
      )}

      <Box sx={{ maxHeight, overflow: 'auto' }}>
        {membersList.length > 0 ? (
          <Stack spacing={compact ? 0.25 : 0.5}>
            {membersList.map((member) => {
              const memberDetails = getMemberDetails(member, me);

              return (
                <Box
                  key={member.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: compact ? 0.5 : 1,
                    p: compact ? 0.25 : 0.5,
                    borderRadius: 1,
                    cursor: onMemberSelect ? 'pointer' : 'default',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleMemberClick(member)}
                >
                  {member.member?.member_type === 'agent' && !memberDetails.src ? (
                    <AgentOrbAvatar
                      size={compact ? 32 : 40}
                      agentId={member.member?.agent_id}
                      agentState={null}
                      isStatic={false}
                    />
                  ) : (
                    <CustomAvatar
                      src={memberDetails.src}
                      alt={memberDetails.name}
                      sx={{ width: compact ? 32 : 40, height: compact ? 32 : 40 }}
                    >
                      {memberDetails.name?.charAt(0)?.toUpperCase()}
                    </CustomAvatar>
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant={compact ? 'body2' : 'subtitle2'}
                      noWrap
                    >
                      {memberDetails.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: compact ? 6 : 8,
                          height: compact ? 6 : 8,
                          borderRadius: '50%',
                          bgcolor: memberDetails.status === 'online' ? 'success.main' : 'grey.400',
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: compact ? '0.75rem' : '0.875rem' }}
                      >
                        {memberDetails.status || 'offline'} • {memberDetails.role || 'member'}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(event) => handleMemberMenuClick(event, member)}
                    sx={{
                      opacity: 0.7,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Iconify
                      icon="eva:more-vertical-fill"
                      width={compact ? 16 : 20}
                    />
                  </IconButton>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            {emptyMessage}
          </Typography>
        )}
      </Box>

      {/* Custom Context Menu */}
      <Menu
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {/* Member Info Header */}
        {selectedMember && (
          <>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600 }}
              >
                {getMemberDetails(selectedMember, me).name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Current Role:{' '}
                {selectedMember.role
                  ? selectedMember.role.charAt(0).toUpperCase() + selectedMember.role.slice(1)
                  : 'Member'}
              </Typography>
              {selectedMember.member?.member_type === 'agent' &&
                selectedMember.agent_interaction && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    Agent Mode:{' '}
                    {selectedMember.agent_interaction === 'mention_only'
                      ? 'Mention Only'
                      : 'Always Respond'}
                  </Typography>
                )}
            </Box>
            <Divider />
          </>
        )}

        {getMenuItems().map((item, index) => {
          if (item.type === 'divider') {
            return <Divider key={index} />;
          }

          if (item.type === 'submenu') {
            // For now, we'll show submenu items as individual items
            // In a more complex implementation, you might want to use nested menus
            return item.children.map((child, childIndex) => {
              const isCurrentRole = child.isCurrentRole || false;
              const isCurrentAgentMode =
                item.label === 'Agent Interaction' &&
                selectedMember?.agent_interaction === child.actionData?.agent_interaction;

              return (
                <MenuItem
                  key={`${index}-${childIndex}`}
                  onClick={() => handleMemberAction(child.action, child.actionData)}
                  sx={{
                    pl: 4,
                    bgcolor: isCurrentRole || isCurrentAgentMode ? 'action.selected' : 'inherit',
                    '&:hover': {
                      bgcolor:
                        isCurrentRole || isCurrentAgentMode ? 'action.selected' : 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={child.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: {
                        fontWeight: isCurrentRole || isCurrentAgentMode ? 600 : 400,
                        color: isCurrentRole || isCurrentAgentMode ? 'primary.main' : 'inherit',
                      },
                    }}
                  />
                  {(isCurrentRole || isCurrentAgentMode) && (
                    <Iconify
                      icon="eva:checkmark-fill"
                      width={16}
                      sx={{ color: 'primary.main', ml: 1 }}
                    />
                  )}
                </MenuItem>
              );
            });
          }

          return (
            <MenuItem
              key={index}
              onClick={() => handleMemberAction(item.action, item.actionData)}
              disabled={item.disabled}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Iconify
                  icon={item.icon}
                  width={20}
                />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </Stack>
  );
};

export default memo(MembersList);
