import { Chip, Stack, Typography } from '@mui/material';
import { capitalize } from 'lodash';
import { useMemo, memo } from 'react';

import { useAuthContext } from '../../../../auth/useAuthContext';
import MemberBadge from '../../members/MemberBadge.jsx';
import { getMemberDetails } from '../../utils';

const RoomMemberDetails = ({ member }) => {
  const {
    guest,
    user,
  } = useAuthContext();
  const me = useMemo(() => user?.member || guest?.member, [user, guest]);
  const memberDetails = useMemo(() => getMemberDetails(member, me), [member, me]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={1}
      height="100%"
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
      >
        <MemberBadge
          memberDetails={memberDetails}
          member={member}
          badgeSize={30}
        />
        <Stack spacing={0.25}>
          <Typography
            variant="body2"
          >
            {memberDetails.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: '0.5rem' }}
          >
            Since: {memberDetails.since}
          </Typography>
        </Stack>
      </Stack>
      <Chip sx={{ fontSize: '0.6rem', height: 15 }} size="small" label={capitalize(memberDetails.role)} />
    </Stack>
  );
};

export default memo(RoomMemberDetails);
