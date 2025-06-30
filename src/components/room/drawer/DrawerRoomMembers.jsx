// import { Typography } from '@mui/material';
import { memo } from 'react';

import { selectRoomAttribute } from '../../../redux/slices/room';
import { useSelector } from '../../../redux/store.js';
import RoomMembers from '../members/RoomMembers.jsx';
import MemberInviteDialog from './MemberInviteDialog.jsx';

const selectIsDM = selectRoomAttribute('is_dm');
const selectRoomId = selectRoomAttribute('id');

const DrawerRoomMembers = () => {
  // const totalMembers = useSelector(selectTotalMembers);
  const isDm = useSelector(selectIsDM);
  const roomId = useSelector(selectRoomId);

  if (!roomId) {
    return null;
  }

  return (
    <div className="p-2 flex flex-wrap gap-2 flex-row justify-between items-center">
      {/* <Typography variant="caption"> Members ({totalMembers}) </Typography> */}
      <RoomMembers />
      <MemberInviteDialog />
    </div>
  );
};

export default memo(DrawerRoomMembers);
