import { Icon } from '@iconify/react';
import React, { memo, useMemo, useState } from 'react';

/**
 * Custom renderer for terminal command execution
 * Displays command, output, and execution status
 */
const TerminalCommandRenderer = memo(({ part }) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Parse arguments to get the command string
  const commandFromArgs = useMemo(() => {
    if (!part?.arguments) return null;

    try {
      const args = typeof part.arguments === 'string' ? JSON.parse(part.arguments) : part.arguments;
      return args?.command || null;
    } catch {
      return null;
    }
  }, [part?.arguments]);

  // Parse the result to get command executions
  const commandExecutions = useMemo(() => {
    if (!part?.result) return [];

    try {
      const result = typeof part.result === 'string' ? JSON.parse(part.result) : part.result;

      // Handle the payload.results structure
      const results = result?.payload?.results || result?.results || [];

      return results.map((execution) => ({
        command: Array.isArray(execution.cmd) ? execution.cmd.join(' ') : execution.cmd || '',
        output: execution.stdout || '',
        error: execution.stderr || '',
        exitCode: execution.exitCode ?? null,
        duration: execution.durationMs ?? null,
        truncated: execution.truncated ?? false,
      }));
    } catch {
      return [];
    }
  }, [part?.result]);

  // Aggregate all outputs and determine overall success
  const aggregatedData = useMemo(() => {
    if (commandExecutions.length === 0) return null;

    const allOutputs = commandExecutions.map((exec) => exec.output).filter(Boolean).join('\n');
    const allErrors = commandExecutions.map((exec) => exec.error).filter(Boolean).join('\n');
    const allSuccessful = commandExecutions.every((exec) => exec.exitCode === 0);
    const totalDuration = commandExecutions.reduce((sum, exec) => sum + (exec.duration || 0), 0);

    return {
      output: allOutputs,
      error: allErrors,
      isSuccess: allSuccessful,
      duration: totalDuration,
    };
  }, [commandExecutions]);

  // Show error message if there's an error but no command executions
  const hasError = !!part?.error;
  const isExecuting = !part?.is_done;

  // Don't render anything if there's no command yet
  if (!commandFromArgs && commandExecutions.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-3 py-2">
      {/* Render single terminal card with original command */}
      {commandFromArgs && (aggregatedData || isExecuting) && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden">
          {/* Command Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:console" className="text-gray-600 dark:text-gray-400 text-sm flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Terminal Command</span>
              {isExecuting && (
                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Icon icon="svg-spinners:ring-resize" className="text-sm" />
                  Executing...
                </span>
              )}
            </div>
            {!isExecuting && aggregatedData && !aggregatedData.isSuccess && (
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                title="View error details"
              >
                <Icon icon="mdi:alert-circle" className="text-sm" />
                <span className="font-medium">Error</span>
                <Icon
                  icon={showErrorDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                  className="text-sm"
                />
              </button>
            )}
          </div>

          {/* Command Display */}
          <div className="px-3 py-2 bg-gray-900 dark:bg-black flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span className="text-green-400 dark:text-green-500 text-sm font-mono select-none flex-shrink-0">
                $
              </span>
              <pre className="text-sm font-mono text-gray-100 dark:text-gray-200 whitespace-pre-wrap break-words flex-1">
                {commandFromArgs}
              </pre>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isExecuting ? (
                <Icon icon="svg-spinners:pulse-rings-2" className="text-blue-500 dark:text-blue-400 text-sm" />
              ) : aggregatedData ? (
                <>
                  {aggregatedData.isSuccess ? (
                    <Icon icon="mdi:check-circle" className="text-green-500 dark:text-green-400 text-sm" />
                  ) : (
                    <Icon icon="mdi:alert-circle" className="text-red-500 dark:text-red-400 text-sm" />
                  )}
                  {aggregatedData.duration > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      {aggregatedData.duration < 1000
                        ? `${aggregatedData.duration}ms`
                        : `${(aggregatedData.duration / 1000).toFixed(2)}s`}
                    </span>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Output Display */}
          {aggregatedData && (aggregatedData.output || aggregatedData.error) && (
            <div className="max-h-96 overflow-y-auto">
              {aggregatedData.output && (
                <div className="px-3 pt-2 pb-1.5 font-mono text-xs">
                  <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {aggregatedData.output}
                  </pre>
                </div>
              )}
              {/* Only show error details if expanded */}
              {aggregatedData.error && showErrorDetails && (
                <div className="px-3 pt-2 pb-1.5 font-mono text-xs bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-800">
                  <pre className="text-red-700 dark:text-red-400 whitespace-pre-wrap break-words">
                    {aggregatedData.error}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Show placeholder while executing with no output yet */}
          {isExecuting && (!aggregatedData || (!aggregatedData.output && !aggregatedData.error)) && (
            <div className="px-3 pt-2 pb-1.5 font-mono text-xs">
              <span className="text-gray-500 dark:text-gray-500 italic">Waiting for output...</span>
            </div>
          )}
        </div>
      )}

      {/* Top-level error display (when no commands were executed) */}
      {hasError && commandExecutions.length === 0 && commandFromArgs && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden">
          {/* Command Header with Error */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:console" className="text-gray-600 dark:text-gray-400 text-sm flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Terminal Command</span>
            </div>
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              title="View error details"
            >
              <Icon icon="mdi:alert-circle" className="text-sm" />
              <span className="font-medium">Error</span>
              <Icon
                icon={showErrorDetails ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                className="text-sm"
              />
            </button>
          </div>

          {/* Command Display */}
          <div className="px-3 py-2 bg-gray-900 dark:bg-black flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span className="text-green-400 dark:text-green-500 text-sm font-mono select-none flex-shrink-0">
                $
              </span>
              <pre className="text-sm font-mono text-gray-100 dark:text-gray-200 whitespace-pre-wrap break-words flex-1">
                {commandFromArgs}
              </pre>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Icon icon="mdi:alert-circle" className="text-red-500 dark:text-red-400 text-sm" />
            </div>
          </div>

          {/* Error details (collapsible) */}
          {showErrorDetails && (
            <div className="px-3 pt-2 pb-1.5 font-mono text-xs bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-800">
              <pre className="text-red-700 dark:text-red-400 whitespace-pre-wrap break-words">
                {typeof part.error === 'string' ? part.error : JSON.stringify(part.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

TerminalCommandRenderer.displayName = 'TerminalCommandRenderer';

export default TerminalCommandRenderer;
