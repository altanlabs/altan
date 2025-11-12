import { memo } from 'react';

import { useToast } from '../../hooks/use-toast.ts';
import { cn } from '../../lib/utils.ts';
import { patchMember } from '../../redux/slices/room';
import { dispatch } from '../../redux/store';
import DynamicAgentAvatar from '../agents/DynamicAgentAvatar';
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import Iconify from '../iconify/Iconify.jsx';
import { getMemberDetails } from '../room/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion.tsx';
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
  const { toast } = useToast();
  const memberDetails = member && me ? getMemberDetails(member, me) : null;
  const role = me?.role || 'viewer';
  const isAdmin = ['admin', 'owner'].includes(role);

  const handleMemberAction = async (action, actionData = {}) => {
    if (!member) return;
    
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

  if (role === 'owner' && member?.role !== 'owner') {
    roleOptions.push({ label: 'Owner', value: 'owner', icon: 'mdi:crown' });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!member || !me || !memberDetails ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Loading member details...</p>
          </div>
        ) : (
          <>
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

        <Separator />

        {/* Member IDs Section - Collapsible */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="member-ids" className="border-0">
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <Iconify icon="solar:info-circle-linear" width={18} className="text-muted-foreground" />
                <span className="text-sm font-semibold">Technical Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              {/* Room Member ID */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Room Member ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md font-mono truncate">
                    {member.id}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(member.id);
                      toast({
                        title: 'Copied!',
                        description: 'Room Member ID copied to clipboard',
                      });
                    }}
                  >
                    <Iconify icon="solar:copy-linear" width={16} />
                  </Button>
                </div>
              </div>

              {/* Member ID */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Member ID</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md font-mono truncate">
                    {member.member_id}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(member.member_id);
                      toast({
                        title: 'Copied!',
                        description: 'Member ID copied to clipboard',
                      });
                    }}
                  >
                    <Iconify icon="solar:copy-linear" width={16} />
                  </Button>
                </div>
              </div>

              {/* Agent ID or User ID */}
              {member.member?.member_type === 'agent' && member.member?.agent_id && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Agent ID</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md font-mono truncate">
                      {member.member.agent_id}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(member.member.agent_id);
                        toast({
                          title: 'Copied!',
                          description: 'Agent ID copied to clipboard',
                        });
                      }}
                    >
                      <Iconify icon="solar:copy-linear" width={16} />
                    </Button>
                  </div>
                </div>
              )}

              {member.member?.member_type === 'user' && member.member?.user_id && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">User ID</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md font-mono truncate">
                      {member.member.user_id}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(member.member.user_id);
                        toast({
                          title: 'Copied!',
                          description: 'User ID copied to clipboard',
                        });
                      }}
                    >
                      <Iconify icon="solar:copy-linear" width={16} />
                    </Button>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(MemberDialog);

