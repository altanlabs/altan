import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
} from '@mui/material';
import React, { useState, useEffect } from 'react';

import { useSnackbar } from '../../../../components/snackbar';
import { getTable, addUserToAccount } from '../../../../redux/slices/superadmin';
import { dispatch } from '../../../../redux/store';

function AddUser({ accountId }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectChange = (event) => {
    const user = data.find((u) => u.id === event.target.value);
    setSelectedUser(user);
  };

  const handleCreate = () => {
    console.log('Selected User:', selectedUser);
    dispatch(addUserToAccount(accountId, selectedUser.id))
      .then((user) => {
        enqueueSnackbar(`Successfully created user ${user.id}`, { variant: 'success' });
        handleClose();
      })
      .catch((error) => {
        enqueueSnackbar(`Failed to create user: ${error.message}`, { variant: 'error' });
      });
  };

  useEffect(() => {
    if (open) {
      console.log('Fetching data because dialog opened');
      dispatch(getTable('Users'))
        .then((data) => setData(data.result))
        .catch((e) =>
          enqueueSnackbar('There was an error fetching the data.', { variant: 'error' }),
        );
    }
  }, [open]); // This useEffect will run when 'open' changes

  console.log(data);
  return (
    <>
      <Button onClick={handleClickOpen}>Add User</Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>Add user to account</DialogTitle>
        <DialogContent>
          <Autocomplete
            sx={{ my: 1 }}
            value={selectedUser}
            onChange={(event, newValue) => {
              setSelectedUser(newValue);
            }}
            options={data || []}
            getOptionLabel={(option) => option.email || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search user by email"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="soft"
            onClick={handleCreate}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AddUser;
