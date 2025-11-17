import React, { memo } from 'react';
import { Key, ChevronRight } from 'lucide-react';
import type { AuthorizationRequest } from '../types';

interface AuthorizationRequestCardProps {
  request: AuthorizationRequest;
  onOpen: () => void;
}

export const AuthorizationRequestCard = memo<AuthorizationRequestCardProps>(
  ({ request, onOpen }) => {
    const isSecretsType = request.meta_data?.type === 'secrets';
    
    const requestTitle = isSecretsType
      ? request.meta_data?.requested_secrets?.[0]?.label || 'API Credentials'
      : request?.name || 'Connection Request';

    const formatTime = (dateString: string): string => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    return (
      <button
        onClick={onOpen}
        className="auth-shimmer w-full px-2 py-1.5 flex items-center justify-between gap-2 border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-900">
            <Key className="auth-pulse h-3 w-3 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {requestTitle}
            </p>
          </div>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-500 font-mono flex-shrink-0">
            {formatTime(request.date_creation)}
          </span>
        </div>
        <ChevronRight className="h-3 w-3 text-neutral-400 dark:text-neutral-600 flex-shrink-0 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors" />
      </button>
    );
  },
);

AuthorizationRequestCard.displayName = 'AuthorizationRequestCard';

