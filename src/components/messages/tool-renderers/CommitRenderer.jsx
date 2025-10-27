import { Icon } from '@iconify/react';
import React, { memo, useMemo, useCallback, useState } from 'react';

import useFeedbackDispatch from '../../../hooks/useFeedbackDispatch.js';
import { restoreCommit, selectIsRestoring } from '../../../redux/slices/commits.js';
import { useDispatch, useSelector } from '../../../redux/store.js';

/**
 * Elegant commit renderer - always visible, compact, optimized for streaming
 */
const CommitRenderer = memo(({ part }) => {
  const dispatch = useDispatch();
  const [dispatchWithFeedback] = useFeedbackDispatch();
  const [showBuildDetails, setShowBuildDetails] = useState(false);

  // Parse arguments to get commit message
  const commitMessage = useMemo(() => {
    // Try task_execution.arguments first
    const message = part?.task_execution?.arguments?.message;
    if (message) return message;

    // Fallback to part.arguments
    if (!part?.arguments) return null;

    try {
      const args = typeof part.arguments === 'string' ? JSON.parse(part.arguments) : part.arguments;
      return args?.message || null;
    } catch {
      return null;
    }
  }, [part?.arguments, part?.task_execution?.arguments?.message]);

  // Parse the result to get commit hash and full details
  const commitData = useMemo(() => {
    // Try task_execution.content first (this is the primary source)
    const content = part?.task_execution?.content;
    if (content) {
      const payload = content?.payload || content;

      const hash =
        payload?.commit_hash ||
        (payload?.sha && payload.sha.length > 7 ? payload.sha.substring(0, 7) : payload?.sha) ||
        null;

      const buildResult = payload?.build_result;
      const filesCommitted = payload?.files_committed;

      // Return data even without hash during streaming
      if (buildResult || filesCommitted !== undefined) {
        return { hash, buildResult, filesCommitted };
      }
    }

    // Fallback to part.result
    if (!part?.result) return null;

    try {
      const result = typeof part.result === 'string' ? JSON.parse(part.result) : part.result;

      const hash =
        result?.payload?.commit_hash ||
        result?.commit_hash ||
        (result?.payload?.sha && result.payload.sha.length > 7
          ? result.payload.sha.substring(0, 7)
          : result?.payload?.sha) ||
        (result?.sha && result.sha.length > 7 ? result.sha.substring(0, 7) : result?.sha);

      const buildResult = result?.payload?.build_result;
      const filesCommitted = result?.payload?.files_committed;

      return hash ? { hash, buildResult, filesCommitted } : null;
    } catch {
      return null;
    }
  }, [part?.result, part?.task_execution?.content]);

  const isCommitting = !part?.is_done;

  // Check if this commit is being restored
  const restoring = useSelector((state) =>
    commitData?.hash ? selectIsRestoring(state, commitData.hash) : false,
  );

  // Get current interfaceId from Redux state
  const currentInterfaceId = useSelector((state) => state.general?.account?.interfaces?.[0]?.id);

  // Handle restore action
  const handleRestore = useCallback(() => {
    if (!commitData?.hash) return;

    dispatchWithFeedback(() => dispatch(restoreCommit(commitData.hash, currentInterfaceId)), {
      successMessage: 'Successfully restored to checkpoint',
      errorMessage: 'Failed to restore checkpoint',
      useSnackbar: true,
    });
  }, [commitData?.hash, currentInterfaceId, dispatch, dispatchWithFeedback]);

  // Don't render anything if we don't have a commit message yet
  if (!commitMessage && !commitData) {
    return null;
  }

  return (
    <div className="w-full my-1">
      <div className="border border-blue-200/50 dark:border-blue-700/50 rounded-lg bg-blue-50/30 dark:bg-blue-950/20 p-3">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:source-commit"
              className="text-blue-600 dark:text-blue-400 text-sm flex-shrink-0"
            />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Checkpoint
            </span>
            {isCommitting && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Icon icon="svg-spinners:ring-resize" className="text-[10px]" />
                <span>Building...</span>
              </div>
            )}
          </div>

          {/* Restore Button */}
          {!isCommitting && commitData?.hash && (
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium border border-blue-300 dark:border-blue-600 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              title="Restore to this checkpoint"
            >
              {restoring ? (
                <>
                  <Icon icon="svg-spinners:ring-resize" className="text-xs" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:restore" className="text-xs" />
                  <span>Restore</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Commit Message */}
        {commitMessage && (
          <div className="mb-2 text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
            {commitMessage}
          </div>
        )}

        {/* Build Status - Compact */}
        {commitData?.buildResult && (
          <div>
            <div
              className={`flex items-center gap-1.5 ${!commitData.buildResult.success ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
              onClick={() => !commitData.buildResult.success && setShowBuildDetails(!showBuildDetails)}
              role={!commitData.buildResult.success ? 'button' : undefined}
            >
              <Icon
                icon={commitData.buildResult.success ? 'mdi:check-circle' : 'mdi:close-circle'}
                className={`text-xs flex-shrink-0 ${commitData.buildResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              />
              <span className="text-[10px] text-gray-600 dark:text-gray-400">
                Build {commitData.buildResult.success ? 'successful' : 'failed'}
                {commitData.buildResult.durationMs &&
                  ` (${(commitData.buildResult.durationMs / 1000).toFixed(2)}s)`}
              </span>
              {!commitData.buildResult.success && (
                <Icon
                  icon={showBuildDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                  className="text-xs text-gray-500 dark:text-gray-400 ml-auto"
                />
              )}
            </div>

            {/* Build Error Details - Expandable */}
            {!commitData.buildResult.success && showBuildDetails && (
              <div className="mt-1.5 p-2 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 rounded-md">
                {commitData.buildResult.error && (
                  <pre className="text-[10px] text-red-700 dark:text-red-400 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                    {commitData.buildResult.error}
                  </pre>
                )}
                {commitData.buildResult.output && (
                  <pre className="text-[10px] text-red-700 dark:text-red-400 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                    {commitData.buildResult.output}
                  </pre>
                )}
                {!commitData.buildResult.error && !commitData.buildResult.output && (
                  <pre className="text-[10px] text-red-700 dark:text-red-400 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                    {JSON.stringify(commitData.buildResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Creating State */}
        {isCommitting && !commitData && (
          <div className="flex items-center gap-1.5">
            <Icon icon="svg-spinners:pulse-rings-2" className="text-blue-500 dark:text-blue-400 text-xs" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 italic">
              Creating checkpoint...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimize: only rerender if critical fields change (not full part object)
  const prevPart = prevProps.part;
  const nextPart = nextProps.part;

  // Check only the fields we actually use
  return (
    prevPart?.is_done === nextPart?.is_done &&
    prevPart?.arguments === nextPart?.arguments &&
    prevPart?.result === nextPart?.result &&
    prevPart?.task_execution?.arguments?.message === nextPart?.task_execution?.arguments?.message &&
    prevPart?.task_execution?.content === nextPart?.task_execution?.content
  );
});

CommitRenderer.displayName = 'CommitRenderer';

export default CommitRenderer;
