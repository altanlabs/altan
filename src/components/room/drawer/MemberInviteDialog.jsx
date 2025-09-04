import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Typography,
  Button,
  DialogContent,
  Divider,
  Box,
  Chip,
  TextField,
  IconButton,
  Alert,
} from '@mui/material';
import React, { useMemo, useState, useCallback, memo } from 'react';

import CustomDialog from '../../../components/dialogs/CustomDialog.jsx';
import Iconify from '../../../components/iconify/Iconify.jsx';
import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch.js';
import { createInvitation, selectRoles } from '../../../redux/slices/general';
import { inviteMembersOrGuests, selectMe } from '../../../redux/slices/room';
import { dispatch, useSelector } from '../../../redux/store';
import MembersAutocomplete from '../../members/MembersAutocomplete.jsx';

const MemberInviteDialog = () => {
  const me = useSelector(selectMe);
  const { byName: roles, byId } = useSelector(selectRoles);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(['RegularUser']);
  const [invitationLink, setInvitationLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const isViewer = useMemo(() => !!me && ['viewer', 'listener'].includes(me.role), [me]);

  const handleOpen = useCallback(() => setDialogOpen(true), []);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setInvitationLink(null);
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!invitationLink) return;
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Failed to copy text
    }
  }, [invitationLink]);

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

  const handleRoleToggle = useCallback((roleName) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName],
    );
  }, []);

  const handleCreateInviteLink = useCallback(() => {
    if (!selectedRoles.length) return;

    const meta_data = {
      expiration: '7 days',
      max_uses: 10,
    };

    dispatchWithFeedback(
      createInvitation(
        'workspace',
        'link',
        selectedRoles.map((r) => roles[r]),
        null,
        null,
        meta_data,
      ),
      {
        successMessage: 'Invitation link created successfully.',
        errorMessage: 'Error creating invitation link.',
        useSnackbar: true,
      },
    ).then((response) => {
      if (response.invitation_url) {
        setInvitationLink(response.invitation_url);
      }
      setSelectedRoles(['RegularUser']);
    });
  }, [roles, selectedRoles, dispatchWithFeedback]);

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
              sx={{ textAlign: 'center', mb: 1 }}
            >
              Invite People
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: 'center', mb: 3, color: 'text.secondary' }}
            >
              Invite existing workspace members or external collaborators
            </Typography>

            {/* Existing Workspace Members Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Workspace Members
              </Typography>
              <Typography
                variant="caption"
                sx={{ mb: 2, display: 'block', color: 'text.secondary' }}
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
                sx={{ mt: 2 }}
                onClick={handleSendInvite}
                disabled={selectedMemberIds.length === 0}
              >
                Send Invite
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                OR
              </Typography>
            </Divider>

            {/* External Collaborators Section */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                External Collaborators
              </Typography>
              <Typography
                variant="caption"
                sx={{ mb: 2, display: 'block', color: 'text.secondary' }}
              >
                Invite people who aren&apos;t part of your workspace yet
              </Typography>

              {/* Role Selection */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500 }}
                >
                  Select Roles
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.values(byId || {}).map((role) => (
                    <Chip
                      key={role.name}
                      label={role.name}
                      onClick={() => handleRoleToggle(role.name)}
                      color={selectedRoles.includes(role.name) ? 'primary' : 'default'}
                      variant={selectedRoles.includes(role.name) ? 'filled' : 'outlined'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              {/* Create Invitation Link */}
              <LoadingButton
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={handleCreateInviteLink}
                loading={isSubmitting}
                disabled={!selectedRoles.length}
                startIcon={<Iconify icon="mdi:link-plus" />}
              >
                Create Invite Link
              </LoadingButton>

              {/* Display Generated Link */}
              {invitationLink && (
                <Alert
                  severity="success"
                  sx={{ mt: 2 }}
                  action={
                    <IconButton
                      onClick={handleCopy}
                      color={copied ? 'success' : 'inherit'}
                      size="small"
                    >
                      {copied ? <DoneIcon /> : <ContentCopyIcon />}
                    </IconButton>
                  }
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, mb: 1 }}
                  >
                    Invitation link created successfully!
                  </Typography>
                  <TextField
                    fullWidth
                    value={invitationLink}
                    size="small"
                    InputProps={{
                      readOnly: true,
                      sx: { fontSize: '0.75rem' },
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Share this link with others to invite them to join your workspace
                  </Typography>
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
      </CustomDialog>
    </>
  );
};

export default memo(MemberInviteDialog);
