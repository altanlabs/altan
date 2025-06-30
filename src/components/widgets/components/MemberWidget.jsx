import { Box, Skeleton, Avatar, Typography, Stack } from '@mui/material';
import { memo, useEffect, useState } from 'react';

import { dispatch } from '../../redux/store';
import { optimai } from '../../utils/axios';

const fetchMember = (memberId) => async () => {
  try {
    const response = await optimai.get(`/graph/member/${memberId}/`);
    const { member } = response.data;
    return member;
  } catch (e) {
    return Promise.reject(e.message);
  }
};

function MemberWidget({ id }) {
  const [member, setMember] = useState(null);
  const [memberFetched, setMemberFetched] = useState(false);

  useEffect(() => {
    dispatch(fetchMember(id)).then((fetchedMember) => {
      setMember(fetchedMember);
      setMemberFetched(true);
    }).catch((error) => {
      console.error('Failed to fetch member', error);
      setMemberFetched(true);
    });
  }, [id]);

  return (
    <>
      {member ? (
        <Box sx={{ m: 0.5, maxWidth: 250 }}>
          <Stack direction="row" sx={{ alignItems: 'center' }} spacing={2}>
            <Avatar src={member?.agent.avatar_url} />
            <Typography variant="h6">{member?.agent?.name || member?.name || member?.user?.first_name + member?.user?.last_name || 'Member'}</Typography>
          </Stack>
        </Box>
      ) : memberFetched ? (
        <div style={{ color: 'red' }}>404 Member not found</div>
      ) : (
        <Skeleton sx={{ width: '100%', height: 300 }} />
      )}
    </>
  );
}

export default memo(MemberWidget);
