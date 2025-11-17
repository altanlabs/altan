import { useState, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { dispatch } from '../../../redux/store';
import { removeAuthorizationRequest } from '../../../redux/slices/room/slices/roomSlice';
import { sendMessage } from '../../../redux/slices/room/thunks/messageThunks';
import { optimai_integration } from '../../../utils/axios';
import type { AuthorizationRequest, SecretValues, MembersState } from '../types';

interface UseAuthorizationRequestsParams {
  members: MembersState;
}

interface UseAuthorizationRequestsReturn {
  selectedRequest: AuthorizationRequest | null;
  secretValues: SecretValues;
  isSubmitting: boolean;
  openRequest: (request: AuthorizationRequest) => void;
  closeRequest: () => void;
  handleReject: (request: AuthorizationRequest) => Promise<void>;
  handleSecretChange: (key: string, value: string) => void;
  handleSubmitSecrets: (request: AuthorizationRequest) => Promise<void>;
  handleGetHelp: (request: AuthorizationRequest) => void;
  isFormValid: (request: AuthorizationRequest) => boolean;
}

export function useAuthorizationRequests({
  members,
}: UseAuthorizationRequestsParams): UseAuthorizationRequestsReturn {
  const [selectedRequest, setSelectedRequest] = useState<AuthorizationRequest | null>(null);
  const [secretValues, setSecretValues] = useState<SecretValues>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const openRequest = useCallback((request: AuthorizationRequest) => {
    setSelectedRequest(request);
    
    // Initialize secret values
    if (request.meta_data?.type === 'secrets' && request.meta_data?.requested_secrets) {
      const initialValues: SecretValues = {};
      request.meta_data.requested_secrets.forEach((secret) => {
        initialValues[secret.key] = '';
      });
      setSecretValues(initialValues);
    }
  }, []);

  const closeRequest = useCallback(() => {
    setSelectedRequest(null);
    setSecretValues({});
  }, []);

  const handleReject = useCallback(async (request: AuthorizationRequest) => {
    // Remove from Redux immediately
    dispatch(removeAuthorizationRequest(request.id));
    
    // Close dialog if this request is open
    if (selectedRequest?.id === request.id) {
      closeRequest();
    }

    // Background API call
    try {
      await optimai_integration.patch(`/authorization-request/${request.id}/reject`);
    } catch {
      // Silent failure
    }
  }, [selectedRequest, closeRequest]);

  const handleSecretChange = useCallback((key: string, value: string) => {
    setSecretValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSubmitSecrets = useCallback(async (request: AuthorizationRequest) => {
    setIsSubmitting(true);
    try {
      const response = await optimai_integration.patch(
        `/authorization-request/${request.id}/complete`,
        { provided_secrets: secretValues },
      );
      if (response.status === 200) {
        closeRequest();
      }
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  }, [secretValues, closeRequest]);

  const handleGetHelp = useCallback(
    (request: AuthorizationRequest) => {
      const threadId = request.callback_id;
      if (!threadId) return;

      // Navigate to thread
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('thread_id', threadId);
      history.push({
        pathname: location.pathname,
        search: searchParams.toString(),
      });

      // Find Services agent
      const servicesAgent = Object.values(members.byId || {}).find(
        (member) => member?.member?.agent?.name === 'Services',
      );

      let helpMessage =
        'I need help with this authorization request. Can you give me step-by-step instructions on how to find and provide the required credentials?';

      if (servicesAgent) {
        const mentionText = `**[@Services](/member/${servicesAgent.id})**`;
        helpMessage = `${mentionText}\n${helpMessage}`;
      }

      // Delay to ensure thread loads
      setTimeout(() => {
        dispatch(
          sendMessage({
            threadId,
            content: helpMessage,
            attachments: [],
          }),
        );
      }, 500);
    },
    [members, location, history],
  );

  const isFormValid = useCallback(
    (request: AuthorizationRequest): boolean => {
      if (request.meta_data?.type !== 'secrets' || !request.meta_data.requested_secrets) {
        return true;
      }

      return request.meta_data.requested_secrets.every((secret) => {
        if (!secret.required) return true;
        const value = secretValues[secret.key];
        return value && value.trim() !== '';
      });
    },
    [secretValues],
  );

  return {
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
  };
}

