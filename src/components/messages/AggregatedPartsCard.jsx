import { Icon } from '@iconify/react';
import React, { useState, useCallback, useMemo } from 'react';

import ThinkingPartCard from './ThinkingPartCard.jsx';
import ToolPartCard from './ToolPartCard.jsx';
import IconRenderer from '../icons/IconRenderer.jsx';
import { calculateAggregatedMetrics, formatAggregatedTime, getUniqueToolIcons } from './utils/aggregationUtils.js';

/**
 * AggregatedPartsCard - Ultra-refined summary of consecutive tool/thinking parts
 *
 * Minimalist two-row design:
 * - Row 1: Thinking time
 * - Row 2: Tool metrics + elegant overlapping icons
 *
 * Expandable with seamless transitions
 */
const AggregatedPartsCard = ({ parts }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded((v) => !v);
  }, []);

  // Safety check for parts
  const safeParts = useMemo(() => {
    if (!parts || !Array.isArray(parts)) return [];
    return parts.filter(Boolean); // Remove null/undefined
  }, [parts]);

  // Calculate aggregated metrics
  const metrics = useMemo(() => calculateAggregatedMetrics(safeParts), [safeParts]);
  const { thinkingTime, toolCount, successCount, errorCount, toolIcons } = metrics;

  // Get unique tool icons with overflow
  const iconData = useMemo(() => getUniqueToolIcons(toolIcons, 6), [toolIcons]);

  // Determine row 1 text
  const primaryText = useMemo(() => {
    if (thinkingTime > 0) {
      return `Thought for ${formatAggregatedTime(thinkingTime)}`;
    }
    return `Executed ${toolCount} tool${toolCount !== 1 ? 's' : ''}`;
  }, [thinkingTime, toolCount]);

  // Determine row 2 text parts
  const secondaryParts = useMemo(() => {
    const parts = [];

    if (toolCount > 0) {
      parts.push({ type: 'count', text: `${toolCount} tool${toolCount !== 1 ? 's' : ''}` });
    }

    if (successCount > 0) {
      parts.push({ type: 'success', text: successCount.toString() });
    }

    if (errorCount > 0) {
      parts.push({ type: 'error', text: errorCount.toString() });
    }

    return parts;
  }, [toolCount, successCount, errorCount]);

  // Don't render if no valid parts
  if (!safeParts || safeParts.length === 0) return null;

  return (
    <div className="w-full my-0">
      <div className={`group rounded-md transition-all duration-200 ${isExpanded ? 'w-full bg-gray-50/30 dark:bg-gray-800/20' : 'inline-flex max-w-full hover:bg-gray-50/30 dark:hover:bg-gray-800/20'}`}>
        {/* Header - Two Rows */}
        <button
          onClick={handleToggle}
          aria-expanded={isExpanded}
          className="inline-flex flex-col items-start gap-0 py-1 select-none relative min-w-0 w-full"
        >
          {/* Row 1: Chevron + Layers Icon + Primary Text */}
          <div className="inline-flex items-center gap-1 w-full">
            {/* Expand Icon */}
            <Icon
              icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
              className="text-gray-300 dark:text-gray-700 group-hover:text-gray-500 dark:group-hover:text-gray-500 text-[10px] flex-shrink-0 transition-colors duration-200"
            />

            {/* Layers Icon */}
            <Icon
              icon="mdi:layers-triple"
              className="text-gray-400 dark:text-gray-600 text-[11px] flex-shrink-0 opacity-60"
            />

            {/* Primary Text */}
            <span className="text-gray-600 dark:text-gray-400 text-[10px] font-medium tracking-tight">
              {primaryText}
            </span>
          </div>

          {/* Row 2: Indented + Secondary Text + Tool Icons */}
          {(secondaryParts.length > 0 || iconData.visible.length > 0) && (
            <div className="inline-flex items-center gap-1.5 ml-4">
              {/* Secondary Text (tool count and stats) */}
              {secondaryParts.length > 0 && (
                <div className="inline-flex items-center gap-1">
                  {secondaryParts.map((part, idx) => (
                    <React.Fragment key={idx}>
                      {part.type === 'count' && (
                        <span className="text-[8.5px] text-gray-400 dark:text-gray-500 font-medium">
                          {part.text}
                        </span>
                      )}
                      {part.type === 'success' && (
                        <span className="inline-flex items-center gap-0.5 text-[8.5px] text-emerald-600 dark:text-emerald-500 font-medium">
                          <Icon icon="mdi:check-circle" className="text-[9px]" />
                          {part.text}
                        </span>
                      )}
                      {part.type === 'error' && (
                        <span className="inline-flex items-center gap-0.5 text-[8.5px] text-rose-600 dark:text-rose-500 font-medium">
                          <Icon icon="mdi:close-circle" className="text-[9px]" />
                          {part.text}
                        </span>
                      )}
                      {idx < secondaryParts.length - 1 && (
                        <span className="text-gray-300 dark:text-gray-700 text-[7px]">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Overlapping Tool Icons */}
              {iconData.visible.length > 0 && (
                <div className="flex items-center -space-x-1">
                  {iconData.visible.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-[16px] h-[16px] rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 ring-[1.5px] ring-white/80 dark:ring-gray-900/80 flex items-center justify-center shadow-sm hover:scale-110 hover:z-10 transition-transform duration-200"
                      title={item.toolName}
                    >
                      <IconRenderer
                        icon={item.icon}
                        size={9}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </div>
                  ))}
                  {iconData.overflow > 0 && (
                    <div
                      className="w-[16px] h-[16px] rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-750 dark:to-gray-800 ring-[1.5px] ring-white/80 dark:ring-gray-900/80 flex items-center justify-center shadow-sm"
                    >
                      <span className="text-[6.5px] font-semibold text-gray-600 dark:text-gray-400">
                        +{iconData.overflow}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </button>

        {/* Expanded Content - Individual Parts */}
        {isExpanded && (
          <div className="pb-1.5 pt-0.5 space-y-0 animate-in fade-in slide-in-from-top-1 duration-200">
            {safeParts.map((part) => {
              // Extra safety check
              if (!part || !part.id) return null;

              const partType = part.type || part.part_type || 'text';

              if (partType === 'thinking') {
                return (
                  <ThinkingPartCard
                    key={part.id}
                    partId={part.id}
                  />
                );
              } else if (partType === 'tool') {
                return (
                  <ToolPartCard
                    key={part.id}
                    partId={part.id}
                    noClick={false}
                  />
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

AggregatedPartsCard.displayName = 'AggregatedPartsCard';

export default AggregatedPartsCard;
