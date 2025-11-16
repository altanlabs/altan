/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';

import MemberCard from './MemberCard';
import { selectMe, selectMembers } from '../../redux/slices/room/selectors/memberSelectors';
import { useSelector } from '../../redux/store';
import { getMemberDetails } from '../new-room/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

// ============================================================================
// Types
// ============================================================================

interface MentionComponentProps {
  mentionName: string;
  mentionId: string;
}

// ============================================================================
// Main Component
// ============================================================================

const MentionComponent = ({ mentionName, mentionId }: MentionComponentProps): React.JSX.Element => {
  const members = useSelector(selectMembers);
  const me = useSelector(selectMe);
  const member = members?.byId?.[mentionId];
  const memberDetails = getMemberDetails(member as any, me as any) as any;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="mention cursor-pointer hover:underline">
          @{mentionName}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border border-neutral-200 dark:border-neutral-800 shadow-lg bg-white dark:bg-neutral-950"
        align="center"
        side="top"
        sideOffset={4}
      >
        <MemberCard
          member={member as any}
          memberDetails={memberDetails}
          badgeSize={48}
        />
      </PopoverContent>
    </Popover>
  );
};

export default memo(MentionComponent);
