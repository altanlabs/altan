import { Check } from 'lucide-react';
import { CustomAvatar } from '../../../../components/custom-avatar';
import { cn } from '@/lib/utils';
import addAccountIdToUrl from '../../../../utils/addAccountIdToUrl';
import type { Account } from './types';

interface WorkspaceListProps {
  workspaces: Account[];
  currentAccountId?: string;
  onSelectWorkspace: (id: string) => void;
  isSuperAdmin?: boolean;
  showAllAccounts?: boolean;
  emptyMessage?: string;
  AccountDetailComponent?: React.ComponentType<{
    account: Account;
    handleChangeAccount: (id: string) => void;
  }>;
}

const WorkspaceItem = ({
  workspace,
  isActive,
  onClick,
}: {
  workspace: Account;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full p-2 flex items-center gap-3 rounded-md transition-colors',
      'hover:bg-accent/50',
      isActive && 'bg-accent'
    )}
  >
    <CustomAvatar
      src={addAccountIdToUrl(workspace?.logo_url, workspace.id)}
      alt={workspace.name}
      name={workspace.name}
      sx={{ width: 32, height: 32 }}
    />
    <div className="flex-1 text-left min-w-0">
      <p className="text-sm font-medium truncate">{workspace.name}</p>
      {isActive && <p className="text-xs text-muted-foreground">Current</p>}
    </div>
    {isActive && <Check className="h-4 w-4 text-foreground" />}
  </button>
);

export const WorkspaceList = ({
  workspaces,
  currentAccountId,
  onSelectWorkspace,
  isSuperAdmin,
  showAllAccounts,
  emptyMessage = 'No workspaces found',
  AccountDetailComponent,
}: WorkspaceListProps) => {
  if (workspaces.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {workspaces.map((workspace) => {
        if (isSuperAdmin && showAllAccounts && AccountDetailComponent) {
          return (
            <AccountDetailComponent
              key={workspace.id}
              account={workspace}
              handleChangeAccount={onSelectWorkspace}
            />
          );
        }

        return (
          <WorkspaceItem
            key={workspace.id}
            workspace={workspace}
            isActive={workspace.id === currentAccountId}
            onClick={() => onSelectWorkspace(workspace.id)}
          />
        );
      })}
    </div>
  );
};

