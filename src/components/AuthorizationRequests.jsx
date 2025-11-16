import { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import Iconify from './iconify/Iconify.jsx';
import CreateConnection from './tools/CreateConnection.jsx';
import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Label } from './ui/label.tsx';
import { selectAccountId } from '../redux/slices/general/index.ts';
import { selectMembers } from '../redux/slices/room/selectors/memberSelectors';
import { selectAuthorizationRequests } from '../redux/slices/room/selectors/roomSelectors';
import { removeAuthorizationRequest } from '../redux/slices/room/slices/roomSlice';
import { sendMessage } from '../redux/slices/room/thunks/messageThunks';
import { dispatch } from '../redux/store.ts';
import { optimai_integration } from '../utils/axios.js';

const AuthorizationRequests = () => {
  const accountId = useSelector(selectAccountId);
  const authorizations = useSelector(selectAuthorizationRequests);
  const members = useSelector(selectMembers);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [secretValues, setSecretValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();
  const location = useLocation();

  // Auto-expand if there's only one authorization request
  useEffect(() => {
    if (authorizations?.length === 1 && !expandedRequest) {
      setIsExpanded(true);
      const request = authorizations[0];
      setExpandedRequest(request);

      // Initialize secret values for secrets type
      if (request.meta_data?.type === 'secrets' && request.meta_data?.requested_secrets) {
        const initialValues = {};
        request.meta_data.requested_secrets.forEach((secret) => {
          initialValues[secret.key] = '';
        });
        setSecretValues(initialValues);
      }
    }
  }, [authorizations, expandedRequest]);

  // Don't render if no account ID (prevents crashes during loading)
  if (!accountId) {
    return null;
  }

  const handleAccept = (request) => {
    setExpandedRequest(request);
    // Initialize secret values for secrets type
    if (request.meta_data?.type === 'secrets' && request.meta_data?.requested_secrets) {
      const initialValues = {};
      request.meta_data.requested_secrets.forEach((secret) => {
        initialValues[secret.key] = '';
      });
      setSecretValues(initialValues);
    }
  };

  const handleReject = async (request) => {
    // Immediately remove from Redux state to make UI responsive
    dispatch(removeAuthorizationRequest(request.id));

    // Reset expanded state
    if (expandedRequest?.id === request.id) {
      setExpandedRequest(null);
    }

    // Make API call in the background
    try {
      await optimai_integration.patch(
        `/authorization-request/${request.id}/reject`,
      );
    } catch {
      // Error rejecting authorization request - could add error handling here
    }
  };

  const handleSecretChange = (key, value) => {
    setSecretValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmitSecrets = async (request) => {
    setIsSubmitting(true);
    try {
      const response = await optimai_integration.patch(
        `/authorization-request/${request.id}/complete`,
        {
          provided_secrets: secretValues,
        },
      );
      if (response.status === 200) {
        setExpandedRequest(null);
        setSecretValues({});
      }
    } catch {
      // Error submitting secrets
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetHelp = (request) => {
    const threadId = request.callback_id;
    if (!threadId) return;

    // Navigate to the thread
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('thread_id', threadId);
    history.push({
      pathname: location.pathname,
      search: searchParams.toString(),
    });

    // Find the Services agent
    const servicesAgent = Object.values(members.byId || {}).find(
      (member) => member?.member?.agent?.name === 'Services',
    );
    // Build help message with agent mention if found
    let helpMessage = 'I need help with this authorization request. Can you give me step-by-step instructions on how to find and provide the required credentials?';

    if (servicesAgent) {
      const mentionText = `**[@Services](/member/${servicesAgent.id})**`;
      helpMessage = `${mentionText}\n${helpMessage}`;
    }

    // Small delay to ensure thread is loaded before sending message
    setTimeout(() => {
      dispatch(
        sendMessage({
          threadId,
          content: helpMessage,
          attachments: [],
        }),
      );
    }, 500);
  };

  if (!authorizations?.length) {
    return null;
  }

  return (
    <div className="flex flex-col sm:w-[95%] md:w-[96%] max-w-[520px] mx-auto mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/10 dark:to-blue-900/5 border border-blue-200/40 dark:border-blue-900/20 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-blue-300/50 dark:hover:border-blue-800/30 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/15">
            <Iconify
              icon="mdi:key-alert"
              className="text-blue-600 dark:text-blue-400 w-5 h-5"
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground">
              Authorization Required
            </span>
            <span className="text-xs text-muted-foreground">
              {authorizations.length} pending request{authorizations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <Iconify
          icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
          className="w-5 h-5 text-muted-foreground transition-transform duration-200"
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[600px] overflow-y-auto opacity-100 mt-3' : 'max-h-0 overflow-hidden opacity-0'}`}
      >
        <div className="bg-card/50 border border-border backdrop-blur-sm rounded-xl shadow-sm overflow-hidden divide-y divide-border/50">
          {authorizations.map((request) => (
            <div key={request.id}>
              {expandedRequest?.id === request.id ? (
                <div className="p-5 bg-accent/30">
                  {request.meta_data?.type === 'secrets' ? (
                    // Secrets form
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 pb-4 border-b border-border/50">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/15">
                          <Iconify
                            icon="mdi:key-variant"
                            className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">
                                Secret Authorization Required
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                Please provide the requested credentials to continue
                              </p>
                            </div>
                            <Button
                              onClick={() => handleGetHelp(request)}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              title="Get step-by-step help with this authorization"
                            >
                              <Iconify
                                icon="mdi:help-circle"
                                className="w-4 h-4 mr-1.5"
                              />
                              Help
                            </Button>
                          </div>
                        </div>
                      </div>
                      {request.meta_data.requested_secrets?.map((secret) => (
                        <div
                          key={secret.key}
                          className="space-y-2"
                        >
                          <Label className="text-xs font-medium flex items-center gap-1.5">
                            {secret.label}
                            {secret.required && (
                              <span className="text-destructive">*</span>
                            )}
                          </Label>
                          {secret.description && (
                            <p className="text-[11px] text-muted-foreground -mt-1">
                              {secret.description}
                            </p>
                          )}
                          <Input
                            type={secret.type || 'text'}
                            placeholder={secret.placeholder}
                            value={secretValues[secret.key] || ''}
                            onChange={(e) => handleSecretChange(secret.key, e.target.value)}
                            required={secret.required}
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          onClick={() => handleReject(request)}
                          variant="outline"
                          className="flex-1"
                          disabled={isSubmitting}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleSubmitSecrets(request)}
                          className="flex-1"
                          disabled={
                            isSubmitting ||
                            !request.meta_data.requested_secrets?.every(
                              (secret) =>
                                !secret.required ||
                                (secretValues[secret.key] && secretValues[secret.key].trim() !== ''),
                            )
                          }
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg
                                className="animate-spin h-4 w-4"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Authorizing...
                            </span>
                          ) : (
                            'Authorize'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Connection form
                    <CreateConnection
                      id={request.connection_type_id}
                      accountId={accountId}
                      external_id={request.id}
                      popup={true}
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-all duration-200 group">
                  <div className="flex items-center gap-3 flex-1">
                    {request.meta_data?.type === 'secrets' && (
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors">
                        <Iconify
                          icon="mdi:key-variant"
                          className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-sm text-foreground font-semibold">
                        {request.meta_data?.type === 'secrets'
                          ? request.meta_data.requested_secrets?.[0]?.label || 'API Credentials'
                          : request?.name || 'New Connection Request'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.date_creation).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(request.date_creation).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleGetHelp(request)}
                      variant="outline"
                      size="sm"
                      title="Get step-by-step help with this authorization"
                    >
                      <Iconify
                        icon="mdi:help-circle"
                        className="w-3.5 h-3.5 mr-1"
                      />
                      Help
                    </Button>
                    <Button
                      onClick={() => handleReject(request)}
                      variant="destructive"
                      size="sm"
                    >
                      <Iconify
                        icon="mdi:close"
                        className="w-3.5 h-3.5 mr-1"
                      />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleAccept(request)}
                      size="sm"
                    >
                      <Iconify
                        icon="mdi:check"
                        className="w-3.5 h-3.5 mr-1"
                      />
                      View
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(AuthorizationRequests);
