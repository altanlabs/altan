import { Tooltip } from '@mui/material';
import { memo } from 'react';

import MemberCard from './MemberCard';
import { RootState, useSelector } from '../../../redux/store';
import { getMemberDetails } from '../../room/utils';


// Assume this is your mention component
const MentionComponent = ({ mentionName, mentionId }) => {
  const { members, externalMembers, me } = useSelector((state: RootState) => state.room);
  const member = members.byId[mentionId];
  const memberDetails = getMemberDetails(member, me);
  return (
    <Tooltip
      arrow
      enterDelay={1500}
      enterNextDelay={1500}
      slotProps={{
        tooltip: {
          sx: {
            padding: 0
          }
        }
      }}
      title={<MemberCard member={member} memberDetails={memberDetails} badgeSize={60}/>}
    >
      <span className="mention">@{mentionName}</span>
    </Tooltip>
  );
};

export default memo(MentionComponent);