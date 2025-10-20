import { Icon } from '@iconify/react';
import React, { memo, useMemo, useCallback } from 'react';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch.js';
import { restoreCommit, selectIsRestoring } from '../../../redux/slices/commits.js';
import { useDispatch, useSelector } from '../../../redux/store.js';
import ToolPartHeader from '../tool-parts/ToolPartHeader.jsx';

/**
 * Custom renderer for commit tool
 * Displays commit information directly without backend calls
 */
const CommitRenderer = memo(({ part, onToggle }) => {
  const dispatch = useDispatch();
  const [dispatchWithFeedback] = useFeedbackDispatch();

  // Parse arguments to get commit message
  const commitMessage = useMemo(() => {
    if (!part?.arguments) return null;

    try {
      const args = typeof part.arguments === 'string' ? JSON.parse(part.arguments) : part.arguments;

      return args?.message || null;
    } catch {
      return null;
    }
  }, [part?.arguments]);

  // Parse the result to get commit hash and full details
  const commitData = useMemo(() => {
    if (!part?.result) return null;

    try {
      const result = typeof part.result === 'string' ? JSON.parse(part.result) : part.result;

      // Handle different possible response structures
      const hash =
        result?.payload?.commit_hash ||
        result?.commit_hash ||
        result?.payload?.sha?.substring(0, 7) ||
        result?.sha?.substring(0, 7);

      // Extract build result and file stats from the result
      const buildResult = result?.payload?.build_result;
      const filesCommitted = result?.payload?.files_committed;

      return hash ? { hash, buildResult, filesCommitted } : null;
    } catch {
      return null;
    }
  }, [part?.result]);

  // Parse arguments for header display
  const hasDisplayableArguments = useMemo(() => {
    if (!part?.arguments) return false;
    try {
      const parsed =
        typeof part.arguments === 'string' ? JSON.parse(part.arguments) : part.arguments;
      const { __act_now, __act_done, __intent, __use_intent, ...filtered } = parsed;
      return Object.keys(filtered).length > 0;
    } catch {
      return false;
    }
  }, [part?.arguments]);

  const hasError = !!part?.error;
  const hasResult = !!part?.result;

  // Check if this commit is being restored
  const restoring = useSelector((state) =>
    commitData?.hash ? selectIsRestoring(state, commitData.hash) : false,
  );

  // Handle restore action
  const handleRestore = useCallback(() => {
    if (!commitData?.hash) return;

    dispatchWithFeedback(() => dispatch(restoreCommit(commitData.hash)), {
      successMessage: 'Successfully restored to checkpoint',
      errorMessage: 'Failed to restore checkpoint',
      useSnackbar: true,
    });
  }, [commitData?.hash, dispatch, dispatchWithFeedback]);

  return (
    <div className="w-full">
      {/* Header */}
      <ToolPartHeader
        partId={part?.id}
        noClick={false}
        isExpanded={true}
        onToggle={onToggle}
        hasDisplayableArguments={hasDisplayableArguments}
        hasError={hasError}
        onErrorClick={() => {}}
        hasResult={hasResult}
        onResultClick={() => {}}
      />

      {/* Commit Details */}
      {commitData && part?.is_done && (
        <div className="my-2 mx-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          {/* Header with Checkpoint title and Restore button */}
          <div className={`flex items-center justify-between ${commitMessage ? 'mb-4' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Checkpoint</h3>
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400"
              title="Restore to this checkpoint"
            >
              {restoring ? (
                <>
                  <Icon
                    icon="svg-spinners:ring-resize"
                    className="text-base"
                  />
                  Restoring...
                </>
              ) : (
                <>
                  <Icon
                    icon="mdi:restore"
                    className="text-base"
                  />
                  Restore
                </>
              )}
            </button>
          </div>

          {/* Commit Message */}
          {commitMessage && (
            <div className="mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{commitMessage}</p>
            </div>
          )}

          {/* Stats section */}
          <div className="space-y-1.5">
            {/* Build Status */}
            {commitData.buildResult && (
              <div className="flex items-center gap-2">
                <Icon
                  icon={commitData.buildResult.success ? 'mdi:check-circle' : 'mdi:alert-circle'}
                  className={`text-base flex-shrink-0 ${commitData.buildResult.success ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Build {commitData.buildResult.success ? 'successful' : 'failed'}
                  {commitData.buildResult.durationMs &&
                    ` (${(commitData.buildResult.durationMs / 1000).toFixed(2)}s)`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

CommitRenderer.displayName = 'CommitRenderer';

export default CommitRenderer;
