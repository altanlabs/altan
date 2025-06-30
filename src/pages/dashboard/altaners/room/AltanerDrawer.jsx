import { Typography, useTheme } from '@mui/material';
import React, { useState, useCallback, useEffect, memo } from 'react';

import useMessageListener from '@hooks/useMessageListener.ts';

import { selectAccountId } from '../../../../redux/slices/general';
import { useSelector } from '../../../../redux/store';
import { optimai_room } from '../../../../utils/axios';
import Room from '../../../../components/room/Room';

const AltanerDrawer = ({
  iframeRef,
  roomId = null,
  externalRoomId = null,
  // side = 'left',
  // initialDrawerOpen = true,
  accountId: providedAccountId, // optional accountId passed from parent
  altanerId = null,
}) => {
  const currentAccountId = useSelector(selectAccountId);
  const accountId = providedAccountId || currentAccountId;
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRoom = async (extId) => {
      try {
        const response = await optimai_room.get(`/external/${extId}?account_id=${accountId}`, {
          signal: controller.signal,
        });
        setRoom(response.data.room.id);
      } catch (error) {
        if (!controller.signal.aborted) {
          setRoom(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    if (externalRoomId) {
      fetchRoom(externalRoomId);
    } else if (roomId) {
      setRoom(roomId);
      setIsLoading(false);
    } else {
      setRoom(null);
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [accountId, externalRoomId, roomId]);

  const renderContent = () => {
    return (
      <Room
        key={roomId}
        roomId={roomId}
        header={false}
      />
    );
  };

  if (!isLoading && !room) {
    return null;
  }

   return renderContent();
};

export default memo(AltanerDrawer);
