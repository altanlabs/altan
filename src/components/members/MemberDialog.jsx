import { memo } from 'react';

import { cn } from '../../lib/utils.ts';
import { patchMember } from '../../redux/slices/room';
import { dispatch } from '../../redux/store';
import DynamicAgentAvatar from '../agents/DynamicAgentAvatar';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import Iconify from '../iconify/Iconify.jsx';
import { getMemberDetails } from '../room/utils';
import { Button } from '../ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';

const MemberDialog = ({ member, me, open, onOpenChange }) => {
  if (!member || !me) return null;

  const memberDetails = getMemberDetails(member, me);
  const role = me.role || 'viewer';
  const isAdmin = ['admin', 'owner'].includes(role);

  const handleMemberAction = async (action, actionData = {}) => {
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
              body: { room_member_id: member.id, ...actionData },
            }),
          );
          break;
        case 'mention':
          // TODO: Implement mention functionality
          console.log('Mention member:', member);
          break;
        case 'block':
          // TODO: Implement block functionality
          console.log('Block member:', member);
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error performing member action:', error);
    }
  };

  const roleOptions = [
    { label: 'Admin', value: 'admin', icon: 'mdi:shield-account' },
    { label: 'Member', value: 'member', icon: 'mdi:account' },
    { label: 'Listener', value: 'listener', icon: 'mdi:account-eye' },
    { label: 'Viewer', value: 'viewer', icon: 'mdi:account-outline' },
  ];

  if (role === 'owner' && member.role !== 'owner') {
    roleOptions.push({ label: 'Owner', value: 'owner', icon: 'mdi:crown' });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            View and manage member information and permissions
          </DialogDescription>
        </DialogHeader>

        {/* Member Info Section */}
        <div className="flex items-center gap-4 py-4">
          {member.member?.member_type === 'agent' && member.member?.agent ? (
            <DynamicAgentAvatar
              agent={member.member.agent}
              size={64}
              agentId={member.member.agent_id}
              agentState={null}
              isStatic={false}
            />
          ) : (
            <CustomAvatar
              src={memberDetails.src}
              alt={memberDetails.name}
              sx={{ width: 64, height: 64 }}
            >
              {memberDetails.name?.charAt(0)?.toUpperCase()}
            </CustomAvatar>
          )}

          <div className="flex-1">
            <h3 className="text-lg font-semibold">{memberDetails.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  memberDetails.status === 'online' ? 'bg-green-500' : 'bg-gray-400',
                )}
              />
              <p className="text-sm text-muted-foreground capitalize">
                {memberDetails.status || 'offline'}
              </p>
              <span className="text-muted-foreground">•</span>
              <p className="text-sm text-muted-foreground capitalize font-medium">
                {member.role || 'member'}
              </p>
            </div>
            {member.member?.member_type === 'agent' && member.agent_interaction && (
              <p className="text-xs text-muted-foreground mt-1">
                Agent Mode:{' '}
                {member.agent_interaction === 'mention_only' ? 'Mention Only' : 'Always Respond'}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions Section */}
        <div className="space-y-4">
          {isAdmin && (
            <>
              {/* Quick Actions */}
              {member.role !== 'owner' && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Quick Actions</h4>
                  <Button
                    variant={member.is_kicked ? 'default' : 'destructive'}
                    className="w-full"
                    onClick={() => handleMemberAction(member.is_kicked ? 'readmit' : 'kick')}
                  >
                    <Iconify
                      icon={member.is_kicked ? 'mdi:account-plus' : 'mdi:account-minus'}
                      width={18}
                      className="mr-2"
                    />
                    {member.is_kicked ? 'Readmit Member' : 'Kick Member'}
                  </Button>
                </div>
              )}

              <Separator />

              {/* Role Management */}
              {(member.role !== 'owner' || role === 'owner') && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Change Role</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {roleOptions.map((roleOption) => {
                      const isCurrentRole = roleOption.value === member.role;
                      return (
                        <Button
                          key={roleOption.value}
                          variant={isCurrentRole ? 'default' : 'outline'}
                          className={cn(
                            'justify-start',
                            isCurrentRole && 'pointer-events-none',
                          )}
                          onClick={() =>
                            handleMemberAction('set_role', { role: roleOption.value })
                          }
                        >
                          <Iconify icon={roleOption.icon} width={18} className="mr-2" />
                          {roleOption.label}
                          {isCurrentRole && (
                            <Iconify
                              icon="eva:checkmark-fill"
                              width={16}
                              className="ml-auto"
                            />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Agent Interaction Options */}
              {member.member?.member_type === 'agent' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Agent Interaction</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={
                          member.agent_interaction === 'mention_only' ? 'default' : 'outline'
                        }
                        className={cn(
                          'justify-start',
                          member.agent_interaction === 'mention_only' &&
                            'pointer-events-none',
                        )}
                        onClick={() =>
                          handleMemberAction('agent_interaction', {
                            agent_interaction: 'mention_only',
                          })
                        }
                      >
                        <Iconify
                          icon="fluent:comment-mention-16-filled"
                          width={18}
                          className="mr-2"
                        />
                        Mention Only
                        {member.agent_interaction === 'mention_only' && (
                          <Iconify
                            icon="eva:checkmark-fill"
                            width={16}
                            className="ml-auto"
                          />
                        )}
                      </Button>
                      <Button
                        variant={
                          member.agent_interaction === 'always' ? 'default' : 'outline'
                        }
                        className={cn(
                          'justify-start',
                          member.agent_interaction === 'always' && 'pointer-events-none',
                        )}
                        onClick={() =>
                          handleMemberAction('agent_interaction', {
                            agent_interaction: 'always',
                          })
                        }
                      >
                        <Iconify
                          icon="fluent:chat-24-filled"
                          width={18}
                          className="mr-2"
                        />
                        Always Respond
                        {member.agent_interaction === 'always' && (
                          <Iconify
                            icon="eva:checkmark-fill"
                            width={16}
                            className="ml-auto"
                          />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {!isAdmin && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                You don't have permission to manage this member.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(MemberDialog);

