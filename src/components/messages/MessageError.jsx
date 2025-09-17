import { sendMessage } from '../../redux/slices/room.js';
import { dispatch } from '../../redux/store.js';
import Iconify from '../iconify/Iconify.jsx';

const MessageError = ({ message }) => {
  if (!message.error) return null;

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
          {message.error.type || 'Provider error'}
        </h2>
      </div>
      <div className="mt-2 flex flex-col space-y-3">
        <p className="text-sm text-red-700 dark:text-red-300">
          We are experiencing high demand. {message.error.message}
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Retry
          </button>
          <a
            href="https://www.altan.ai/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Upgrade
          </a>
        </div>
      </div>
    </div>
  );
};

export default MessageError;
