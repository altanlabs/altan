/**
 * Authorization Section
 * Displays authorization requests within the action cockpit
 */

import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { Key } from 'lucide-react';

import { AuthorizationRequestCard, AuthorizationRequestDialog } from '../../authorization-requests/components';
import { useAuthorizationRequests } from '../../authorization-requests/hooks/useAuthorizationRequests';
import { selectMembers } from '../../../redux/slices/room/selectors/memberSelectors';
import { selectAuthorizationRequests } from '../../../redux/slices/room/selectors/roomSelectors';

interface AuthorizationSectionProps {
  accountId: string | null;
}

const AuthorizationSection: React.FC<AuthorizationSectionProps> = ({ accountId }) => {
  const authorizations = useSelector(selectAuthorizationRequests);
  const members = useSelector(selectMembers);

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
      <div className="space-y-1">
        {authorizations.map((request) => (
          <AuthorizationRequestCard
            key={request.id}
            request={request}
            onOpen={() => openRequest(request)}
          />
        ))}
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

export default memo(AuthorizationSection);
export { AuthorizationSection };

