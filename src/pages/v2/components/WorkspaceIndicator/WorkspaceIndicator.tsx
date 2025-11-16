import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { ChevronDown, Plus } from 'lucide-react';
import { useAuthContext } from '../../../../auth/useAuthContext';
import { CustomAvatar } from '../../../../components/custom-avatar';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useFilteredAccounts } from '../../../../hooks/useFilteredAccounts';
import AccountDetailRow from '../../../../layouts/dashboard/nav/AccountDetailRow';
import {
  clearAccountState,
  selectAccountDetails,
  setAccount,
  createAccount,
} from '../../../../redux/slices/general/index';
import { dispatch } from '../../../../redux/store';
import addAccountIdToUrl from '../../../../utils/addAccountIdToUrl';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkspaceSearch } from './useWorkspaceSearch';
import { useWorkspaceSwitcher } from './useWorkspaceSwitcher';
import { SearchFields } from './SearchFields';
import { WorkspaceList } from './WorkspaceList';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import type { Account } from './types';

const selectAccounts = (state: any) => state.general.accounts;

const WorkspaceIndicator = () => {
  const history = useHistory();
  const location = useLocation();
  const { user } = useAuthContext();
  const account = useSelector(selectAccountDetails);
  const accounts = useSelector(selectAccounts);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { isOpen, open, close, toggle } = useWorkspaceSwitcher();

  const {
    searchById,
    searchByName,
    searchByEmail,
    searchResults,
    isSearching,
    setSearchById,
    setSearchByName,
    setSearchByEmail,
    performSearch,
    clearSearch,
    hasAnySearchTerm,
  } = useWorkspaceSearch({
    isSuperAdmin: Boolean(user?.xsup),
    showAllAccounts,
  });

  // Combine search terms for debouncing
  const combinedSearchTerm = useMemo(
    () => `${searchById}|${searchByName}|${searchByEmail}`,
    [searchById, searchByName, searchByEmail]
  );
  const debouncedSearchQuery = useDebounce(combinedSearchTerm, 800);

  // Perform search when debounced query changes
  useEffect(() => {
    if (user?.xsup && showAllAccounts && debouncedSearchQuery) {
      performSearch();
    }
  }, [debouncedSearchQuery, user?.xsup, showAllAccounts, performSearch]);

  // Filter accounts based on mode
  const filteredAccounts = useFilteredAccounts({
    allAccounts: user?.xsup && showAllAccounts && hasAnySearchTerm ? searchResults : [],
    accounts,
    searchTerm: user?.xsup && showAllAccounts && hasAnySearchTerm ? '' : searchTerm,
    showAllAccounts,
  });

  const displayName = useMemo(
    () => account?.name || user?.first_name || 'Workspace',
    [account?.name, user?.first_name]
  );

  const handleClose = useCallback(() => {
    close();
    setSearchTerm('');
    clearSearch();
  }, [close, clearSearch]);

  const handleChangeAccount = useCallback(
    (id: string) => {
      const sourceAccounts = showAllAccounts && hasAnySearchTerm ? searchResults : accounts;
      const selectedAccount = sourceAccounts.find((elem: Account) => elem?.id === id);

      if (selectedAccount?.id !== account?.id) {
        localStorage.setItem('lastLocation', location.pathname);
        dispatch(clearAccountState());
        dispatch(setAccount(selectedAccount));
        localStorage.setItem('OAIPTACC', id);
      }
      handleClose();
      history.replace('/');
    },
    [accounts, searchResults, account, location, history, showAllAccounts, hasAnySearchTerm, handleClose]
  );

  const handleCreateWorkspace = useCallback(
    (name: string) => {
      dispatch(createAccount({ name })).then(() => {
        setIsCreateDialogOpen(false);
        window.location.href = '/';
        window.location.reload();
      });
    },
    []
  );

  const emptyMessage = useMemo(() => {
    if (user?.xsup && showAllAccounts) {
      return 'Search by account name, email, or ID to find accounts';
    }
    return 'No workspaces found';
  }, [user?.xsup, showAllAccounts]);

  if (!user || !account) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={(open) => (open ? open : handleClose())}>
        <PopoverTrigger asChild>
          <button
            onClick={toggle}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg',
              'hover:bg-accent/50 transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-ring'
            )}
          >
            <CustomAvatar
              src={addAccountIdToUrl(account?.logo_url, account.id)}
              alt={account.name}
              name={account.name}
              sx={{ width: 24, height: 24 }}
            />
            <span className="text-sm font-medium max-w-[140px] truncate">{displayName}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[320px] p-0 border-border/50"
          align="start"
          sideOffset={8}
        >
          <div className="p-3 border-b border-border/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Switch Workspace</h3>
              {user?.xsup && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-muted-foreground">All</span>
                  <Switch
                    checked={showAllAccounts}
                    onCheckedChange={setShowAllAccounts}
                    className="scale-90"
                  />
                </label>
              )}
            </div>
            <SearchFields
              isSuperAdmin={Boolean(user?.xsup)}
              showAllAccounts={showAllAccounts}
              isSearching={isSearching}
              searchTerm={searchTerm}
              searchById={searchById}
              searchByName={searchByName}
              searchByEmail={searchByEmail}
              onSearchTermChange={setSearchTerm}
              onSearchByIdChange={setSearchById}
              onSearchByNameChange={setSearchByName}
              onSearchByEmailChange={setSearchByEmail}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            <WorkspaceList
              workspaces={filteredAccounts}
              currentAccountId={account?.id}
              onSelectWorkspace={handleChangeAccount}
              isSuperAdmin={user?.xsup}
              showAllAccounts={showAllAccounts}
              emptyMessage={emptyMessage}
              AccountDetailComponent={AccountDetailRow}
            />
          </div>

          {user?.xsup && (
            <div className="p-2 border-t border-border/50">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-9"
                onClick={() => {
                  setIsCreateDialogOpen(true);
                  handleClose();
                }}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Create Workspace</span>
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateWorkspace}
      />
    </>
  );
};

export default memo(WorkspaceIndicator);

