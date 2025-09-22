import { memo, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectAccountId, selectAuthorizationRequests } from '../redux/slices/room.js';
import { optimai_integration } from '../utils/axios.js';
import Iconify from './iconify/Iconify.jsx';
import CreateConnection from './tools/CreateConnection.jsx';

const AuthorizationRequests = () => {
  const accountId = useSelector(selectAccountId);
  const authorizations = useSelector(selectAuthorizationRequests);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAccept = (request) => {
    setExpandedRequest(request);
  };

  const handleReject = async (request) => {
    try {
      const response = await optimai_integration.patch(`/authorization-request/${request.id}/reject`);
      if (response.status === 200) {
      }
    } catch (error) {
      console.error('Error rejecting authorization request:', error);
    }
  };

  if (!authorizations?.length) {
    return null;
  }

  return (
    <div className="flex flex-col sm:w-[90%] md:w-[92%] max-w-[500px] mx-auto">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3 py-2 rounded-t-lg cursor-pointer bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 backdrop-blur-[8px] text-gray-900 dark:text-gray-100 transition-colors duration-200 hover:bg-white/95 dark:hover:bg-gray-800/95 hover:border-gray-300 dark:hover:border-gray-600"
      >
        <div className="flex items-center gap-2 rounded px-2 py-1 duration-150">
          <Iconify
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-150"
          />
          <span className="text-sm font-medium">
            {authorizations.length} Authorization Request{authorizations.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Iconify
          icon="mdi:key-alert"
          className="text-amber-500 dark:text-amber-400 w-5 h-5"
        />
      </div>
      <div
        className={`transition-[max-height,opacity] duration-200 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-white/90 dark:bg-gray-800/90 border-x border-b border-gray-200 dark:border-gray-700 backdrop-blur-[8px] rounded-b-lg divide-y divide-gray-200 dark:divide-gray-700">
          {authorizations.map((request) => (
            <div key={request.id}>
              {expandedRequest?.id === request.id ? (
                <div className="p-2">
                  <CreateConnection
                    id={request.connection_type_id}
                    accountId={accountId}
                    external_id={request.id}
                    popup={true}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {request?.name || 'New Connection Request'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(request.date_creation).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(request)}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded flex items-center gap-1.5 text-sm transition-colors duration-150"
                    >
                      <Iconify
                        icon="mdi:close"
                        className="w-4 h-4"
                      />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(request)}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded flex items-center gap-1.5 text-sm transition-colors duration-150"
                    >
                      <Iconify
                        icon="mdi:check"
                        className="w-4 h-4"
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
