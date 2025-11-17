import React, { memo } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface PlanStateProps {
  message: string;
  type: 'loading' | 'error';
}

const PlanState: React.FC<PlanStateProps> = ({ message, type }) => {
  const isError = type === 'error';
  
  return (
    <div className="w-full max-w-[700px] mx-auto my-4">
      <div className={`
        bg-white dark:bg-neutral-950 
        border border-neutral-200 dark:border-neutral-800 
        rounded-md 
        shadow-sm 
        p-3
      `}>
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertCircle className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-900 dark:text-neutral-100" />
          )}
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};

export const LoadingState: React.FC = memo(() => (
  <PlanState message="Loading plan..." type="loading" />
));

export const ErrorState: React.FC = memo(() => (
  <PlanState message="Plan rejected" type="error" />
));

