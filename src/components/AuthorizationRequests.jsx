import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { selectAccountId } from '../redux/slices/general.js';
import { selectAuthorizationRequests, sendMessage } from '../redux/slices/room.js';
import { dispatch } from '../redux/store.js';
import { optimai_integration } from '../utils/axios.js';
import Iconify from './iconify/Iconify.jsx';
import CreateConnection from './tools/CreateConnection.jsx';

const AuthorizationRequests = () => {
  const accountId = useSelector(selectAccountId);
  const authorizations = useSelector(selectAuthorizationRequests);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [secretValues, setSecretValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();
  const location = useLocation();


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
    try {
      const response = await optimai_integration.patch(
        `/authorization-request/${request.id}/reject`,
      );
      if (response.status === 200) {
        // Reset expanded state
        if (expandedRequest?.id === request.id) {
          setExpandedRequest(null);
        }
      }
    } catch {
      // Error rejecting authorization request
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

    // Send help message to the thread
    const helpMessage = 'I need help with this authorization request. Can you give me step-by-step instructions on how to find and provide the required credentials?';

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
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/50 dark:border-amber-900/30 backdrop-blur-xl text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5 hover:border-amber-300/60 dark:hover:border-amber-800/40 rounded-xl shadow-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30">
            <Iconify
              icon="mdi:key-alert"
              className="text-amber-600 dark:text-amber-400 w-4.5 h-4.5"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Authorization Required
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {authorizations.length} pending request{authorizations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <Iconify
          icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
          className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300"
        />
      </div>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-white/80 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800/60 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden divide-y divide-gray-200/60 dark:divide-gray-800/60">
          {authorizations.map((request) => (
            <div key={request.id}>
              {expandedRequest?.id === request.id ? (
                <div className="p-5 bg-gradient-to-br from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/20">
                  {request.meta_data?.type === 'secrets' ? (
                    // Secrets form
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 pb-3 border-b border-gray-200/60 dark:border-gray-700/60">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30 border border-amber-500/30 dark:border-amber-500/40 shadow-sm">
                          <Iconify
                            icon="mdi:key-variant"
                            className="w-5 h-5 text-amber-600 dark:text-amber-400"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Secret Authorization Required
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                Please provide the requested credentials to continue
                              </p>
                            </div>
                            <button
                              onClick={() => handleGetHelp(request)}
                              className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 border border-blue-200 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-800/60 shadow-sm hover:shadow active:scale-[0.98] whitespace-nowrap"
                              title="Get step-by-step help with this authorization"
                            >
                              <Iconify
                                icon="mdi:help-circle"
                                className="w-3.5 h-3.5"
                              />
                              Get Help
                            </button>
                          </div>
                        </div>
                      </div>
                      {request.meta_data.requested_secrets?.map((secret) => (
                        <div
                          key={secret.key}
                          className="space-y-2"
                        >
                          <label className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                            {secret.label}
                            {secret.required && <span className="text-red-500 dark:text-red-400 text-sm">*</span>}
                          </label>
                          {secret.description && (
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed -mt-1">
                              {secret.description}
                            </p>
                          )}
                          <input
                            type={secret.type || 'text'}
                            placeholder={secret.placeholder}
                            value={secretValues[secret.key] || ''}
                            onChange={(e) => handleSecretChange(secret.key, e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-950/50 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 focus:ring-2 focus:ring-amber-400/20 dark:focus:ring-amber-600/20 transition-all duration-200 shadow-sm hover:border-gray-400 dark:hover:border-gray-600"
                            required={secret.required}
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-3 pt-3">
                        <button
                          onClick={() => setExpandedRequest(null)}
                          className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-semibold transition-all duration-200 border border-gray-300 dark:border-gray-700 shadow-sm hover:shadow active:scale-[0.98]"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitSecrets(request)}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Authorizing...
                            </span>
                          ) : (
                            'Authorize'
                          )}
                        </button>
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
                <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200 group">
                  <div className="flex items-center gap-3 flex-1">
                    {request.meta_data?.type === 'secrets' && (
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30 group-hover:bg-amber-500/15 dark:group-hover:bg-amber-500/25 transition-colors">
                        <Iconify
                          icon="mdi:key-variant"
                          className="w-4 h-4 text-amber-600 dark:text-amber-400"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                        {request.meta_data?.type === 'secrets'
                          ? request.meta_data.requested_secrets?.[0]?.label || 'API Credentials'
                          : request?.name || 'New Connection Request'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(request.date_creation).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })} • {new Date(request.date_creation).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGetHelp(request)}
                      className="px-3 py-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 border border-blue-200 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-800/60 shadow-sm hover:shadow active:scale-[0.98]"
                      title="Get step-by-step help with this authorization"
                    >
                      <Iconify
                        icon="mdi:help-circle"
                        className="w-3.5 h-3.5"
                      />
                      Help
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      className="px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 border border-red-200 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800/60 shadow-sm hover:shadow active:scale-[0.98]"
                    >
                      <Iconify
                        icon="mdi:close"
                        className="w-3.5 h-3.5"
                      />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(request)}
                      className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 border border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800/60 shadow-sm hover:shadow active:scale-[0.98]"
                    >
                      <Iconify
                        icon="mdi:check"
                        className="w-3.5 h-3.5"
                      />
                      View
                    </button>
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
