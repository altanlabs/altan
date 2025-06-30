import { Tooltip } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import { getMemberDetails } from '../utils';
import MemberBadge from './MemberBadge.jsx';
import MemberCard from './MemberCard.jsx';
import { useAuthContext } from '../../../auth/useAuthContext';

const RoomMember = ({
  member,
  userVolume = 0,
  badgeSize = 42,
  hideBadge = false,
  hideTooltip = false,
  style = {},
}) => {
  const {
    guest,
    user,
  } = useAuthContext();
  const me = user?.member || guest?.member;
  const [open, setOpen] = useState(false);

  const handleTooltipClick = useCallback(() => setOpen(prev => !prev), []);

  const memberDetails = useMemo(() => getMemberDetails(member, me), [member, me]);

  const props = useMemo(() => ({
    member,
    userVolume,
    me,
    memberDetails,
  }), [member, userVolume, me, memberDetails]);

  const memberBadge = useCallback((badgeSize, hideBadge, style) => (
    <MemberBadge
      {...props}
      hideBadge={hideBadge}
      style={style}
      badgeSize={badgeSize}
    />
  ), [props]);

  const title = useMemo(() => (
    <MemberCard
      memberDetails={memberDetails}
      member={member}
      memberBadge={memberBadge(70)}
    />
  ), [memberBadge, memberDetails, member]);

  return (
    <Tooltip
      title={title}
      placement="top"
      open={open}
      slotProps={{
        tooltip: {
          sx: {
            padding: 0,
          },
        },
      }}
      onClose={() => setOpen(false)}
    >
      <span>
        {
          !hideTooltip ? (
            <Tooltip
              arrow
              followCursor
              title={memberDetails.name}
            >
              <span
                onClick={handleTooltipClick}
              >
                {memberBadge(badgeSize, hideBadge, style)}
              </span>
            </Tooltip>
          ) : memberBadge(badgeSize, hideBadge, style)
        }
      </span>
    </Tooltip>
  );
};

export default RoomMember;
