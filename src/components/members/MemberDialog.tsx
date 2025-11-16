/* eslint-disable react/prop-types */
import { Copy, Check } from 'lucide-react';
import { memo, useState } from 'react';

import { useToast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import { patchMember } from '../../redux/slices/room/thunks';
import { dispatch } from '../../redux/store';
// @ts-expect-error - no type definitions available
import DynamicAgentAvatar from '../agents/DynamicAgentAvatar';
// @ts-expect-error - no type definitions available
import CustomAvatar from '../custom-avatar/CustomAvatar';
// @ts-expect-error - no type definitions available
import Iconify from '../iconify/Iconify';
// @ts-expect-error - no type definitions available
import { getMemberDetails } from '../new-room/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';

// ============================================================================
// Types
// ============================================================================

interface Member {
  id: string;
  member_id: string;
  role?: 'owner' | 'admin' | 'member' | 'listener' | 'viewer';
  is_kicked?: boolean;
  agent_interaction?: 'mention_only' | 'always';
  member?: {
    member_type?: 'agent' | 'user';
    agent_id?: string;
    user_id?: string;
    agent?: {
      id: string;
      account_id?: string;
      name?: string;
      avatar_url?: string;
      meta_data?: {
        avatar_orb?: {
          colors?: string[];
        };
      };
    };
  };
}

interface Me {
  role?: 'owner' | 'admin' | 'member' | 'listener' | 'viewer';
}

interface MemberDialogProps {
  member: Member | null;
  me: Me | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RoleOption {
  label: string;
  value: string;
  icon: string;
}

interface CopyableIdFieldProps {
  label: string;
  value: string;
  onCopy: (value: string, label: string) => void;
}

interface ToggleButtonGroupProps {
  options: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
  currentValue: string;
  onSelect: (value: string) => void;
  columns?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

const truncateId = (id: string): string => {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
};

// ============================================================================
// Reusable Components (Single Responsibility Principle)
// ============================================================================

const CopyableIdField = memo<CopyableIdFieldProps>(({ label, value, onCopy }: CopyableIdFieldProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy(value, label);
    });
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-900 px-3 py-2 rounded-md font-mono border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
          {truncateId(value)}
        </code>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 h-8 w-8 p-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
});

CopyableIdField.displayName = 'CopyableIdField';

const ToggleButtonGroup = memo<ToggleButtonGroupProps>(({
  options,
  currentValue,
  onSelect,
  columns = 2,
}) => (
  <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {options.map((option) => {
      const isSelected = option.value === currentValue;
      return (
        <Button
          key={option.value}
          variant={isSelected ? 'default' : 'outline'}
          className={cn(
            'justify-start h-10 text-sm',
            isSelected && 'pointer-events-none',
          )}
          onClick={() => onSelect(option.value)}
        >
          <Iconify icon={option.icon} width={18} className="mr-2" />
          {option.label}
          {isSelected && (
            <Check className="h-4 w-4 ml-auto" />
          )}
        </Button>
      );
    })}
  </div>
));

ToggleButtonGroup.displayName = 'ToggleButtonGroup';

// ============================================================================
// Business Logic Hook (Dependency Inversion Principle)
// ============================================================================

const useMemberActions = (member: Member | null): {
  handleMemberAction: (action: string, actionData?: object) => Promise<void>;
  handleRoleChange: (newRole: string) => void;
  handleAgentInteractionChange: (newInteraction: string) => void;
  handleKickToggle: () => void;
} => {
  const handleMemberAction = async (action: string, actionData = {}): Promise<void> => {
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
        default:
          // eslint-disable-next-line no-console
          console.log('Unknown action:', action);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error performing member action:', error);
    }
  };

  const handleRoleChange = (newRole: string): void => {
    void handleMemberAction('set_role', { role: newRole });
  };

  const handleAgentInteractionChange = (newInteraction: string): void => {
    void handleMemberAction('agent_interaction', { agent_interaction: newInteraction });
  };

  const handleKickToggle = (): void => {
    void handleMemberAction(member?.is_kicked ? 'readmit' : 'kick');
  };

  return {
    handleMemberAction,
    handleRoleChange,
    handleAgentInteractionChange,
    handleKickToggle,
  };
};

// ============================================================================
// Configuration (Open-Closed Principle)
// ============================================================================

const getRoleOptions = (isOwner: boolean, memberIsOwner: boolean): RoleOption[] => {
  const baseOptions: RoleOption[] = [
    { label: 'Admin', value: 'admin', icon: 'mdi:shield-account' },
    { label: 'Member', value: 'member', icon: 'mdi:account' },
    { label: 'Listener', value: 'listener', icon: 'mdi:account-eye' },
    { label: 'Viewer', value: 'viewer', icon: 'mdi:account-outline' },
  ];

  if (isOwner && !memberIsOwner) {
    baseOptions.push({ label: 'Owner', value: 'owner', icon: 'mdi:crown' });
  }

  return baseOptions;
};

