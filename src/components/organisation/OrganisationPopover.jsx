import {
  Box,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import React, { useCallback, useState, memo, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { selectAccountDetails, selectAccount } from '../../redux/slices/general/index.ts';
// import { bgBlur } from '../../../utils/cssStyles';
import { useSelector } from '../../redux/store.ts';
import addAccountIdToUrl from '../../utils/addAccountIdToUrl.ts';
import { CustomAvatar } from '../custom-avatar';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: theme.spacing(0.5, 2),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
  cursor: 'pointer',
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[500], 0.16),
    boxShadow: `0 0 0 1px ${alpha(theme.palette.grey[500], 0.24)}`,
  },
}));

// ----------------------------------------------------------------------

const getAccountName = (account) =>
  account?.name ||
  account?.meta_data?.name ||
  account?.meta_data?.displayName;
const selectAccounts = (state) => state.general.accounts;
const selectOrganisation = (state) => selectAccount(state)?.organisation;

const renderContext = (selected) => (index, item) => (
  <ListItemButton key={item.id}>
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <ListItemAvatar>
        <Avatar src={addAccountIdToUrl(item?.company?.logo_url, item.id)} />
      </ListItemAvatar>
      <ListItemText
        primary={getAccountName(item)}
        secondary={
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <Chip
              size="small"
              label="Transfer"
              sx={{
                height: 15,
                fontSize: '0.7rem',
              }}
            />
            <Chip
              size="small"
              label="Switch"
              sx={{
                height: 15,
                fontSize: '0.7rem',
              }}
            />
            <Chip
              size="small"
              label="Delete"
              icon={
                <Iconify
                  icon="mdi:trash"
                  width={10}
                />
              }
              color="error"
              sx={{
                height: 15,
                fontSize: '0.7rem',
              }}
            />
          </Stack>
        }
      />
    </Stack>
  </ListItemButton>
);

function OrganisationPopover({ mini = false }) {
  const theme = useTheme();

  const organisation = useSelector(selectOrganisation);
  const account = useSelector(selectAccountDetails);
  const accounts = useSelector(selectAccounts);

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const name = useMemo(() => organisation?.name ?? 'Organisation', [organisation?.name]);

  const handleClick = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearchTerm('');
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (elem) =>
        elem.organisation?.id === organisation?.id &&
        getAccountName(elem)?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [accounts, organisation?.id, searchTerm]);

  const renderAvatar = !!account?.id && (
    <CustomAvatar
      src={addAccountIdToUrl(account?.company?.logo_url, account.id)}
      alt={name}
      name={name}
      sx={{ background: theme.palette.background.neutral }}
    />
  );

  const currentAccountName = useMemo(() => getAccountName(account), [account]);

  if (!organisation?.id) {
    return (
      <Button
        size="small"
        variant="soft"
        color="inherit"
        disabled
      >
        Create Organisation
      </Button>
    );
  }

  return (
    <>
      {!mini ? (
        <StyledRoot
          onClick={(event) => {
            event.stopPropagation();
            handleClick();
          }}
        >
          {renderAvatar}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
            >
              {name}
            </Typography>
          </Box>
          <Iconify
            icon="mdi:info"
            width={16}
            sx={{ ml: 2, mb: -0.2 }}
          />
        </StyledRoot>
      ) : (
        <Tooltip
          arrow
          followCursor
          title={`${name}. Current workspace: ${currentAccountName}`}
        >
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handleClick();
            }}
          >
            {renderAvatar}
          </IconButton>
        </Tooltip>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="account-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          id="account-dialog-title"
          sx={{
            padding: 2,
          }}
        >
          Organisation: {name}
        </DialogTitle>
        <DialogContent
          sx={{
            padding: 1,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            padding={1}
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 99,
            }}
          >
            <TextField
              autoFocus
              margin="dense"
              id="account-search"
              label="Search..."
              type="text"
              size="small"
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify
                      icon="eva:search-fill"
                      width={20}
                      height={20}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Virtuoso
            style={{
              width: '100%',
              height: '55vh',
              maxWidth: '100%',
              scrollBehavior: 'smooth',
              overflowX: 'hidden',
            }}
            data={filteredAccounts}
            components={{
              Footer: () => <div style={{ height: '10px' }} />,
              Header: () => <div style={{ height: '10px' }} />,
            }}
            overscan={2}
            increaseViewportBy={{ bottom: 0, top: 0 }}
            itemContent={renderContext}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(OrganisationPopover);
