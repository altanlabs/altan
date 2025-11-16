import {
  Box,
  List,
  useTheme,
  ListItemButton,
  Avatar,
  Typography,
  Popover,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useCallback, useState, memo } from 'react';

import { useAuthContext } from '../../../auth/useAuthContext.ts';
import { CustomAvatar } from '../../../components/custom-avatar';
import Iconify from '../../../components/iconify/Iconify';
import { selectAccounts, clearAccountState } from '../../../redux/slices/general/index.ts';
import { useSelector, dispatch } from '../../../redux/store.ts';
// ----------------------------------------------------------------------

const NavAccountSelector = ({ selected, setSelected, disabled = false }) => {
  const theme = useTheme();
  const { user } = useAuthContext();
  const accounts = useSelector(selectAccounts);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const name = selected?.company?.name || selected?.name || 'The Boring Company';
  const id = open ? 'account-popover' : null;
  const accountsIds = Object.keys(accounts ?? {});
  const accountsLength = accountsIds.length;
  const handleClick = useCallback(
    (event) => {
      if (!disabled && accountsLength > 1) setAnchorEl(event.currentTarget);
    },
    [accountsLength, setAnchorEl, disabled],
  );

  const handleClose = useCallback(
    (_) => {
      setAnchorEl(null);
    },
    [setAnchorEl],
  );

  const handleChangeAccount = useCallback(
    (id) => {
      if (!!id && selected?.id !== id && accountsLength) {
        const acc = accounts[id];
        if (!!acc) {
          // Clear account state before switching
          dispatch(clearAccountState());
          setSelected(acc);
        }
      }
      setAnchorEl(null);
    },
    [accountsLength, selected, setSelected, setAnchorEl],
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(2, 2.5),
          borderRadius: '10px',
          backgroundColor: alpha(theme.palette.grey[500], 0.12),
          height: 40,
          ...(accountsLength > 1 &&
            !disabled && {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[500], 0.3),
            },
          }),
          WebkitTransition: 'background-color 500ms linear',
          MozTransition: 'background-color 500ms linear',
          msTransition: 'background-color 500ms linear',
          transition: 'background-color 500ms linear',
        }}
        onClick={handleClick}
      >
        {!!selected?.id && (
          <CustomAvatar
            src={selected?.company?.logo_url}
            alt={name}
            name={name}
            sx={{
              background: theme.palette.background.neutral,
              width: 30,
              height: 30,
            }}
          />
        )}
        <Box sx={{ ml: 2, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            noWrap
          >
            {name}
          </Typography>
        </Box>
        {accountsLength > 1 && !disabled && (
          <Iconify
            icon="tabler:triangle-filled"
            rotate={2}
            width={12}
            sx={{ ml: 2, mb: 0.1 }}
          />
        )}
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box sx={{ minWidth: 200 }}>
          <List>
            {accountsIds
              .filter((id) => id !== selected?.id)
              .map((id) => {
                const elem = accounts[id];
                return (
                  <ListItemButton
                    key={id}
                    onClick={() => handleChangeAccount(id)}
                    sx={{
                      height: 40,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                        width: '100%',
                        paddingY: 2,
                      }}
                    >
                      <Avatar
                        src={elem?.company?.logo_url}
                        sx={{ width: 25, height: 25 }}
                      />
                      <Typography>
                        {elem?.company?.name ||
                          elem?.name ||
                          elem.meta_data?.name ||
                          elem.meta_data?.displayName ||
                          user?.first_name}
                      </Typography>
                    </Stack>
                  </ListItemButton>
                );
              })}
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default memo(NavAccountSelector);
