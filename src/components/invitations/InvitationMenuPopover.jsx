import { LoadingButton } from '@mui/lab';
import {
  Button,
  Typography,
  TextField,
  Box,
  Divider,
  Chip,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { useCallback, useState, memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useAuthContext } from '../../auth/useAuthContext';
import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import { createInvitation, selectRoles } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';
import HeaderIconButton from '../HeaderIconButton';
import Iconify from '../iconify';
import MenuPopover from '../menu-popover';
import { InvitationLinkDialog } from './InvitationLinkDialog';

const InvitationMenuPopover = ({ isDashboard = false, redirect_url = null }) => {
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const { byName: roles, byId } = useSelector(selectRoles);
  const { user } = useAuthContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const [invitationLink, setInvitationLink] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState(['RegularUser']);

  const methods = useForm({
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const { handleSubmit, register, formState: { errors }, watch } = methods;
  const emailValue = watch('email');

  const handleEmailInvite = useCallback(
    handleSubmit((data) => {
      if (!selectedRoles.length || !data.email) return;

      const meta_data = {
        ...(redirect_url && { redirect_url }),
      };

      dispatchWithFeedback(
        createInvitation(
          'workspace',
          'email',
          selectedRoles.map((r) => roles[r]),
          data.name || data.email.split('@')[0], // Use email prefix as name if no name provided
          data.email,
          meta_data,
        ),
        {
          successMessage: 'Invite sent successfully.',
          errorMessage: 'Error sending invitation.',
          useSnackbar: true,
        },
      ).then(() => {
        methods.reset();
        setSelectedRoles([]);
      });
    }),
    [roles, redirect_url, selectedRoles, methods, dispatchWithFeedback],
  );

  const handleCreateLink = useCallback(() => {
    if (!selectedRoles.length) return;

    const meta_data = {
      expiration: '7 days',
      max_uses: 10,
      ...(redirect_url && { redirect_url }),
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
      setSelectedRoles([]);
    });
  }, [roles, redirect_url, selectedRoles, dispatchWithFeedback]);

  const handleRoleToggle = (roleName) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    );
  };

  const availableRoles = Object.values(byId || {});

  return (
    <>
      <MenuPopover
        open={anchorEl}
        onClose={() => setAnchorEl(null)}
        arrow="right-top"
        sx={{
          width: 380,
          maxHeight: '80vh',
          '& .MuiPaper-root': {
            maxHeight: '80vh',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            p: 1.5,
            maxHeight: '80vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Invite
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Collaborators will use credits from the project owner&apos;s workspace ({user?.displayName || user?.email}&apos;s Workspace)
          </Typography>

          {/* Role Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Roles
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableRoles.map((role) => (
                <Chip
                  key={role.name}
                  label={role.name}
                  onClick={() => handleRoleToggle(role.name)}
                  color={selectedRoles.includes(role.name) ? 'default' : 'default'}
                  variant={selectedRoles.includes(role.name) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <FormProvider {...methods}>
            {/* Email Invitation Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Invite by email
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter email address"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:email-outline" width={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <LoadingButton
                        size="small"
                        variant="contained"
                        onClick={handleEmailInvite}
                        loading={isSubmitting}
                        disabled={!selectedRoles.length || !emailValue}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Send
                      </LoadingButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Divider sx={{ my: 1 }} />

            {/* Link Invitation Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Iconify icon="mdi:link" width={20} sx={{ mt: 0.5, color: 'text.secondary' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Create invite link
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Anyone with this link can join with the selected roles
                  </Typography>
                </Box>
              </Box>
              <LoadingButton
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={handleCreateLink}
                loading={isSubmitting}
                disabled={!selectedRoles.length}
                startIcon={<Iconify icon="mdi:link-plus" />}
              >
                Create Link
              </LoadingButton>
            </Box>
          </FormProvider>
        </Box>
      </MenuPopover>

      {isDashboard ? (
        <Tooltip
          arrow
          followCursor
          title="Invite collaborators"
        >
          <HeaderIconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Iconify
              icon="mdi:account-plus-outline"
              width={18}
              height={18}
            />
          </HeaderIconButton>
        </Tooltip>
      ) : (
        <Button
          size="small"
          variant="standard"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          startIcon={<Iconify icon="mdi:invite" />}
        >
          Invite
        </Button>
      )}

      <InvitationLinkDialog
        open={Boolean(invitationLink)}
        onClose={() => setInvitationLink(null)}
        invitationUrl={invitationLink}
      />
    </>
  );
};

export default memo(InvitationMenuPopover);
