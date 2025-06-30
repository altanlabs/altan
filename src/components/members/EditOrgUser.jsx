import { Stack, Button, Grid, Avatar, Typography, Container } from '@mui/material';
import { memo, useState } from 'react';

// @mui
import { useHistory } from 'react-router';

import useFeedbackDispatch from '../../hooks/useFeedbackDispatch';
import DeleteDialog from '../../pages/dashboard/superadmin/tables/DeleteDialog';
import { deleteOrganisationUser } from '../../redux/slices/general';
import { useSelector } from '../../redux/store';

const UserProfileCard = ({ profileData }) => {
  console.log(profileData);
  return (
    <Grid
      container
      padding={2}
      rowSpacing={1}
    >
      <Grid
        item
        xs={6}
        sm={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Avatar
          sx={{ width: 150, height: 200 }}
          src={profileData?.avatar_url}
          name={profileData?.first_name}
          variant="rounded"
        />
      </Grid>
      <Grid
        item
        xs={12}
        sm={8}
        sx={{
          display: 'flex',
          gap: 1,
        }}
      >
        <Stack>
          <Typography variant="h5">
            {profileData?.first_name} {profileData?.last_name}
          </Typography>
          <Typography>{profileData?.birthday}</Typography>

          <Typography>{profileData?.about}</Typography>
        </Stack>
      </Grid>
    </Grid>
  );
};

const selectOrgId = (state) => state.general.account?.organisation_id;

function EditOrgUser({ user }) {
  const history = useHistory();;
  const organisationId = useSelector(selectOrgId);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [dispatchWithFeedback, isSubmitting] = useFeedbackDispatch();
  const handleDelete = () => {
    dispatchWithFeedback(deleteOrganisationUser(organisationId, user.id), {
      successMessage: 'User deleted from organisation successfully',
      errorMessage: 'Unexpected error: ',
      useSnackbar: false,
      useConsole: true,
    }).then(() => history.push('/platform/members'));
  };
  console.log(user);
  return (
    <Container>
      <UserProfileCard profileData={user?.person} />
      <Stack
        direction="row"
        sx={{ alignItems: 'center', mx: 8 }}
        spacing={2}
      >
        <Button
          variant="soft"
          disabled
        >
          {' '}
          Edit permissions{' '}
        </Button>
        <Button
          variant="soft"
          color="error"
          onClick={() => setDeleteDialog(true)}
        >
          {' '}
          Delete user{' '}
        </Button>
      </Stack>

      <DeleteDialog
        openDeleteDialog={deleteDialog}
        handleCloseDeleteDialog={() => setDeleteDialog(false)}
        confirmDelete={handleDelete}
        isSubmitting={isSubmitting}
        message="Are you sure you want to delete the user from your organisation?"
      />
    </Container>
  );
}

export default memo(EditOrgUser);
