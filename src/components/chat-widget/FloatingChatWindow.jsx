// FloatingChatWindow.jsx
import { useTheme } from '@mui/material';
import React, { memo, useState, useEffect, useCallback } from 'react';

import useMessageListener from '../../hooks/useMessageListener.js';
import { optimai_room } from '../../utils/axios.js';
import FloatingWindow from '../floating/FloatingWindow.jsx';
import Room from '../room/Room.jsx';

export const FloatingChatWindow = (props) => {
  const theme = useTheme();
  const [actualRoomId, setActualRoomId] = useState(null);
  // console.log('props', props);
  // console.log('actualRoomId', actualRoomId);
  const [isLoading, setIsLoading] = useState(false);

  // Add clipboard handling
  const handleCopy = useCallback((data) => {
    try {
      navigator.clipboard.writeText(data);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }, []);

  const handleMessage = useCallback(
    (event) => {
      if (event.data.type === 'COPY_TO_CLIPBOARD') handleCopy(event.data.text);
    },
    [handleCopy],
  );

  useMessageListener(['https://altan.ai'], handleMessage);

  // Calculate initial position at bottom right
  const defaultPosition = {
    offsetX: props.offsetX ?? 20, // 20px from right edge
    offsetY: 30, // 20px from bottom
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await optimai_room.get(
          `/external/${props.id}?account_id=${props.accountId}`,
        );
        setActualRoomId(response.data.room.id);
      } catch (error) {
        console.error('Failed to fetch room:', error);
        setActualRoomId(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (props.id && props.accountId) {
      setIsLoading(true);
      fetchRoom();
    }
  }, [props.id, props.accountId]);

  // Don't render the iframe until we have the actual room ID
  if (isLoading || !actualRoomId) {
    return null; // Or you could return a loading spinner here
  }

  return (
    <FloatingWindow
      {...props}
      name={props.name || 'Room'}
      offsetX={defaultPosition.offsetX}
      offsetY={defaultPosition.offsetY}
      mode={props.mode || 'room'}
      baseWidth={425}
      baseHeight={840}
      defaultPosition="bottomRight"
      // additionalClasses="floating-chat-window"
      onExternalOpen={() =>
        window.open(`https://altan.ai/${props.mode || 'r'}/${actualRoomId}`, '_blank')}
      enableExpand={props.enableExpand}
      usePortal={true}
    >
      <Room roomId={actualRoomId} header={false} />
    </FloatingWindow>
  );
};

export default memo(FloatingChatWindow);
