import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  ListItemAvatar,
  Avatar,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import React, { useCallback, useState, memo, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useHistory } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';

import AccountDetailRow from './AccountDetailRow.tsx';
import { useAuthContext } from '../../../auth/useAuthContext';
import { CustomAvatar } from '../../../components/custom-avatar';
import CustomDialog from '../../../components/dialogs/CustomDialog.jsx';
import Iconify from '../../../components/iconify/Iconify.jsx';
import { useDebounce } from '../../../hooks/useDebounce.js';
import { useFilteredAccounts } from '../../../hooks/useFilteredAccounts.js';
import CreateAccount from '../../../pages/dashboard/superadmin/legacy/CreateAccount.jsx';
import { clearAccountState, selectAccountDetails, setAccount } from '../../../redux/slices/general';
import { searchAccounts } from '../../../redux/slices/superadmin';
import { dispatch, useSelector } from '../../../redux/store';
// import { bgBlur } from '../../../utils/cssStyles';
import addAccountIdToUrl from '../../../utils/addAccountIdToUrl.ts';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme, isDashboard }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '50px',
  padding: theme.spacing(isDashboard ? 0.85 : 2, isDashboard ? 1.5 : 2.5),
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

const selectAllAccountsLoading = (state) => state.superadmin.isLoading.accounts;
const selectAllAccountsInitialized = (state) => state.superadmin.initialized.accounts;
const selectAllAccounts = (state) => state.superadmin.accounts;
const selectAccounts = (state) => state.general.accounts;

