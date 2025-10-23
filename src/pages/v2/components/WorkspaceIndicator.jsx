import React, { memo, useState, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

import { CustomAvatar } from '../../../components/custom-avatar';
import { useFilteredAccounts } from '../../../hooks/useFilteredAccounts';
import { clearAccountState, selectAccountDetails, setAccount } from '../../../redux/slices/general';
import { dispatch } from '../../../redux/store';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../../auth/useAuthContext';
import addAccountIdToUrl from '../../../utils/addAccountIdToUrl';

const selectAccounts = (state) => state.general.accounts;

const WorkspaceIndicator = () => {
  const history = useHistory();
  const location = useLocation();
  const { user } = useAuthContext();
  const account = useSelector(selectAccountDetails);
  const accounts = useSelector(selectAccounts);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAccounts = useFilteredAccounts({
    allAccounts: [],
    accounts,
    searchTerm,
    showAllAccounts: false,
  });

  const handleChangeAccount = useCallback(
    (id) => {
      const selectedAccount = accounts.find((elem) => elem?.id === id);

      if (selectedAccount?.id !== account?.id) {
        localStorage.setItem('lastLocation', location.pathname);
        dispatch(clearAccountState());
        dispatch(setAccount(selectedAccount));
        localStorage.setItem('OAIPTACC', id);
      }
      setShowSwitcher(false);
      history.replace('/v2');
    },
    [accounts, account, location, history],
  );

  if (!user || !account) {
    return null;
  }

  const name = account?.name || user?.first_name;

  return (
    <div className="relative">
      <button
        onClick={() => setShowSwitcher(!showSwitcher)}
        className="flex items-center gap-2.5 rounded-xl hover:bg-white/15 dark:hover:bg-white/10 transition-all group pt-2.5"
      >
        <CustomAvatar
          src={addAccountIdToUrl(account?.logo_url, account.id)}
          alt={name}
          name={name}
          sx={{ width: 28, height: 28 }}
        />
        <span className="text-sm font-medium text-foreground max-w-[150px] truncate">
          {name}
        </span>
        <svg 
          className={`w-4 h-4 text-muted-foreground transition-transform ${showSwitcher ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Workspace Switcher Dropdown */}
      <AnimatePresence>
        {showSwitcher && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowSwitcher(false)}
            />
            
            {/* Dropdown Menu */}
            <m.div
              className="absolute top-full left-0 mt-2 w-80 bg-background rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Switch Workspace
                </h3>
                
                {/* Search */}
                {accounts.length > 3 && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search workspaces..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pl-9 bg-muted text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <svg 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Workspace List */}
              <div className="max-h-[400px] overflow-y-auto">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleChangeAccount(workspace.id)}
                      className={`w-full p-3 flex items-center gap-3 hover:bg-accent transition-colors ${
                        workspace.id === account?.id ? 'bg-accent' : ''
                      }`}
                    >
                      <CustomAvatar
                        src={addAccountIdToUrl(workspace?.logo_url, workspace.id)}
                        alt={workspace.name}
                        name={workspace.name}
                        sx={{ width: 36, height: 36 }}
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {workspace.name}
                        </p>
                        {workspace.id === account?.id && (
                          <p className="text-xs text-primary">
                            Current
                          </p>
                        )}
                      </div>
                      {workspace.id === account?.id && (
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No workspaces found
                    </p>
                  </div>
                )}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(WorkspaceIndicator);

