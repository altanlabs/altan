import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import Room from '../components/room/Room.jsx';
import { selectRoomAttribute } from '../redux/slices/room';
import { useSelector } from '../redux/store';

const selectRoomName = selectRoomAttribute('name');
const selectRoomDescription = selectRoomAttribute('description');

export default function StandaloneRoomPage() {
  const { roomId } = useParams();

  const roomName = useSelector(selectRoomName);
  const roomDescription = useSelector(selectRoomDescription);

  return (
    <>
      <Helmet>
        <title>{roomName}</title>
        <meta
          name="description"
          content={roomDescription}
        />
      </Helmet>

      <Room
        key={roomId}
        roomId={roomId}
      />
    </>
  );
}