function NavAccount({ mini = false, isDashboard = false }) {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuthContext();
  const history = useHistory();
  const account = useSelector(selectAccountDetails);
  const accounts = useSelector(selectAccounts);
  const allAccounts = useSelector(selectAllAccounts);
  const allAccountsInitialized = useSelector(selectAllAccountsInitialized);
  const allAccountsLoading = useSelector(selectAllAccountsLoading);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchById, setSearchById] = useState('');
  const [searchByName, setSearchByName] = useState('');
  const [searchByEmail, setSearchByEmail] = useState('');
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Combine all search terms for debouncing
  const combinedSearchTerm = `${searchById}|${searchByName}|${searchByEmail}`;
  const debouncedSearchQuery = useDebounce(combinedSearchTerm, 500);

  // For superadmins, use search results when searching, otherwise use filtered accounts
  const hasAnySearchTerm = searchById.trim() || searchByName.trim() || searchByEmail.trim();
  const filteredAccounts = useFilteredAccounts({
    allAccounts: user?.xsup && showAllAccounts && hasAnySearchTerm ? searchResults : allAccounts,
    accounts,
    searchTerm: user?.xsup && showAllAccounts && hasAnySearchTerm ? '' : searchTerm, // Don't double-filter if using search results
    showAllAccounts,
  });

  console.log('🎯 Debug info:', {
    hasAnySearchTerm,
    searchResultsCount: searchResults.length,
    filteredAccountsCount: filteredAccounts.length,
    isSupadmin: user?.xsup,
    showAllAccounts,
    searchResults: searchResults.slice(0, 2), // Log first 2 results for inspection
  });

  const name = useMemo(() => account?.name || user?.first_name, [account?.name, user?.first_name]);

  const handleClick = useCallback(() => setOpen(true), []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearchTerm('');
    setSearchById('');
    setSearchByName('');
    setSearchByEmail('');
    setSearchResults([]);
  }, []);

  // Search accounts using the new endpoint for superadmins
  const performSearch = useCallback(async () => {
    if (!user?.xsup || !showAllAccounts) {
      setSearchResults([]);
      return;
    }

    const searchParams = {};
    if (searchById.trim()) searchParams.id = searchById.trim();
    if (searchByName.trim()) searchParams.name = searchByName.trim();
    if (searchByEmail.trim()) searchParams.owner_email = searchByEmail.trim();

    if (Object.keys(searchParams).length === 0) {
      setSearchResults([]);
      return;
    }

    console.log('🔍 Searching with params:', searchParams);
    setIsSearching(true);
    try {
      const results = await dispatch(searchAccounts(searchParams));
      console.log('📥 Raw search results:', results);
      setSearchResults(results || []);
      console.log('✅ Search results set:', results?.length || 0, 'accounts');
    } catch (error) {
      console.error('❌ Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user?.xsup, showAllAccounts, searchById, searchByName, searchByEmail]);

  // Effect to perform search when debounced query changes
  useEffect(() => {
    if (user?.xsup && showAllAccounts) {
      performSearch();
    }
  }, [debouncedSearchQuery, user?.xsup, showAllAccounts, performSearch]);

  // Remove the old getAllAccounts logic since we're now using search
  const superAdminAccounts = useCallback(() => {
    // No longer needed - we use search instead
  }, []);

  useEffect(() => {
    // Remove the automatic fetching of all accounts
    // if (user?.xsup && showAllAccounts && !allAccountsInitialized && !allAccountsLoading) {
    //   superAdminAccounts();
    // }
  }, [showAllAccounts, user?.xsup, allAccountsInitialized, allAccountsLoading, superAdminAccounts]);

  const handleChangeAccount = useCallback(
    (id) => {
      // Determine the source of accounts based on the switch state and search mode
      let sourceAccounts;
      if (showAllAccounts && hasAnySearchTerm) {
        // When searching, use search results
        sourceAccounts = searchResults;
      } else if (showAllAccounts) {
        // When showing all accounts but not searching, use allAccounts
        sourceAccounts = allAccounts;
      } else {
        // When showing user's accounts, use accounts
        sourceAccounts = accounts;
      }
      // Find the selected account from the appropriate list
      const selectedAccount = sourceAccounts.find((elem) => elem?.id === id);

      if (selectedAccount?.id !== account?.id) {
        localStorage.setItem('lastLocation', location.pathname);
        // disconnect();
        dispatch(clearAccountState());
        dispatch(setAccount(selectedAccount));
        localStorage.setItem('OAIPTACC', id);
      } else {
        console.log('⚠️ Account already selected or not found');
      }
      handleClose();
      history.replace('/');
    },
    [accounts, allAccounts, searchResults, account, location, handleClose, history, showAllAccounts, hasAnySearchTerm],
  );

  const handleSwitchChange = useCallback((event) => setShowAllAccounts(event.target.checked), []);

  const renderAvatar = useMemo(
    () =>
      !!account?.id && (
        <CustomAvatar
          src={addAccountIdToUrl(account?.logo_url, account.id)}
          alt={name}
          name={name}
          sx={{ background: theme.palette.background.neutral, height: '40px' }}
        />
      ),
    [account?.logo_url, account?.id, name, theme.palette.background.neutral],
  );

  // Don't render if user is not available
  if (!user) {
    return null;
  }

  return (
    <>
      {!mini ? (
        <StyledRoot
          isDashboard={isDashboard}
          onClick={(event) => {
            event.stopPropagation();
            handleClick();
          }}
        >
          {renderAvatar}
          <Box sx={{ ml: 2, minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
            >
              {name}
            </Typography>
          </Box>
          <Iconify
            icon="hugeicons:exchange-01"
            width={16}
            sx={{ ml: 2, mb: -0.2 }}
          />
        </StyledRoot>
      ) : (
        <Tooltip
          arrow
          followCursor
          title={`Switch workspace. Current: ${name}`}
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
      <CustomDialog
        dialogOpen={open}
        onClose={handleClose}
        aria-labelledby="account-dialog-title"
        className="max-w-xs"
      >
        <DialogTitle
          id="account-dialog-title"
          sx={{
            padding: 2,
          }}
        >
          Switch Workspace
          {!!user?.xsup && (
            <FormControlLabel
              control={
                <Switch
                  checked={showAllAccounts}
                  onChange={handleSwitchChange}
                  name="showAllAccounts"
                  color="primary"
                />
              }
              label="All Accounts"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent
          sx={{
            padding: 1,
          }}
        >
          <Stack
            direction="column"
            spacing={1}
            padding={1}
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 99,
            }}
          >
            {user?.xsup && showAllAccounts ? (
              <>
                <TextField
                  size="small"
                  margin="dense"
                  id="account-search-id"
                  label="Search by ID..."
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={searchById}
                  onChange={(e) => setSearchById(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="mdi:identifier"
                          width={20}
                          height={20}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  size="small"
                  margin="dense"
                  id="account-search-name"
                  label="Search by name..."
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={searchByName}
                  onChange={(e) => setSearchByName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="mdi:account"
                          width={20}
                          height={20}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  size="small"
                  margin="dense"
                  id="account-search-email"
                  label="Search by owner email..."
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={searchByEmail}
                  onChange={(e) => setSearchByEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon={isSearching ? 'eos-icons:loading' : 'mdi:email'}
                          width={20}
                          height={20}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <TextField
                autoFocus
                size="small"
                margin="dense"
                id="account-search"
                label="Search..."
                type="text"
                fullWidth
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            )}
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
              EmptyPlaceholder: () => (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px',
                    p: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {user?.xsup && showAllAccounts
                      ? 'Search by account name, email, or ID to find accounts'
                      : 'No accounts found'}
                  </Typography>
                </Box>
              ),
            }}
            overscan={2}
            increaseViewportBy={{ bottom: 0, top: 0 }}
            itemContent={(index, item) =>
              !!user?.xsup ? (
                <AccountDetailRow
                  key={item.id}
                  account={item}
                  handleChangeAccount={handleChangeAccount}
                  searchTerm={debouncedSearchQuery}
                />
              ) : (
                <ListItemButton
                  key={item.id}
                  onClick={() => handleChangeAccount(item.id)}
                >
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
                      <Avatar src={addAccountIdToUrl(item?.logo_url, item.id)} />
                    </ListItemAvatar>
                    <ListItemText primary={item?.name} />
                  </Stack>
                </ListItemButton>
              )}
          />
        </DialogContent>
        <DialogActions>
          <CreateAccount />
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
}

export default memo(NavAccount);
