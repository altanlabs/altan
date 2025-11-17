import { ChevronDown, ChevronUp, Key } from 'lucide-react';
import React, { memo, useState } from 'react';
import { useSelector } from 'react-redux';

import { AuthorizationRequestCard, AuthorizationRequestDialog } from './components';
import { useAuthorizationRequests } from './hooks/useAuthorizationRequests';
import { useVisibilityOptimization } from './hooks/useVisibilityOptimization';
import { selectAccountId } from '../../redux/slices/general/index';
import { selectMembers } from '../../redux/slices/room/selectors/memberSelectors';
import { selectAuthorizationRequests } from '../../redux/slices/room/selectors/roomSelectors';
import './styles.css';

const AuthorizationRequests: React.FC = () => {
  const accountId = useSelector(selectAccountId);
  const authorizations = useSelector(selectAuthorizationRequests);
  const members = useSelector(selectMembers);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Pause animations when not visible for performance
  const containerRef = useVisibilityOptimization();

  const {
    selectedRequest,
    secretValues,
    isSubmitting,
    openRequest,
    closeRequest,
    handleReject,
    handleSecretChange,
    handleSubmitSecrets,
    handleGetHelp,
    isFormValid,
  } = useAuthorizationRequests({ members });

  // Don't render if no account or no requests
  if (!accountId || !authorizations?.length) {
    return null;
  }

  const handleRejectCurrent = (): void => {
    if (selectedRequest) {
      handleReject(selectedRequest);
    }
  };

  const handleSubmitCurrent = (): void => {
    if (selectedRequest) {
      handleSubmitSecrets(selectedRequest);
    }
  };

  const handleGetHelpCurrent = (): void => {
    if (selectedRequest) {
      handleGetHelp(selectedRequest);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="flex flex-col sm:w-[95%] md:w-[96%] max-w-[520px] mx-auto mb-4"
      >
        {/* Collapsible Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="auth-shimmer flex items-center justify-between px-2 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-900">
              <Key className="auth-pulse h-3 w-3 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                Authorization Required
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-500 font-mono">
                {authorizations.length} pending
              </span>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 text-neutral-400 dark:text-neutral-600" />
          ) : (
            <ChevronDown className="h-3 w-3 text-neutral-400 dark:text-neutral-600" />
          )}
        </button>

        {/* Request List - Max Height with Overflow */}
        {isExpanded && (
          <div className="mt-1 max-h-[280px] overflow-y-auto space-y-1 pr-0.5">
            {authorizations.map((request) => (
              <AuthorizationRequestCard
                key={request.id}
                request={request}
                onOpen={() => openRequest(request)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <AuthorizationRequestDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && closeRequest()}
        onReject={handleRejectCurrent}
        onSubmit={handleSubmitCurrent}
        onGetHelp={handleGetHelpCurrent}
        secretValues={secretValues}
        onSecretChange={handleSecretChange}
        isSubmitting={isSubmitting}
        isFormValid={selectedRequest ? isFormValid(selectedRequest) : false}
        accountId={accountId}
      />
    </>
  );
};

export default memo(AuthorizationRequests);

