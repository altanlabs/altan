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
    <div className="flex flex-col w-full min-w-0">
      <div className="flex items-center gap-1 mb-0.5">
        <Tooltip title={name || ''}>
          <span>
            <CustomAvatar
              alt={name || ''}
              sx={{ width: 14, height: 14 }}
              src={src || ''}
              name={name || ''}
            />
          </span>
        </Tooltip>
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
          {name}
        </span>
      </div>
      {content && (
        <span className="text-xs text-gray-600 dark:text-gray-300 opacity-90 truncate">
          {content}
        </span>
      )}
    </div>
  );
};

export default memo(MessageMinified);
