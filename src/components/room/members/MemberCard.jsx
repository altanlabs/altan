import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Typography, Stack, IconButton, Tooltip, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { capitalize } from 'lodash';
import { memo, useState } from 'react';

import AgentOrbAvatar from '../../agents/AgentOrbAvatar.jsx';
import CustomAvatar from '../../custom-avatar/CustomAvatar.jsx';

const CustomTypography = styled(Typography)(({ size, bold = undefined }) => {
  return {
    fontSize: size ?? '1.2rem',
    ...!!bold && {
      fontWeight: 'bold',
    },
  };
});

const IdContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.75rem',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  padding: '4px 8px',
  marginBottom: '4px',
});

const IdLabel = styled('span')({
  color: '#666',
  marginRight: '4px',
});

const IdValue = styled('span')({
  color: '#333',
  fontFamily: 'monospace',
  letterSpacing: '-0.5px',
});

const MemberCard = ({ memberDetails, member, memberBadge = null, badgeSize = 20 }) => {
  const [copyTooltip, setCopyTooltip] = useState({
    roomMemberId: false,
    memberId: false,
  });

  // console.log('member', member);
  const {
    name,
    email,
    since,
    type,
    status,
    src,
    // isMe
  } = memberDetails;

  // Debug agent properties if this is an agent type member
  if (type === 'agent' && member?.member?.agent) {
    console.log('Agent properties:', member);
  }

  const badge = memberBadge || (!!member && (
    type === 'agent' && !src ? (
      <AgentOrbAvatar
        size={badgeSize}
        agentId={member?.member?.agent_id || member?.id}
        agentState={null}
        isStatic={false}
      />
    ) : (
      <CustomAvatar
        alt={name}
        name={name}
        src={src}
        sx={{
          width: badgeSize,
          height: badgeSize,
          borderColor: !member.is_kicked ? 'green' : '#000',
          borderWidth: 2,
          borderStyle: 'solid',
          opacity: member.is_kicked ? 0.5 : 1,
        }}
      />
    )
  ));

  if (!member) {
    return <span>No member details (possibly deleted)</span>;
  }

  // Helper function to crop ID values
  const cropId = (id) => {
    if (!id) return '';
    return `${id.slice(0, 6)}...`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyTooltip(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopyTooltip(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  // Get interaction chip color based on value
  const getInteractionColor = (interaction) => {
    switch (interaction) {
      case 'mention_only': return 'info';
      case 'broadcast': return 'success';
      case 'disabled': return 'default';
      default: return 'primary';
    }
  };

  return (
    <Stack padding={1.5}>
      {/* Header */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 1 }}
      >
        {badge}
        <Stack>
          <CustomTypography bold="true">{name}</CustomTypography>
          <div className="flex items-center text-xs">
            <span>Status: {member.is_kicked ? 'Kicked' : capitalize(status)}</span>
            <span className="mx-1">•</span>
            <span>Role: {capitalize(member.role)}</span>
          </div>

          {/* Agent Interaction Chip - only show for agent members */}
          {type === 'agent' && !!member?.member?.agent && !!member.agent_interaction && (
            <Chip
              label={`Interaction: ${capitalize(member.agent_interaction.replace('_', ' '))}`}
              color={getInteractionColor(member.agent_interaction)}
              size="small"
              variant="outlined"
              sx={{ mt: 0.5, height: '20px', fontSize: '0.7rem' }}
            />
          )}
        </Stack>
      </Stack>

      {/* Member Info */}
      <Stack
        spacing={0.5}
        sx={{ mt: 1 }}
      >
        {/* IDs Section with smaller display */}
        <IdContainer>
          <IdLabel>Room ID:</IdLabel>
          <IdValue>{cropId(member.id)}</IdValue>
          <Tooltip
            title={copyTooltip.roomMemberId ? 'Copied!' : 'Copy ID'}
            placement="top"
          >
            <IconButton
              size="small"
              onClick={() => copyToClipboard(member.id, 'roomMemberId')}
              sx={{ ml: 'auto', p: 0.3 }}
            >
              <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        </IdContainer>

        <IdContainer>
          <IdLabel>Member ID:</IdLabel>
          <IdValue>{cropId(member.member?.id)}</IdValue>
          <Tooltip
            title={copyTooltip.memberId ? 'Copied!' : 'Copy ID'}
            placement="top"
          >
            <IconButton
              size="small"
              onClick={() => copyToClipboard(member.member?.id, 'memberId')}
              sx={{ ml: 'auto', p: 0.3 }}
            >
              <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        </IdContainer>

        <IdContainer>
          <IdLabel>Room Member ID:</IdLabel>
          <IdValue>{cropId(member?.id)}</IdValue>
          <Tooltip
            title={copyTooltip.roomMemberId ? 'Copied!' : 'Copy ID'}
            placement="top"
          >
            <IconButton
              size="small"
              onClick={() => copyToClipboard(member?.id, 'roomMemberId')}
              sx={{ ml: 'auto', p: 0.3 }}
            >
              <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        </IdContainer>

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 0.5, fontSize: '0.75rem', color: '#666' }}
        >
          <span>Since: {since}</span>
          {email && <span>• {email}</span>}
        </Stack>

        {/* Agent Link */}
        {type === 'agent' && !!member?.member?.agent && (
          <a
            href={`https://www.altan.ai/agent/${member.member.agent.id}?acc=${member.member.agent.account_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-1 mt-1 rounded-lg
                     bg-transparent border border-gray-400 border-opacity-30 hover:bg-gray-200 dark:hover:bg-gray-800
                     text-gray-600 dark:text-gray-300 transition"
            style={{ fontSize: '0.8rem' }}
          >
            Agent Settings
          </a>
        )}
      </Stack>
    </Stack>
  );
};

export default memo(MemberCard);
