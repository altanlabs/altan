import { useMemo } from 'react';

import { sendMessage } from '../../redux/slices/room.js';
import { dispatch } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

const MessageError = ({ message }) => {
  // Get error info from either location
  const errorType = message.error?.type || message.meta_data?.error_type || 'Error';
  const errorMessage = message.error?.message || message.meta_data?.error_message || 'An error occurred';
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
  const hasError = message.error || message.meta_data?.error_code || message.meta_data?.error_message;

  if (!hasError) return null;

  const handleRetry = () => {
    dispatch(
      sendMessage({
        content: 'continue',
        threadId: message.thread_id,
      }),
    );
  };

  return (
    <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 shadow-lg">
      <div className="flex items-center space-x-2">
        <Iconify
          icon="bx:error-alt"
          className="text-red-500 dark:text-red-400"
        />
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          {errorType}
        </h2>
        {errorCode && (
          <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
            {errorCode}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col space-y-3">
        <p className="text-sm text-red-700 dark:text-red-300">
          {displayMessage}
        </p>
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
        </div>
      </div>
    </div>
  );
};

export default MessageError;
