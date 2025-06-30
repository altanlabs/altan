import { Stack, Typography, Button, DialogContent } from '@mui/material';
import React, { useMemo, useState, useCallback, memo } from 'react';

import CustomDialog from '../../../components/dialogs/CustomDialog.jsx';
import Iconify from '../../../components/iconify/Iconify.jsx';
import { inviteMembersOrGuests, selectMe } from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store';
import MembersAutocomplete from '../../members/MembersAutocomplete.jsx';

const MemberInviteDialog = () => {
  console.log('rendering member invite dialog');
  const me = useSelector(selectMe);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  const isViewer = useMemo(() => !!me && ['viewer', 'listener'].includes(me.role), [me]);

  const handleOpen = useCallback(() => setDialogOpen(true), []);

  const handleClose = useCallback(() => setDialogOpen(false), []);

  const handleSendInvite = useCallback(() => {
    if (!!isViewer) {
      return;
    }
    const invitation = { members: selectedMemberIds };
    dispatch(inviteMembersOrGuests(invitation)).then(() => {
      setSelectedMemberIds([]);
      setDialogOpen(false);
    });
    // .catch(error => {
    //   console.error('Invitation failed', error);
    // });
  }, [isViewer, selectedMemberIds]);

  return (
    <>
      <Button
        disabled={isViewer}
        onClick={handleOpen}
        startIcon={
          <Iconify
            icon="mdi:user-add"
            width={15}
          />
        }
        variant="soft"
        color="inherit"
        size="small"
      >
        INVITE
      </Button>

      <CustomDialog
        dialogOpen={dialogOpen}
        onClose={handleClose}
      >
        <DialogContent>
          <Stack sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ textAlign: 'center' }}
            >
              Invite member
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ textAlign: 'center', mb: 2 }}
            >
              Agents will be added automatically, users will receive a notification.
            </Typography>

            <MembersAutocomplete
              value={selectedMemberIds}
              onChange={setSelectedMemberIds}
              label="Search members"
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSendInvite}
              disabled={selectedMemberIds.length === 0}
            >
              Send Invite
            </Button>
          </Stack>
        </DialogContent>
      </CustomDialog>
    </>
  );
};

export default memo(MemberInviteDialog);
