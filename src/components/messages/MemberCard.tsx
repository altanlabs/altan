/* eslint-disable react/prop-types */
import { Copy, Check } from 'lucide-react';
import React, { memo, useState } from 'react';

// @ts-expect-error - JSX component without types
import AgentOrbAvatar from '../agents/AgentOrbAvatar.jsx';
// @ts-expect-error - JSX component without types
import CustomAvatar from '../custom-avatar/CustomAvatar.jsx';
import { Button } from '../ui/button';

// ============================================================================
// Types
// ============================================================================

interface MemberDetails {
  name: string;
  email: string | null;
  since: string;
  type: 'agent' | 'user';
  status: string;
  src: string | null;
  isMe?: boolean;
}

interface Member {
  id: string;
  role: string;
  is_kicked?: boolean;
  agent_interaction?: 'mention_only' | 'always' | 'disabled';
  member?: {
    id?: string;
    agent_id?: string;
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

interface MemberCardProps {
  memberDetails: MemberDetails;
  member: Member | null;
  badgeSize?: number;
}

interface CopyableIdProps {
  label: string;
  value: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const truncateId = (id: string): string => {
  if (!id) return '';
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
};

const getStatusColor = (isKicked: boolean, status: string): string => {
  if (isKicked) return 'text-red-600 dark:text-red-400';
  if (status === 'online') return 'text-green-600 dark:text-green-400';
  return 'text-neutral-500 dark:text-neutral-400';
};

const getInteractionBadge = (interaction: string): { label: string; color: string } => {
  switch (interaction) {
    case 'mention_only':
      return { label: 'Mention Only', color: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    case 'always':
      return { label: 'Always Active', color: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' };
    case 'disabled':
      return { label: 'Disabled', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700' };
    default:
      return { label: 'Active', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700' };
  }
};

// ============================================================================
// Sub-components
// ============================================================================

const CopyableId = memo<CopyableIdProps>(({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1 bg-neutral-50 dark:bg-neutral-900/50 rounded border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide shrink-0">
          {label}
        </span>
        <span className="text-[10px] font-mono text-neutral-900 dark:text-neutral-100 truncate">
          {truncateId(value)}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-5 w-5 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-700 shrink-0"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
        )}
      </Button>
    </div>
  );
});

CopyableId.displayName = 'CopyableId';

// ============================================================================
// Main Component
// ============================================================================

const MemberCard = ({ memberDetails, member, badgeSize = 20 }: MemberCardProps): React.JSX.Element | null => {
  if (!member) {
    return (
      <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
        No member details (possibly deleted)
      </div>
    );
  }

  const { name, email, since, type, status } = memberDetails;
  const isKicked = member.is_kicked || false;
  const agentInteraction = member.agent_interaction;
  const interactionBadge = agentInteraction ? getInteractionBadge(agentInteraction) : null;

  // Get agent IDs
  const agentId = member?.member?.agent?.id;
  const accountId = member?.member?.agent?.account_id;
  const agentLink = agentId && accountId
    ? `https://www.altan.ai/agent/${agentId}?acc=${accountId}`
    : null;

  // Get orb colors from agent meta_data (matching AgentDetailDialog.tsx)
  const orbColors = member?.member?.agent?.meta_data?.avatar_orb?.colors || ['#CADCFC', '#A0B9D1'];
  const picture = memberDetails.src;

  // Default badge if none provided (matching AgentDetailDialog.tsx pattern)
  const badge = (
    !picture ? (
      <AgentOrbAvatar
        size={badgeSize}
        agentId={agentId || member?.member?.agent_id || member?.id}
        agentState={null}
        isStatic={false}
        colors={orbColors}
      />
    ) : (
      <CustomAvatar
        sx={{
          width: badgeSize,
          height: badgeSize,
          borderColor: !isKicked ? 'green' : '#000',
          borderWidth: 2,
          borderStyle: 'solid',
          opacity: isKicked ? 0.5 : 1,
        }}
        variant="circular"
        src={picture}
        name={name}
      />
    )
  );

  return (
    <div className="p-3 space-y-2.5 min-w-[280px] max-w-[320px]">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="shrink-0">{badge}</div>
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {name}
          </h4>
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 dark:text-neutral-400">
            <span className={getStatusColor(isKicked, status)}>
              {isKicked ? 'Kicked' : status}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="capitalize">{member.role}</span>
          </div>
          
          {/* Agent Interaction Badge */}
          {type === 'agent' && interactionBadge && (
            <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${interactionBadge.color}`}>
              {interactionBadge.label}
            </div>
          )}
        </div>
      </div>

      {/* IDs Section */}
      <div className="space-y-1">
        <CopyableId label="Room ID" value={member.id} />
        <CopyableId label="Member ID" value={member?.member?.id || ''} />
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
        <span>Since {since}</span>
        {email && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="truncate">{email}</span>
          </>
        )}
      </div>

      {/* Agent Link */}
      {type === 'agent' && agentLink && (
        <a
          href={agentLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-2 py-1.5 text-[11px] font-medium rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          Agent Settings
        </a>
      )}
    </div>
  );
};

export default memo(MemberCard);

