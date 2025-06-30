import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo, useCallback } from 'react';

import SubMenu from './SubMenu.jsx';
import { useEmojiPicker } from '../../providers/EmojiPickerProvider.jsx';
import {
  copyMessage,
  deleteMessage,
  patchMember,
  reactToMessage,
  setThreadDrawer,
  setThreadRespond,
} from '../../redux/slices/room';
import { dispatch } from '../../redux/store';
import Iconify from '../iconify';

const copy = (text) => {
  const parentUrl = window.parent.location.href;
  if (!parentUrl) {
    window.parent.postMessage({ type: 'COPY_TO_CLIPBOARD', text }, '*');
    return true;
  }
  // Try to save to clipboard then save it in the state if worked
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const ContextMenuItems = ({ items }) => {
  const { handleOpen } = useEmojiPicker();

  const executeAction = useCallback(
    (action) => {
      if (action === null) {
        return;
      }
      const { k: key, p: payload } = action;
      switch (key) {
        case 'patchMember':
          dispatch(patchMember({ action: payload.action, body: payload.body }));
          break;
        case 'createThread':
          dispatch(setThreadDrawer(payload));
          break;
        case 'handleCopy':
          dispatch(copyMessage({ messageId: payload }));
          break;
        case 'handleCopyId':
          copy(payload);
          break;
        case 'deleteMessage':
          dispatch(deleteMessage({ messageId: payload.messageId }));
          break;
        case 'replyToMessage':
          dispatch(setThreadRespond(payload));
          break;
        case 'addReaction':
          handleOpen({ currentTarget: true }, (emoji) => {
            if (!!payload.messageId && !!emoji) {
              dispatch(
                reactToMessage({
                  messageId: payload.messageId,
                  reactionType: 'emoji',
                  emoji: emoji.native,
                }),
              );
            }
          });
        default:
          break;
      }
    },
    [handleOpen],
  );

  if (!items?.length) {
    return null;
  }

  return items.map((item, index, array) => {
    return (
      <div key={`menu-item-${index}`}>
        {!!item.children ? (
          <SubMenu
            item={item}
            executeAction={executeAction}
          />
        ) : (
          <MenuItem
            disabled={item.a === null}
            onClick={() => executeAction(item.a)}
          >
            <Stack
              direction="row"
              justifyContent="left"
              alignItems="center"
              spacing={2}
              width="100%"
            >
              <Iconify
                width={15}
                icon={item.i}
              />
              <Typography
                variant="caption"
                sx={{ fontSize: '0.8em' }}
              >
                {item.l}
              </Typography>
            </Stack>
          </MenuItem>
        )}
        {index < array.length - 1 && <Divider style={{ margin: 0, padding: 0 }} />}
      </div>
    );
  });
};

export default memo(ContextMenuItems);
