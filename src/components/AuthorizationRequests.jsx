import { memo, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectAccountId } from '../redux/slices/general.js';
import { selectAuthorizationRequests } from '../redux/slices/room.js';
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
    } catch (error) {
      console.error('Error rejecting authorization request:', error);
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
    } catch (error) {
      console.error('Error submitting secrets:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authorizations?.length) {
    return null;
  }

  return (
    <div className="flex flex-col sm:w-[90%] md:w-[92%] max-w-[500px] mx-auto">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-2 py-1.5 cursor-pointer bg-[#1a1a1a] dark:bg-[#1a1a1a] border border-gray-800 dark:border-gray-800 backdrop-blur-xl text-gray-100 dark:text-gray-100 transition-all duration-200 hover:bg-[#202020] dark:hover:bg-[#202020] hover:border-gray-700 dark:hover:border-gray-700 rounded-tl-lg rounded-tr-lg"
      >
        <div className="flex items-center gap-1.5 rounded px-1 py-0.5 duration-150">
          <Iconify
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="w-3.5 h-3.5 text-gray-400 dark:text-gray-400 transition-transform duration-150"
          />
          <span className="text-xs font-medium">
            {authorizations.length} Authorization Request{authorizations.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Iconify
          icon="mdi:key-alert"
          className="text-amber-500 dark:text-amber-400 w-4 h-4"
        />
      </div>
      <div
        className={`transition-[max-height,opacity] duration-200 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-[#1a1a1a] dark:bg-[#1a1a1a] border-x border-b border-gray-800 dark:border-gray-800 backdrop-blur-xl divide-y divide-gray-800 dark:divide-gray-800">
          {authorizations.map((request) => (
            <div key={request.id}>
              {expandedRequest?.id === request.id ? (
                <div className="p-3">
                  {request.meta_data?.type === 'secrets' ? (
                    // Secrets form
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 mb-3">
                        <Iconify
                          icon="mdi:key-variant"
                          className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-100">
                            Secret Authorization Required
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Please provide the requested credentials
                          </p>
                        </div>
                      </div>
                      {request.meta_data.requested_secrets?.map((secret) => (
                        <div
                          key={secret.key}
                          className="space-y-1.5"
                        >
                          <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                            {secret.label}
                            {secret.required && <span className="text-red-400">*</span>}
                          </label>
                          {secret.description && (
                            <p className="text-[10px] text-gray-500 leading-tight">
                              {secret.description}
                            </p>
                          )}
                          <input
                            type={secret.type || 'text'}
                            placeholder={secret.placeholder}
                            value={secretValues[secret.key] || ''}
                            onChange={(e) => handleSecretChange(secret.key, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#0f0f0f] border border-gray-700 rounded text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600/50 transition-colors"
                            required={secret.required}
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setExpandedRequest(null)}
                          className="flex-1 px-3 py-1.5 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded text-xs font-medium transition-colors duration-150 border border-gray-700"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitSecrets(request)}
                          className="flex-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-xs font-medium transition-colors duration-150 border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Authorize'}
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
                <div className="flex items-center justify-between p-2 hover:bg-[#202020] dark:hover:bg-[#202020] transition-colors duration-150">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      {request.meta_data?.type === 'secrets' && (
                        <Iconify
                          icon="mdi:key-variant"
                          className="w-3 h-3 text-amber-400"
                        />
                      )}
                      <span className="text-xs text-gray-100 dark:text-gray-100 font-medium">
                        {request.meta_data?.type === 'secrets'
                          ? `Secret Request: ${request.meta_data.requested_secrets?.[0]?.label || 'Credentials'}`
                          : request?.name || 'New Connection Request'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                      {new Date(request.date_creation).toLocaleDateString()}{' '}
                      {new Date(request.date_creation).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReject(request)}
                      className="px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded flex items-center gap-1 text-xs transition-colors duration-150 border border-red-500/30"
                    >
                      <Iconify
                        icon="mdi:close"
                        className="w-3 h-3"
                      />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(request)}
                      className="px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded flex items-center gap-1 text-xs transition-colors duration-150 border border-emerald-500/30"
                    >
                      <Iconify
                        icon="mdi:check"
                        className="w-3 h-3"
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
