import React, { memo } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../../../ui/button';
import type { AuthorizationData } from '../types';

interface AuthorizedStateProps {
  authData: AuthorizationData;
  onClear: () => void;
}

export const AuthorizedState = memo<AuthorizedStateProps>(({ authData, onClear }) => {
  return (
    <div className="px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-100 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Authorized
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
              {authData.connectionName}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-6 w-6 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex-shrink-0"
          aria-label="Change authorization"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

AuthorizedState.displayName = 'AuthorizedState';