const AGENT_INTERACTION_OPTIONS = [
  { label: 'Mention Only', value: 'mention_only', icon: 'fluent:comment-mention-16-filled' },
  { label: 'Always Respond', value: 'always', icon: 'fluent:chat-24-filled' },
];

// ============================================================================
// Main Component
// ============================================================================

const MemberDialog = memo<MemberDialogProps>(({ member, me, open, onOpenChange }) => {
  const { toast } = useToast();
  const memberDetails = member && me ? getMemberDetails(member, me) : null;
  const role = me?.role || 'viewer';
  const isAdmin = ['admin', 'owner'].includes(role);
  const isAgent = member?.member?.member_type === 'agent';

  const {
    handleRoleChange,
    handleAgentInteractionChange,
    handleKickToggle,
  } = useMemberActions(member);

  const roleOptions = getRoleOptions(role === 'owner', member?.role === 'owner');

  const handleCopy = (_value: string, label: string): void => {
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  // Collect all IDs for the technical information section
  const technicalIds = member ? [
    { label: 'Room Member ID', value: member.id },
    { label: 'Member ID', value: member.member_id },
    ...(isAgent && member.member?.agent_id ? [{ label: 'Agent ID', value: member.member.agent_id }] : []),
    ...(isAgent && member.member?.agent?.account_id ? [{ label: 'Account ID', value: member.member.agent.account_id }] : []),
    ...(!isAgent && member.member?.user_id ? [{ label: 'User ID', value: member.member.user_id }] : []),
  ] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        {!member || !me || !memberDetails ? (
          <div className="py-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Loading member details...
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Member Details</DialogTitle>
              <DialogDescription className="text-sm text-neutral-500 dark:text-neutral-400">
                View and manage member information and permissions
              </DialogDescription>
            </DialogHeader>

            {/* Member Info Section */}
            <div className="flex items-center gap-4 py-4">
              {isAgent && member.member?.agent ? (
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
                  {String(memberDetails.name || '').charAt(0)?.toUpperCase()}
                </CustomAvatar>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                  {memberDetails.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      memberDetails.status === 'online' ? 'bg-green-500' : 'bg-neutral-400',
                    )}
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                    {memberDetails.status || 'offline'}
                  </p>
                  <span className="text-neutral-400 dark:text-neutral-600">•</span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 capitalize font-medium">
                    {member.role || 'member'}
                  </p>
                </div>
                {isAgent && member.agent_interaction && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Agent Mode:{' '}
                    <span className="font-medium">
                      {member.agent_interaction === 'mention_only' ? 'Mention Only' : 'Always Respond'}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <Separator className="bg-neutral-200 dark:bg-neutral-800" />

            {/* Actions Section */}
            {isAdmin ? (
              <div className="space-y-4">
                {/* Quick Actions */}
                {member.role !== 'owner' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                      Quick Actions
                    </h4>
                    <Button
                      variant={member.is_kicked ? 'default' : 'destructive'}
                      className="w-full h-10"
                      onClick={handleKickToggle}
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

                {/* Role Management */}
                {(member.role !== 'owner' || role === 'owner') && (
                  <>
                    <Separator className="bg-neutral-200 dark:bg-neutral-800" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        Change Role
                      </h4>
                      <ToggleButtonGroup
                        options={roleOptions}
                        currentValue={member.role || 'member'}
                        onSelect={handleRoleChange}
                        columns={2}
                      />
                    </div>
                  </>
                )}

                {/* Agent Interaction Options */}
                {isAgent && (
                  <>
                    <Separator className="bg-neutral-200 dark:bg-neutral-800" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        Agent Interaction
                      </h4>
                      <ToggleButtonGroup
                        options={AGENT_INTERACTION_OPTIONS}
                        currentValue={member.agent_interaction || 'mention_only'}
                        onSelect={handleAgentInteractionChange}
                        columns={2}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  You don&apos;t have permission to manage this member.
                </p>
              </div>
            )}

            <Separator className="bg-neutral-200 dark:bg-neutral-800" />

            {/* Technical Information - Collapsible */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="member-ids" className="border-0">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Iconify
                      icon="solar:info-circle-linear"
                      width={18}
                      className="text-neutral-500 dark:text-neutral-400"
                    />
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                      Technical Information
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  {technicalIds.map((id) => (
                    <CopyableIdField
                      key={id.label}
                      label={id.label}
                      value={id.value}
                      onCopy={handleCopy}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});

MemberDialog.displayName = 'MemberDialog';

export default MemberDialog;

