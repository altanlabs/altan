import { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import Room from '../components/room/Room.jsx';
import {
  selectRoomAttribute,
} from '../redux/slices/room';
import { useSelector } from '../redux/store';
import { CompactLayout } from '../layouts/dashboard/index.js';

const selectRoomName = selectRoomAttribute('name');
const selectRoomDescription = selectRoomAttribute('description');

const RoomPage = () => {
  const { roomId } = useParams();
  const roomName = useSelector(selectRoomName);
  const roomDescription = useSelector(selectRoomDescription);

  return(
    <>
      <CompactLayout noPadding>
        <Room
          key={roomId}
          roomId={roomId}
        />
      </CompactLayout>
    </>
  );
};
export default memo(RoomPage);
