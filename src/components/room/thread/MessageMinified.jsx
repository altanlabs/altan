import { Stack, Tooltip } from '@mui/material';
import { createSelector } from '@reduxjs/toolkit';
// import { truncate } from 'lodash';
import { memo, useMemo } from 'react';

import { MENTION_ANNOTATION_REGEX, selectMe, selectMembers, makeSelectMessageContent } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import CustomAvatar from '../../custom-avatar/CustomAvatar.jsx';
import { getMemberDetails } from '../utils';

const makeSelectTruncatedContent = () => createSelector(
  [makeSelectMessageContent()],
  (content) => !content ? content : content.replace(MENTION_ANNOTATION_REGEX, '@$1').replace('\n', ' '),
);

const MessageMinified = ({ message }) => {
  const members = useSelector(selectMembers);
  const contentSelector = useMemo(() => {
    if (!message) {
      return () => null;
    }
    return makeSelectTruncatedContent();
  }, [message]);

  const content = useSelector((state) => contentSelector(state, message?.id));

  const me = useSelector(selectMe);
  const { name, src } = useMemo(() => {
    if (!message?.member_id || !members?.byId) {
      return { name: '', src: '' };
    }
    const m = members.byId[message.member_id];
    if (m) {
      return getMemberDetails(m, me);
    }
    return { name: '', src: '' };
  }, [message, members?.byId, me]);

  if (!message) {
    return null;
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      width="100%"
    >
      <Tooltip title={name || ''}>
        <span>
          <CustomAvatar
            alt={name || ''}
            sx={{ width: 12, height: 12 }}
            src={src || ''}
            name={name || ''}
          />
        </span>
      </Tooltip>
      {content && (
        <span className="text-xs font-italic opacity-90 truncate w-full">
          {content}
        </span>
      )}
    </Stack>
  );
};

export default memo(MessageMinified);
