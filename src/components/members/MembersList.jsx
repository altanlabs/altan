import { useState, memo, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { cn } from '../../lib/utils.ts';
import { selectMembers, selectMe, patchMember } from '../../redux/slices/room';
import { dispatch } from '../../redux/store';
import DynamicAgentAvatar from '../agents/DynamicAgentAvatar';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import Iconify from '../iconify/Iconify.jsx';
import MemberInviteDialog from '../room/drawer/MemberInviteDialog.jsx';
import { getMemberDetails } from '../room/utils';
import { Button } from '../ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const membersList = Object.values(members?.byId || {}).filter(
    (member) => member && (!member.is_kicked || me?.role === 'admin'),
  );

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return membersList;
    }

    const query = searchQuery.toLowerCase();
    return membersList.filter((member) => {
      const memberDetails = getMemberDetails(member, me);
      return (
        memberDetails.name?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query) ||
        memberDetails.status?.toLowerCase().includes(query)
      );
    });
  }, [membersList, searchQuery, me]);

  const handleMemberMenuClick = (event, member) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedMember(member);
    setMenuOpen(true);
  };

  const handleCloseContextMenu = () => {
    setMenuOpen(false);
    setTimeout(() => {
      setContextMenu(null);
      setSelectedMember(null);
    }, 150);
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
    <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-2')}>
      {showTitle && (
        <div
          className={cn(
            'flex justify-between items-center',
            compact ? 'mb-1' : 'mb-2',
          )}
        >
          <h3
            className={cn(
              'font-semibold',
              compact ? 'text-sm' : 'text-base',
            )}
          >
            Members ({membersList.length})
          </h3>
          {showInviteButton && <MemberInviteDialog />}
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-2">
        <Iconify
          icon="solar:magnifer-linear"
          width={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <Input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {filteredMembers.length > 0 ? (
          <div className={cn('flex flex-col', compact ? 'gap-0.5' : 'gap-1')}>
            {filteredMembers.map((member) => {
              const memberDetails = getMemberDetails(member, me);

              return (
                <div
                  key={member.id}
                  className={cn(
                    'flex items-center rounded-lg transition-colors',
                    compact ? 'gap-1 p-0.5' : 'gap-2 p-1',
                    onMemberSelect
                      ? 'cursor-pointer hover:bg-accent'
                      : 'hover:bg-accent/50',
                  )}
                  onClick={() => handleMemberClick(member)}
                >
                  {member.member?.member_type === 'agent' && member.member?.agent ? (
                    <DynamicAgentAvatar
                      agent={member.member.agent}
                      size={compact ? 32 : 40}
                      agentId={member.member.agent_id}
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

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'font-medium truncate',
                        compact ? 'text-sm' : 'text-sm',
                      )}
                    >
                      {memberDetails.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'rounded-full',
                          compact ? 'w-1.5 h-1.5' : 'w-2 h-2',
                          memberDetails.status === 'online'
                            ? 'bg-green-500'
                            : 'bg-gray-400',
                        )}
                      />
                      <p
                        className={cn(
                          'text-muted-foreground',
                          compact ? 'text-xs' : 'text-xs',
                        )}
                      >
                        {memberDetails.status || 'offline'} • {memberDetails.role || 'member'}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu open={menuOpen && selectedMember?.id === member.id} onOpenChange={(open) => {
                    if (!open) handleCloseContextMenu();
                  }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'opacity-70 hover:opacity-100',
                        compact ? 'h-6 w-6' : 'h-8 w-8',
                      )}
                      onClick={(event) => handleMemberMenuClick(event, member)}
                    >
                      <Iconify
                        icon="eva:more-vertical-fill"
                        width={compact ? 16 : 20}
                      />
                    </Button>

                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      side="bottom"
                    >
                      {/* Member Info Header */}
                      {selectedMember && (
                        <>
                          <div className="px-2 py-2">
                            <p className="font-semibold text-sm">
                              {getMemberDetails(selectedMember, me).name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Current Role:{' '}
                              {selectedMember.role
                                ? selectedMember.role.charAt(0).toUpperCase() +
                                  selectedMember.role.slice(1)
                                : 'Member'}
                            </p>
                            {selectedMember.member?.member_type === 'agent' &&
                              selectedMember.agent_interaction && (
                                <p className="text-xs text-muted-foreground">
                                  Agent Mode:{' '}
                                  {selectedMember.agent_interaction === 'mention_only'
                                    ? 'Mention Only'
                                    : 'Always Respond'}
                                </p>
                              )}
                          </div>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {getMenuItems().map((item, index) => {
                        if (item.type === 'divider') {
                          return <DropdownMenuSeparator key={index} />;
                        }

                        if (item.type === 'submenu') {
                          return (
                            <DropdownMenuSub key={index}>
                              <DropdownMenuSubTrigger>
                                <Iconify
                                  icon={item.icon}
                                  width={16}
                                  className="mr-2"
                                />
                                <span>{item.label}</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {item.children.map((child, childIndex) => {
                                  const isCurrentRole = child.isCurrentRole || false;
                                  const isCurrentAgentMode =
                                    item.label === 'Agent Interaction' &&
                                    selectedMember?.agent_interaction ===
                                      child.actionData?.agent_interaction;

                                  return (
                                    <DropdownMenuItem
                                      key={childIndex}
                                      onClick={() =>
                                        handleMemberAction(child.action, child.actionData)
                                      }
                                      className={cn(
                                        isCurrentRole || isCurrentAgentMode
                                          ? 'bg-accent font-semibold'
                                          : '',
                                      )}
                                    >
                                      <span className="flex-1">{child.label}</span>
                                      {(isCurrentRole || isCurrentAgentMode) && (
                                        <Iconify
                                          icon="eva:checkmark-fill"
                                          width={16}
                                          className="text-primary"
                                        />
                                      )}
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          );
                        }

                        return (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => handleMemberAction(item.action, item.actionData)}
                            disabled={item.disabled}
                          >
                            <Iconify
                              icon={item.icon}
                              width={18}
                              className="mr-2"
                            />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No members match your search.' : emptyMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MembersList);
