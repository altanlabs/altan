import React, { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button as MuiButton,
  Typography,
} from '@mui/material';

import { CustomAvatar } from '../../../components/custom-avatar';
import { useFilteredAccounts } from '../../../hooks/useFilteredAccounts';
import { clearAccountState, selectAccountDetails, setAccount, createAccount } from '../../../redux/slices/general';
import { dispatch } from '../../../redux/store';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../../auth/useAuthContext';
import addAccountIdToUrl from '../../../utils/addAccountIdToUrl';
import { useDebounce } from '../../../hooks/useDebounce';
import { searchAccounts } from '../../../redux/slices/superadmin';
import AccountDetailRow from '../../../layouts/dashboard/nav/AccountDetailRow.tsx';
import CustomDialog from '../../../components/dialogs/CustomDialog';

const selectAccounts = (state) => state.general.accounts;
const selectAllAccounts = (state) => state.superadmin.accounts;

const WorkspaceIndicator = () => {
  const history = useHistory();
  const location = useLocation();
  const { user } = useAuthContext();
  const account = useSelector(selectAccountDetails);
  const accounts = useSelector(selectAccounts);
  const allAccounts = useSelector(selectAllAccounts);

  const searchTimeoutRef = useRef(null);
  const isSearchingRef = useRef(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchById, setSearchById] = useState('');
  const [searchByName, setSearchByName] = useState('');
  const [searchByEmail, setSearchByEmail] = useState('');
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Combine all search terms for debouncing
  const combinedSearchTerm = useMemo(
    () => `${searchById}|${searchByName}|${searchByEmail}`,
    [searchById, searchByName, searchByEmail]
  );
  const debouncedSearchQuery = useDebounce(combinedSearchTerm, 800);

  // Check if any search term is active
  const hasAnySearchTerm = useMemo(
    () => Boolean(searchById.trim() || searchByName.trim() || searchByEmail.trim()),
    [searchById, searchByName, searchByEmail]
  );

  // For superadmins, use search results when searching, otherwise use filtered accounts
  const filteredAccounts = useFilteredAccounts({
    allAccounts: user?.xsup && showAllAccounts && hasAnySearchTerm ? searchResults : allAccounts,
    accounts,
    searchTerm: user?.xsup && showAllAccounts && hasAnySearchTerm ? '' : searchTerm,
    showAllAccounts,
  });

  const name = useMemo(() => account?.name || user?.first_name, [account?.name, user?.first_name]);

  const handleClose = useCallback(() => {
    setShowSwitcher(false);
    setSearchTerm('');
    setSearchById('');
    setSearchByName('');
    setSearchByEmail('');
    setSearchResults([]);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Perform search function
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

    if (isSearchingRef.current) {
      return;
    }

    isSearchingRef.current = true;
    setIsSearching(true);

    try {
      const results = await dispatch(searchAccounts(searchParams));
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      isSearchingRef.current = false;
    }
  }, [user?.xsup, showAllAccounts, searchById, searchByName, searchByEmail]);

  // Effect to perform search when debounced query changes
  useEffect(() => {
    if (user?.xsup && showAllAccounts && debouncedSearchQuery) {
      performSearch();
    }
  }, [debouncedSearchQuery, user?.xsup, showAllAccounts, performSearch]);

  const handleChangeAccount = useCallback(
    (id) => {
      // Determine the source of accounts based on the switch state and search mode
      let sourceAccounts;
      if (showAllAccounts && hasAnySearchTerm) {
        sourceAccounts = searchResults;
      } else if (showAllAccounts) {
        sourceAccounts = allAccounts;
      } else {
        sourceAccounts = accounts;
      }

      const selectedAccount = sourceAccounts.find((elem) => elem?.id === id);

      if (selectedAccount?.id !== account?.id) {
        localStorage.setItem('lastLocation', location.pathname);
        dispatch(clearAccountState());
        dispatch(setAccount(selectedAccount));
        localStorage.setItem('OAIPTACC', id);
      }
      handleClose();
      history.replace('/');
    },
    [accounts, allAccounts, searchResults, account, location, history, showAllAccounts, hasAnySearchTerm, handleClose]
  );

  const handleSwitchChange = useCallback((event) => {
    setShowAllAccounts(event.target.checked);
  }, []);

  const handleOpenCreateDialog = useCallback(() => {
    setOpenCreateDialog(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setOpenCreateDialog(false);
    setNewWorkspaceName('');
  }, []);

  const handleCreateWorkspace = useCallback(() => {
    dispatch(createAccount({ name: newWorkspaceName })).then(() => {
      handleCloseCreateDialog();
      window.location.href = '/';
      window.location.reload();
    });
  }, [newWorkspaceName, handleCloseCreateDialog]);

  if (!user || !account) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSwitcher(!showSwitcher)}
        className="flex items-center gap-2.5 rounded-xl hover:bg-white/15 dark:hover:bg-white/10 transition-all group"
      >
        <CustomAvatar
          src={addAccountIdToUrl(account?.logo_url, account.id)}
          alt={account.name}
          name={account.name}
          sx={{ width: 28, height: 28 }}
        />
        <span className="text-sm font-medium text-foreground max-w-[150px] truncate">{name}</span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${showSwitcher ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Workspace Switcher Dropdown */}
      <AnimatePresence>
        {showSwitcher && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={handleClose} />

            {/* Dropdown Menu */}
            <m.div
              className="absolute top-full left-0 mt-2 w-[310px] rounded-2xl bg-gray-50 dark:bg-black/90 p-0 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="bg-white dark:bg-gray-100/10 backdrop-blur-lg rounded-2xl shadow border border-gray-200 dark:border-gray-700/20">
                {/* Header */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Switch Workspace</h3>
                    {user?.xsup && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-gray-500 dark:text-gray-400">All Accounts</span>
                        <input
                          type="checkbox"
                          checked={showAllAccounts}
                          onChange={handleSwitchChange}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </label>
                    )}
                  </div>

                  {/* Search Fields */}
                  {user?.xsup && showAllAccounts ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by ID..."
                          value={searchById}
                          onChange={(e) => setSearchById(e.target.value)}
                          className="w-full px-3 py-2 pl-9 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Icon
                          icon="mdi:identifier"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by name..."
                          value={searchByName}
                          onChange={(e) => setSearchByName(e.target.value)}
                          className="w-full px-3 py-2 pl-9 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Icon
                          icon="mdi:account"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by owner email..."
                          value={searchByEmail}
                          onChange={(e) => setSearchByEmail(e.target.value)}
                          className="w-full px-3 py-2 pl-9 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Icon
                          icon={isSearching ? 'eos-icons:loading' : 'mdi:email'}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 pl-9 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Icon
                        icon="eva:search-fill"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                  )}
                </div>

                {/* Workspace List */}
                <div className="max-h-[400px] overflow-y-auto p-1">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((workspace) =>
                      user?.xsup && showAllAccounts ? (
                        <AccountDetailRow
                          key={workspace.id}
                          account={workspace}
                          handleChangeAccount={handleChangeAccount}
                          searchTerm={debouncedSearchQuery}
                        />
                      ) : (
                        <button
                          key={workspace.id}
                          onClick={() => handleChangeAccount(workspace.id)}
                          className={`w-full p-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg ${
                            workspace.id === account?.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                          }`}
                        >
                          <CustomAvatar
                            src={addAccountIdToUrl(workspace?.logo_url, workspace.id)}
                            alt={workspace.name}
                            name={workspace.name}
                            sx={{ width: 36, height: 36 }}
                          />
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {workspace.name}
                            </p>
                            {workspace.id === account?.id && (
                              <p className="text-xs text-primary">Current</p>
                            )}
                          </div>
                          {workspace.id === account?.id && (
                            <Icon icon="mdi:check-circle" className="w-5 h-5 text-primary" />
                          )}
                        </button>
                      )
                    )
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.xsup && showAllAccounts
                          ? 'Search by account name, email, or ID to find accounts'
                          : 'No workspaces found'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Create Workspace Section (SuperAdmin only) */}
              {user?.xsup && (
                <section className="mt-1 p-1 rounded-2xl">
                  <button
                    onClick={handleOpenCreateDialog}
                    className="w-full p-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg text-left"
                  >
                    <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Create Workspace</span>
                  </button>
                </section>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Workspace Dialog */}
      <CustomDialog dialogOpen={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>Create a New Workspace</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            The new workspace will be associated with your user's organisation.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Workspace Name"
            type="text"
            fullWidth
            variant="filled"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleCloseCreateDialog}>Cancel</MuiButton>
          <MuiButton variant="soft" onClick={handleCreateWorkspace}>
            Create
          </MuiButton>
        </DialogActions>
      </CustomDialog>
    </div>
  );
};

export default memo(WorkspaceIndicator);
