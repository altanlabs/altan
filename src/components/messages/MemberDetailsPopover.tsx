import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Edit2, UserMinus, UserPlus, Star, AtSign, Copy, Check } from 'lucide-react';

import { selectMe } from '../../redux/slices/room/selectors/memberSelectors';
import { patchMember } from '../../redux/slices/room/thunks/roomThunks';
import { dispatch } from '../../redux/store';
import { formatDate } from '../../utils/dateUtils';
import AgentOrbAvatar from '../agents/AgentOrbAvatar';
import CustomAvatar from '../custom-avatar/CustomAvatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

// ============================================================================
// Types
// ============================================================================

interface Member {
  id: string;
  member_type?: 'agent' | 'user';
  role?: 'owner' | 'admin' | 'member' | 'listener' | 'viewer';
  agent_interaction?: 'mention_only' | 'always';
  agent_id?: string;
  date_creation?: string;
  is_kicked?: boolean;
  account_id?: string;
  member?: {
    id?: string;
    agent?: {
      id: string;
      account_id?: string;
      description?: string;
      meta_data?: {
        avatar_orb?: {
          colors?: string[];
        };
      };
    };
  };
  agent?: {
    id: string;
    account_id?: string;
    description?: string;
    meta_data?: {
      avatar_orb?: {
        colors?: string[];
      };
    };
  };
}

interface RoomMember {
  id: string;
  member: Member;
}

interface MemberDetailsPopoverProps {
  isOpen: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  roomMember: RoomMember;
  memberName: string;
  picture?: string;
}

interface DetailRowProps {
  label: string;
  value: string | number;
  copyable?: boolean;
}

