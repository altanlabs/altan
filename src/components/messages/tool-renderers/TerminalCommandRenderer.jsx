import { Icon } from '@iconify/react';
import React, { memo, useMemo, useState } from 'react';

/**
 * Elegant terminal command renderer
 * Minimal by default, powerful when expanded
 */
const TerminalCommandRenderer = memo(({ part }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const hasError = !!part?.error;
  const isExecuting = !part?.is_done;

  // Get command preview (truncate if too long)
  const commandPreview = useMemo(() => {
    if (!commandFromArgs) return '';
    const maxLength = 50;
    return commandFromArgs.length > maxLength
      ? `${commandFromArgs.slice(0, maxLength)}...`
      : commandFromArgs;
  }, [commandFromArgs]);

  // Don't render anything if there's no command yet
  if (!commandFromArgs && commandExecutions.length === 0) {
    return null;
  }

  // Copy command handler
  const handleCopyCommand = async (e) => {
    e.stopPropagation();
    if (commandFromArgs) {
      try {
        await navigator.clipboard.writeText(commandFromArgs);
      } catch {
        // Silent fail
      }
    }
  };

  // Copy output handler
  const handleCopyOutput = async (e) => {
    e.stopPropagation();
    if (aggregatedData?.output) {
      try {
        await navigator.clipboard.writeText(aggregatedData.output);
      } catch {
        // Silent fail
      }
    }
  };

  // Determine status for compact display
  const getStatusInfo = () => {
    if (isExecuting) {
      return {
        icon: 'svg-spinners:ring-resize',
        text: 'Running',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
      };
    }
    if (hasError || (aggregatedData && !aggregatedData.isSuccess)) {
      return {
        icon: 'mdi:close-circle',
        text: 'Failed',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
      };
    }
    if (aggregatedData?.isSuccess) {
      return {
        icon: 'mdi:check-circle',
        text: 'Done',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
      };
    }
    return null;
  };

  const statusInfo = getStatusInfo();
  const hasOutput = aggregatedData && (aggregatedData.output || aggregatedData.error);

  return (
    <div className="w-full my-0.5">
      <div className={`group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-150 ${isExpanded ? 'w-full' : 'inline-flex max-w-full'}`}>
        {/* Compact Header - Clickable */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 select-none relative min-w-0 ${isExpanded ? 'w-full' : ''}`}
        >
          {/* Expand Icon */}
          <Icon
            icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 text-[11px] flex-shrink-0 transition-all"
          />

          {/* Terminal Icon - very subtle */}
          <Icon
            icon="mdi:terminal"
            className="text-gray-400 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 text-[11px] flex-shrink-0 transition-colors"
          />

          {/* Status Icon - just the icon when collapsed */}
          {statusInfo && !isExpanded && (
            <Icon
              icon={statusInfo.icon}
              className={`text-[11px] flex-shrink-0 ${statusInfo.color.replace('text-', 'text-').replace('-600', '-500').replace('-400', '-500')}`}
            />
          )}

          {/* Status Badge with text - only when expanded */}
          {statusInfo && isExpanded && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              <Icon icon={statusInfo.icon} className="text-[10px]" />
              <span>{statusInfo.text}</span>
            </div>
          )}

          {/* Command Preview (when collapsed) - text fades out */}
          {!isExpanded && (
            <div className="min-w-0 max-w-md overflow-hidden">
              <span
                className="text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 font-mono text-[10px] transition-colors block whitespace-nowrap"
                style={{
                  maskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)',
                }}
              >
                {commandPreview}
              </span>
            </div>
          )}

          {/* Spacer when expanded */}
          {isExpanded && <div className="flex-1" />}

          {/* Copy Button - appears on hover */}
          <button
            type="button"
            onClick={handleCopyCommand}
            className="flex items-center gap-0.5 px-1.5 py-0.5 ml-1 flex-shrink-0 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-500 dark:text-gray-400 text-[9px]"
            title="Copy command"
          >
            <Icon icon="mdi:content-copy" className="text-[10px]" />
            <span className="font-medium">Copy</span>
          </button>
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="border-t border-gray-200/60 dark:border-gray-700/60">
            {/* Command Display with Header */}
            <div className="bg-white dark:bg-black">
              {/* Command Header */}
              <div className="flex items-center justify-between px-3 py-1 border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                    Command
                  </span>
                  {/* Duration - only shown when expanded */}
                  {aggregatedData?.duration > 0 && !isExecuting && (
                    <span className="text-[10px] text-gray-500 font-mono">
                      {aggregatedData.duration < 1000
                        ? `${aggregatedData.duration}ms`
                        : `${(aggregatedData.duration / 1000).toFixed(2)}s`}
                    </span>
                  )}
                </div>
              </div>

              {/* Command Content */}
              <div className="px-3 py-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-xs font-mono select-none flex-shrink-0 mt-0.5">
                    $
                  </span>
                  <pre className="text-xs font-mono text-gray-700 dark:text-gray-100 whitespace-pre-wrap break-words flex-1">
                    {commandFromArgs}
                  </pre>
                </div>
              </div>
            </div>

            {/* Output Section */}
            {hasOutput && (
              <div className="border-t border-gray-200/60 dark:border-gray-700/60">
                {/* Output Header */}
                <div className="flex items-center justify-between px-3 py-1 bg-gray-50/50 dark:bg-gray-800/20">
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Output
                  </span>
                  {aggregatedData.output && (
                    <button
                      type="button"
                      onClick={handleCopyOutput}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Copy output"
                    >
                      <Icon icon="mdi:content-copy" className="text-xs" />
                      <span>Copy</span>
                    </button>
                  )}
                </div>

                {/* Output Content */}
                <div className="max-h-80 overflow-y-auto">
                  {aggregatedData.output && (
                    <div className="px-3 py-2">
                      <pre className="text-[10px] font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {aggregatedData.output}
                      </pre>
                    </div>
                  )}

                  {/* Error Output */}
                  {aggregatedData.error && (
                    <div className="px-3 py-2 bg-red-50/50 dark:bg-red-950/10 border-t border-red-200/50 dark:border-red-800/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon icon="mdi:alert-circle" className="text-xs text-red-600 dark:text-red-400" />
                        <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                          Error
                        </span>
                      </div>
                      <pre className="text-[10px] font-mono text-red-700 dark:text-red-400 whitespace-pre-wrap break-words">
                        {aggregatedData.error}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Executing State */}
            {isExecuting && !hasOutput && (
              <div className="px-3 py-2 border-t border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Icon icon="svg-spinners:pulse-rings-2" className="text-sm text-blue-500 dark:text-blue-400" />
                  <span className="text-[10px] italic">Waiting for output...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

TerminalCommandRenderer.displayName = 'TerminalCommandRenderer';

export default TerminalCommandRenderer;
