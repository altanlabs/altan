import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { memo, useMemo } from 'react';

import { selectMembers, makeSelectMessageReactions } from '../../redux/slices/room/selectors';
import { useSelector } from '../../redux/store.ts';
import { getMemberName } from '../new-room/utils';

const ReactionDetails = ({ members, emoji }) => {
  if (!members || !members.length) {
    return <Typography variant="caption">No reactions</Typography>;
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
    >
      <Box
        sx={{
          width: 65,
          height: 65,
          fontSize: '3rem',
          alignItems: 'center',
        }}
      >
        {emoji}
      </Box>
      <Typography variant="caption">{members} reacted.</Typography>
    </Stack>
  );
};

const Reaction = ({ emoji, count, members }) => {
  const memberNames = useMemo(() => {
    const names = members.map(getMemberName);
    const lastName = names.pop();
    return names.join(', ').concat(!names.length ? '' : ' and ').concat(lastName);
  }, [members]);

  return (
    <Tooltip
      arrow
      title={<ReactionDetails members={memberNames} emoji={emoji} />}
    >
      <div style={{ position: 'relative' }}>
        <span style={{ cursor: 'pointer' }}>
          <span
            style={{
              borderRadius: '50%',
              padding: '1px 4px',
              fontSize: '0.5em',
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              zIndex: -1,
              // ...bgBlur({ color: theme.palette.background.default, opacity: 0.5 }),
            }}
          >
            {count}
          </span>
          {emoji}
        </span>
      </div>
    </Tooltip>
  );
};

const Reactions = ({ messageId }) => {
  const reactionSelector = useMemo(makeSelectMessageReactions, []);
  const reactions = useSelector((state) => reactionSelector(state, messageId));
  const members = useSelector(selectMembers);

  const reactionCounts = useMemo(() => (reactions ?? [])
    // Filter out like/dislike reactions - these should be handled by ThreadActionBar
    .filter(reaction => reaction.reaction_type !== 'like' && reaction.reaction_type !== 'dislike')
    .reduce((acc, reaction) => {
      acc[reaction.emoji] = acc[reaction.emoji] || { count: 0, members: [] };
      acc[reaction.emoji].count++;
      acc[reaction.emoji].members.push(members.byId[reaction.member_id]);
      return acc;
    }, {}), [members.byId, reactions]);

  const reactionList = Object.entries(reactionCounts).map(([emoji, details]) => (
    <Reaction key={`emoji-index-${emoji}`} emoji={emoji} count={details.count} members={details.members} />
  ));

  return !!reactionList.length && (
    <Stack
      alignItems="center"
      justifyContent="left"
      direction="row"
      paddingLeft={4.5}
      paddingTop={1}
    >
      {reactionList}
    </Stack>
  );
};

export default memo(Reactions);
