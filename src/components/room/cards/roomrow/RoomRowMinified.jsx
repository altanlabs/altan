import { Skeleton, useTheme } from '@mui/material';
import React, { memo, useCallback, useMemo } from 'react';

import { makeSelectRoomById, makeSelectRoomIsSelected } from '../../../../redux/slices/general';
import { useSelector } from '../../../../redux/store.tsx';
import CustomAvatar from '../../../avatars/CustomAvatar.jsx';

const RoomRowMinified = ({ roomId, onClick }) => {
  const theme = useTheme();
  const selectors = useMemo(() => ({
    room: makeSelectRoomById(),
    selected: makeSelectRoomIsSelected(),
  }), []);
  const room = useSelector((state) => selectors.room(state, roomId));
  const isSelected = useSelector((state) => selectors.selected(state, roomId));
  const onCardClick = useCallback(() => onClick(roomId), [onClick, roomId]);
  // console.log("room",room.meta_data);

  if (!room) {
    return (
      <Skeleton variant="rectangular" sx={{ width: '100%', height: 30 }} />
    );
  };

  return (
    <div
      onClick={onCardClick}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        cursor: 'pointer',
        marginLeft: '5px',
        borderRadius: 6,
        border: isSelected ? `2px solid ${theme.palette.action.blue}` : 'none',
        '&:hover': {
          transform: 'scale(1.01)',
        },
      }}
    >

      {
        room.avatar_url ? (
          <img
            style={{
              width: '100%',
              height: 42,
              borderRadius: 6,
              opacity: 0.9,
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              objectFit: 'cover',
            }}
            onMouseOver={e => {
              e.currentTarget.style.opacity = 1;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.opacity = 0.9;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            alt={room.name}
            src={room.avatar_url} // ?  : room.account?.company?.logo_url}
          />
        ) : (
          <CustomAvatar
            style={{ width: 35, height: 35, borderRadius: 6 }}
            alt={room.name}
            name={room?.account?.company?.name}
          />
        )
      }
    </div>
  );
};

export default memo(RoomRowMinified);
