import { useSnackbar } from 'notistack';
import React, { memo, useEffect, useState } from 'react';

// Define error interfaces matching the client-side version of your Pydantic models.
interface ErrorData {
  file?: string;
  line?: number;
  column?: number;
  message: string;
  stack?: string;
  url?: string;
  status?: number;
  statusText?: string;
  tag?: string;
  error_object?: unknown;
  request?: unknown;
}

export interface ErrorDetectedBoundary {
  error_type?: string;
  repo_name?: string;
  timestamp?: string;
  fatal?: boolean;
  data: ErrorData;
}

interface PreviewErrorOverlayProps {
  error: ErrorDetectedBoundary;
  sendErrorToAgent: (_data: any) => void;
}

const PreviewErrorOverlay: React.FC<PreviewErrorOverlayProps> = ({ error, sendErrorToAgent }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);
  const [notificationShown, setNotificationShown] = useState(false);

  // Extract error details from the payload.
  const {
    file = 'unknown',
    line,
    column,
    message: errorMessage,
    stack: errorStack = '',
  } = error.data;
  const fullUrl = window.location.href;

  // For nonfatal errors, show a snackbar notification (if not already shown).
  useEffect(() => {
    if (!error.fatal && !notificationShown) {
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      });
      setNotificationShown(true);
    }
  }, [error, enqueueSnackbar, notificationShown, errorMessage]);

  // If not a fatal error, do not render the overlay.
  if (!error.fatal) return null;
  if (!visible) return null;

  // Toggle details view.
  const dismissOverlay = () => setVisible(false);

  // "Fix with AI" button handler now calls sendErrorToAgent.
  const fixWithTarget = () => {
    const messageData = {
      type: 'error_detected_boundary',
      repo_name: error.repo_name || 'unknown',
      target: 'ai',
      data: {
        file,
        line,
        column,
        message: errorMessage,
        stack: errorStack,
        url: fullUrl,
      },
    };
    sendErrorToAgent(messageData);
  };

  // Copy error details to clipboard.
  const copyErrorToClipboard = async () => {
    const errorText = `I found this error in the interface:\n${errorMessage}\n\nStack Trace:\n${errorStack}`;
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error', err);
    }
  };

  return (
    <div
      id="vite-custom-error-overlay"
      className="absolute inset-0 flex items-center justify-center bg-black/90 text-white z-50 p-8 overflow-y-auto"
    >
      <div className="relative max-w-3xl w-full max-h-full p-6 rounded-2xl shadow-2xl border border-cyan-500/30 bg-gray-900/60 backdrop-blur-lg text-white overflow-y-auto">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 rounded-2xl pointer-events-none"></div>

        {/* Header with title and close button */}
        <div className="flex items-center justify-between relative z-10">
          <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
            ⚠️ Error (Copy & Paste in chat to fix)
          </h2>
          <button
            className="text-gray-300 p-1 rounded-lg hover:text-white text-sm transition-all hover:opacity-80 border border-gray-400/10 hover:border-gray-400/40 cursor-pointer"
            onClick={dismissOverlay}
          >
            <div className="flex flex-row w-full space-x-2 items-center">
              <span>Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* File location display */}
        <p className="mt-2 text-sm text-gray-300">
          File:{' '}
          <span className="text-cyan-400 font-semibold">
            {file}:{line ?? '-'}:{column ?? '-'}
          </span>
        </p>

        {/* Toggleable error details */}
        <div className="mt-4">
          <div
            id="error-details"
            className={`mt-4`}
          >
            <pre className="bg-gray-800/50 p-4 rounded-md overflow-x-auto text-xs text-gray-300 border border-gray-600 shadow-md whitespace-pre-wrap">
              <code className="text-red-400">{errorMessage}</code>
              <br />
              {errorStack}
            </pre>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-row space-x-3 w-full">
          {/* <button
            className="flex items-center px-5 py-2 bg-blue-500/20 hover:bg-blue-500/50 text-blue-300 hover:text-white hover:opacity-60 rounded-xl shadow-md transition-all duration-300 ease-in-out backdrop-blur-lg border border-blue-400/40 hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95"
            onClick={fixWithTarget}
          >
            <img
              src="https://platform-api.altan.ai/media/2262e664-dc6a-4a78-bad5-266d6b836136?account_id=8cd115a4-5f19-42ef-bc62-172f6bff28e7"
              className="w-6 h-6 mr-2 rounded-lg"
              alt="AI Icon"
            />
            Fix with AI
          </button> */}

          <button
            className="px-5 py-2 bg-gray-700/40 hover:bg-gray-700/70 text-gray-300 hover:text-white hover:opacity-60 rounded-xl shadow-md transition-all duration-300 ease-in-out backdrop-blur-lg border border-gray-500/40 hover:shadow-gray-500/50 transform hover:scale-105 active:scale-95"
            onClick={copyErrorToClipboard}
          >
            {copied ? '✅ Copied!' : '📋 Copy Error'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(PreviewErrorOverlay);
