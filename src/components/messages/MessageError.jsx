import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { sendMessage, selectRoomId, makeSelectMemberById } from '../../redux/slices/room.js';
import { dispatch } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

const MessageError = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const roomId = useSelector(selectRoomId);

  // Get the member from Redux using the member_id
  const selectMemberById = useMemo(makeSelectMemberById, []);
  const member = useSelector((state) => selectMemberById(state, message.member_id));

  // Get error info from either location
  const errorType = message.error?.type || message.meta_data?.error_type || 'Error';
  const errorMessage =
    message.error?.message || message.meta_data?.error_message || 'An error occurred';
  const errorCode = message.meta_data?.error_code;

  // Extract user-friendly error message
  const displayMessage = useMemo(() => {
    // Try to extract the most relevant part of the error message
    const msg = errorMessage;

    // If it's a nested error with quotes, try to extract the inner message
    const match = msg.match(/'message': '([^']+)'/);
    if (match) return match[1];

    // Otherwise return the full message
    return msg;
  }, [errorMessage]);

  // Check for error in both message.error (legacy) and message.meta_data
  const hasError =
    message.error || message.meta_data?.error_code || message.meta_data?.error_message;

  if (!hasError) return null;

  const handleRetry = () => {
    dispatch(
      sendMessage({
        content: 'continue',
        threadId: message.thread_id,
      }),
    );
  };

  const handleCopyError = async () => {
    const errorInfo = `Thread ID: ${message.thread_id || 'N/A'}
Room ID: ${roomId || 'N/A'}
Agent ID: ${member?.member?.agent_id || 'N/A'}
Error Type: ${errorType}
Error Code: ${errorCode || 'N/A'}
Error Message: ${errorMessage}
`;

    try {
      await navigator.clipboard.writeText(errorInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Failed to copy - silently fail
      setCopied(false);
    }
  };

  const handleNotifyDev = async () => {
    setNotifying(true);

    // Extract agent_id from the member
    const agentId = member?.member?.agent_id || null;

    const errorPayload = {
      thread_id: message.thread_id || null,
      room_id: roomId || null,
      message_id: message.id || null,
      member_id: message.member_id || null,
      agent_id: agentId,
      error_type: errorType,
      error_code: errorCode || null,
      error_message: errorMessage,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      const response = await fetch('https://api.altan.ai/galaxia/hook/scc9fJ', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorPayload),
      });

      if (response.ok) {
        setNotified(true);
        setTimeout(() => {
          setNotified(false);
          setNotifying(false);
        }, 3000);
      } else {
        setNotifying(false);
      }
    } catch {
      // Failed to notify - silently fail
      setNotifying(false);
    }
  };

  return (
    <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 shadow-lg">
      <div className="flex items-center space-x-2">
        <Iconify
          icon="bx:error-alt"
          className="text-red-500 dark:text-red-400"
        />
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">{errorType}</h2>
        {errorCode && (
          <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
            {errorCode}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col space-y-3">
        <p className="text-sm text-red-700 dark:text-red-300">{displayMessage}</p>
        {displayMessage !== errorMessage && (
          <details className="text-xs">
            <summary className="cursor-pointer text-red-600/70 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              View full details
            </summary>
            <pre className="mt-2 p-2 rounded bg-red-100/40 dark:bg-red-900/10 text-red-700 dark:text-red-300 overflow-x-auto whitespace-pre-wrap break-words text-xs">
              {errorMessage}
            </pre>
          </details>
        )}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={handleCopyError}
            className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <Iconify
              icon={copied ? 'bx:check' : 'bx:copy'}
              className="w-4 h-4"
            />
            <span>{copied ? 'Copied!' : 'Copy Error'}</span>
          </button>
          <button
            onClick={handleNotifyDev}
            disabled={notifying || notified}
            className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {notifying ? (
              <>
                <Iconify
                  icon="eos-icons:loading"
                  className="w-4 h-4 animate-spin"
                />
                <span>Sending...</span>
              </>
            ) : notified ? (
              <>
                <Iconify
                  icon="bx:check"
                  className="w-4 h-4"
                />
                <span>Notified!</span>
              </>
            ) : (
              <>
                <Iconify
                  icon="bx:send"
                  className="w-4 h-4"
                />
                <span>Notify Dev</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageError;