interface RoleOption {
  label: string;
  value: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  onClick: () => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

const truncateId = (id: string | number): string => {
  const idStr = String(id);
  if (idStr.length <= 12) return idStr;
  return `${idStr.slice(0, 6)}...${idStr.slice(-4)}`;
};

// ============================================================================
// Sub-components (following Single Responsibility Principle)
// ============================================================================

const DetailRow = memo<DetailRowProps>(({ label, value, copyable = false }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayValue = copyable ? truncateId(value) : (value || 'N/A');

  return (
    <div 
      className="flex items-center justify-between gap-2 py-0.5 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] ${copyable ? 'font-mono' : ''} text-neutral-900 dark:text-neutral-100`}>
          {displayValue}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className={`transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'} hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded p-0.5`}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
});

DetailRow.displayName = 'DetailRow';

const ActionButton = memo<ActionButtonProps>(({ icon, label, variant = 'outline', onClick }) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    className="w-full justify-start gap-2 font-medium text-xs h-8 transition-colors"
  >
    {icon}
    {label}
  </Button>
));

ActionButton.displayName = 'ActionButton';

// ============================================================================
// Business Logic Hooks (following Dependency Inversion Principle)
// ============================================================================

const useMemberActions = (member: Member | null) => {
  const handleRoleChange = async (newRole: string) => {
    if (!member?.id) return;
    
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

  const handleAgentInteractionChange = async (newInteraction: string) => {
    if (!member?.id) return;
    
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

  const handleMemberAction = async (action: string) => {
    if (!member?.id) return;
    
    try {
      await dispatch(
        patchMember({
          action,
          body: { room_member_id: member.id },
        }),
      );
    } catch (error) {
      console.error('Error performing member action:', error);
    }
  };

  const handleEditAgent = () => {
    const agentId = member?.member?.agent?.id || member?.agent?.id;
    if (agentId) {
      window.open(`/agent/${agentId}`, '_blank');
    }
  };

  return {
    handleRoleChange,
    handleAgentInteractionChange,
    handleMemberAction,
    handleEditAgent,
  };
};

// ============================================================================
// Permissions & Options (following Open-Closed Principle)
// ============================================================================

const usePermissions = (member: Member | null) => {
  const me = useSelector(selectMe);
  const isAgent = member?.member_type === 'agent';
  
  const canShowSettings = me && ['admin', 'owner'].includes(me.role || 'viewer');
  const canManageRoles = canShowSettings && (member?.role !== 'owner' || me?.role === 'owner');
  const canManageAgentInteraction = canShowSettings && isAgent;

  return {
    canShowSettings,
    canManageRoles,
    canManageAgentInteraction,
    isAgent,
  };
};

const getRoleOptions = (isOwner: boolean, memberIsOwner: boolean): RoleOption[] => {
  const baseOptions: RoleOption[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
    { label: 'Listener', value: 'listener' },
    { label: 'Viewer', value: 'viewer' },
  ];

  if (isOwner && !memberIsOwner) {
    baseOptions.push({ label: 'Owner', value: 'owner' });
  }

  return baseOptions;
};

const AGENT_INTERACTION_OPTIONS: RoleOption[] = [
  { label: 'Mention Only', value: 'mention_only' },
  { label: 'Always Respond', value: 'always' },
];

// ============================================================================
// Main Component
// ============================================================================

const MemberDetailsPopover = memo<MemberDetailsPopoverProps>(({
  isOpen,
  anchorEl,
  onClose,
  roomMember,
  memberName,
  picture,
}) => {
  const member = roomMember.member;
  const me = useSelector(selectMe);
  
  const {
    handleRoleChange,
    handleAgentInteractionChange,
    handleMemberAction,
    handleEditAgent,
  } = useMemberActions(member);

  const {
    canShowSettings,
    canManageRoles,
    canManageAgentInteraction,
    isAgent,
  } = usePermissions(member);

  if (!member) return null;

  const memberRole = member?.role || 'member';
  const agentInteraction = member?.agent_interaction || 'mention_only';
  const agentDescription = member?.member?.agent?.description || member?.agent?.description || '';
  const roleOptions = getRoleOptions(me?.role === 'owner', member?.role === 'owner');
  
  // Get orb colors from agent meta_data
  const orbColors = member?.member?.agent?.meta_data?.avatar_orb?.colors || 
                    member?.agent?.meta_data?.avatar_orb?.colors || 
                    ['#CADCFC', '#A0B9D1'];
  
  // Get agent and account IDs
  const agentId = member?.member?.agent?.id || member?.agent?.id || member?.agent_id;
  const accountId = member?.member?.agent?.account_id || member?.agent?.account_id;

  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        <div ref={(node) => node && anchorEl} />
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0 border border-neutral-200 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-950"
        align="center"
        side="bottom"
        sideOffset={6}
      >
        {/* Header Section */}
        <div className="px-3 pt-3 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0">
              {isAgent && !picture ? (
                <AgentOrbAvatar
                  size={40}
                  agentId={member?.agent_id || member?.id}
                  agentState={null}
                  isStatic={false}
                  colors={orbColors}
                />
              ) : (
                <CustomAvatar
                  sx={{ width: 40, height: 40 }}
                  variant="circular"
                  src={picture}
                  name={memberName || 'Unknown User'}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-50 truncate">
                {memberName || 'Unknown User'}
              </h3>
              {agentDescription && (
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-snug mt-0.5">
                  {agentDescription}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        {(isAgent || canShowSettings || canManageRoles || canManageAgentInteraction) && (
          <div className="px-3 py-2 space-y-1.5 border-b border-neutral-100 dark:border-neutral-800">
            {/* Edit Agent Button */}
            {isAgent && (
              <ActionButton
                icon={<Edit2 className="h-3 w-3" />}
                label="Edit Agent"
                onClick={handleEditAgent}
              />
            )}

            {/* Kick/Readmit Button */}
            {canShowSettings && (
              <ActionButton
                icon={member?.is_kicked ? <UserPlus className="h-3 w-3" /> : <UserMinus className="h-3 w-3" />}
                label={member?.is_kicked ? 'Readmit' : 'Kick'}
                variant={member?.is_kicked ? 'default' : 'destructive'}
                onClick={() => handleMemberAction(member?.is_kicked ? 'readmit' : 'kick')}
              />
            )}

            {/* Role Selector */}
            {canManageRoles && (
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1 uppercase tracking-wide">
                  <Star className="h-2.5 w-2.5 text-neutral-400 dark:text-neutral-500" />
                  Role
                </label>
                <Select value={memberRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="h-7 text-xs font-medium bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                    {roleOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-xs focus:bg-neutral-50 dark:focus:bg-neutral-900"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Agent Interaction Selector */}
            {canManageAgentInteraction && (
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-neutral-600 dark:text-neutral-300 flex items-center gap-1 uppercase tracking-wide">
                  <AtSign className="h-2.5 w-2.5 text-neutral-400 dark:text-neutral-500" />
                  Agent Mode
                </label>
                <Select value={agentInteraction} onValueChange={handleAgentInteractionChange}>
                  <SelectTrigger className="h-7 text-xs font-medium bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                    {AGENT_INTERACTION_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-xs focus:bg-neutral-50 dark:focus:bg-neutral-900"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Details Section */}
        <div className="px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900/30">
          <h4 className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
            Details
          </h4>
          <div className="space-y-0 bg-white dark:bg-neutral-950 rounded-md border border-neutral-200 dark:border-neutral-800 px-2 py-1.5">
            {isAgent && agentId && (
              <DetailRow label="Agent ID" value={agentId} copyable />
            )}
            {isAgent && accountId && (
              <DetailRow label="Account ID" value={accountId} copyable />
            )}
            <DetailRow label="Member ID" value={member?.id || 'Unknown'} copyable />
            <DetailRow label="Room Member ID" value={roomMember?.id} copyable />
            <DetailRow label="Created" value={formatDate(member?.date_creation || null)} />
            <DetailRow label="Type" value={member?.member_type || 'user'} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

MemberDetailsPopover.displayName = 'MemberDetailsPopover';

export default MemberDetailsPopover;

