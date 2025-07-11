import { memo } from 'react';
import { useParams } from 'react-router-dom';

import Room from '../components/room/Room.jsx';
import useResponsive from '../hooks/useResponsive';
import { CompactLayout } from '../layouts/dashboard/index.js';
import {
  selectRoomAttribute,
} from '../redux/slices/room';
import { useSelector } from '../redux/store';

const selectRoomName = selectRoomAttribute('name');
const selectRoomDescription = selectRoomAttribute('description');

const RoomPage = () => {
  const { roomId } = useParams();
  const roomName = useSelector(selectRoomName);
  const roomDescription = useSelector(selectRoomDescription);
  const isMobile = useResponsive('down', 'md');

  return(
    <>
      <CompactLayout title={roomName} description={roomDescription} noPadding>
        <Room
          key={roomId}
          roomId={roomId}
          isMobile={isMobile}
        />
      </CompactLayout>
    </>
  );
};
export default memo(RoomPage);
