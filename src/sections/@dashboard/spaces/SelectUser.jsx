import { List, Select, Stack, MenuItem, Typography } from '@mui/material';
import { memo, useState } from 'react';

// @mui
// auth
// components
import { useSelector } from 'react-redux';

import { CustomAvatar } from '../../../components/custom-avatar';
import MenuPopover from '../../../components/menu-popover';

// ----------------------------------------------------------------------

const SelectUser = ({ assignedUserId, assignUser, minimal = false }) => {
  const { account } = useSelector((state) => state.general);
  let allAccountUsers = [];
  if (account.type === 'business')
    allAccountUsers = [...account.organisation?.users, { user: account.owner, role: 'Owner' }];
  const baseUrl = 'https://storage.googleapis.com/logos-chatbot-optimai/user/';
  const assignedUserObj =
    allAccountUsers.find((userObj) => userObj.user.id === assignedUserId) || null;
  const [openPopover, setOpenPopover] = useState(null);
  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleAssignUser = (userId) => {
    assignUser(userId || null);
    handleClosePopover();
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{ m: 1 }}
      >
        <CustomAvatar
          src={
            assignedUserObj?.user?.id
              ? baseUrl + assignedUserObj.user.id
              : 'https://storage.googleapis.com/logos-chatbot-optimai/Z.png'
          }
          alt={assignedUserObj?.user?.first_name}
          name={assignedUserObj?.user?.first_name}
          onClick={handleOpenPopover}
          sx={{ cursor: 'pointer' }}
        />

        {!minimal && (
          <Stack>
            <Typography variant="caption">Assigned to:</Typography>
            <Typography
              variant="subtitle2"
              sx={{ textTransform: 'capitalize' }}
            >
              {assignedUserObj?.user?.first_name} {assignedUserObj?.user?.last_name}
            </Typography>
          </Stack>
        )}
      </Stack>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        arrow="top-left"
        sx={{ p: 0 }}
      >
        <List sx={{ px: 1 }}>
          <MenuItem>
            <Select
              native
              fullWidth
              value={assignedUserObj ? assignedUserObj.user.id : ''}
              onChange={(event) => {
                handleAssignUser(event.target.value || null);
              }}
              sx={{
                '& .MuiInputBase-input': {
                  p: 0,
                  pl: 2,
                  typography: 'body2',
                  textTransform: 'capitalize',
                },
                '& .MuiNativeSelect-icon': {
                  right: -16,
                  top: 'unset',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  display: 'none',
                },
              }}
            >
              <option
                value=""
                disabled
              >
                Select a user
              </option>
              <option value="">None</option>
              {allAccountUsers.map((userObj) => (
                <option
                  key={userObj.user.id}
                  value={userObj.user.id}
                >
                  {userObj.user.first_name} {userObj.user.last_name}
                </option>
              ))}
            </Select>
          </MenuItem>
        </List>
      </MenuPopover>
    </>
  );
};

export default memo(SelectUser);
