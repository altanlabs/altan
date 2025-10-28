import { memo, useCallback } from 'react';

import StatusBadge from './badge/StatusBadge.jsx';
import useLongPress from '../../../hooks/useLongPress.jsx';
import { createMemberContextMenu } from '../../../redux/slices/room';
import { dispatch } from '../../../redux/store.js';
import DynamicAgentAvatar from '../../agents/DynamicAgentAvatar.jsx';
import CustomAvatar from '../../custom-avatar/CustomAvatar.jsx';
import Iconify from '../../iconify/Iconify.jsx';

const MemberBadge = ({
  member,
  memberDetails,
  userVolume,
  badgeSize = 42,
  style = {},
  hideBadge = false,
}) => {
  const {
    src,
    name,
    //  role, email, since,
    status,
    isMe,
  } = memberDetails;
  const borderColor = userVolume >= 40 ? '#54c17f' : 'transparent';

  const onContextMenu = useCallback((e) => {
    e.preventDefault();
    if (isMe) {
      return;
    }
    dispatch(createMemberContextMenu({ anchorEl: e.currentTarget, roomMember: member, position: { top: e.pageY, left: e.pageX } }));
  }, [isMe, member]);

  const longPressParams = useLongPress(onContextMenu, { ms: 400 });
  return (
    <StatusBadge
      hidebadge={!!hideBadge ? '1' : null}
      status={status || 'offline'}
      isuserincall={!!member?.isUserInCall ? 'true' : undefined}
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        ...style,
      }}
      onContextMenu={onContextMenu}
      {...longPressParams}
    >
      {member?.member?.member_type === 'agent' ? (
        <DynamicAgentAvatar
          agent={member?.member?.agent}
          size={badgeSize}
          agentId={member?.member?.agent_id || member?.id}
          agentState={null}
          sx={{
            borderColor: !member?.is_kicked ? borderColor : '#000',
            borderWidth: 2,
            borderStyle: 'solid',
            opacity: member?.is_kicked ? 0.5 : 1,
          }}
        />
      ) : (
        <CustomAvatar
          alt={name}
          src={src}
          name={name}
          sx={{
            height: badgeSize,
            width: badgeSize,
            borderColor: !member?.is_kicked ? borderColor : '#000',
            borderWidth: 2,
            borderStyle: 'solid',
            opacity: member?.is_kicked ? 0.5 : 1,
          }}
        />
      )}
      {
        member?.isUserInCall && (
          <Iconify
            i="ic:round-volume-down"
            width={18}
            sx={{
              position: 'absolute',
              borderWidth: '2px',
              borderColor: '#000',
              right: -8.5,
              bottom: -2,
              zIndex: 99,
              color: '#fff',
            }}
          />
        )
      }
    </StatusBadge>
  );
};

export default memo(MemberBadge);
