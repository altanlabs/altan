/**
 * Aggregation Utilities
 *
 * Helper functions for grouping and aggregating consecutive tool and thinking parts
 */

import { getToolIcon } from '../tool-renderers/index.js';

/**
 * Check if a tool part should be excluded from aggregation
 * Commits and other special tools should always render independently
 */
function shouldExcludeFromAggregation(part) {
  // Null/undefined safety
  if (!part) return false;

  const partType = part.type || part.part_type || 'text';

  // Only check tools
  if (partType !== 'tool') return false;

  // Get tool name from various possible locations
  const toolName = part.name || part.task_execution?.tool_name || part.task_execution?.tool?.name;

  // If no tool name, don't exclude
  if (!toolName) return false;

  // Exclude commits - they should always appear independently
  const commitTools = ['commit', 'commit_changes', 'git_commit'];
  if (commitTools.includes(toolName)) {
    return true;
  }

  return false;
}

/**
 * Groups consecutive tool/thinking parts into aggregates
 * Returns array with groups (type: 'aggregate') and individual parts (type: 'part')
 *
 * ONLY aggregates when there's a text part AFTER the consecutive tool/thinking parts.
 * If parts end without a following text, they remain individual.
 * Excludes special tools like commits from aggregation.
 */
export function groupConsecutiveParts(parts) {
  if (!parts || parts.length === 0) return [];

  const result = [];
  let currentGroup = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Skip null/undefined parts
    if (!part) continue;

    const partType = part.type || part.part_type || 'text';

    // Check if this part should be excluded from aggregation
    const shouldExclude = shouldExcludeFromAggregation(part);

    // Check if this is a tool or thinking part that can be aggregated
    const isAggregatable = (partType === 'tool' || partType === 'thinking') && !shouldExclude;

    if (isAggregatable) {
      currentGroup.push(part);

      // Check if next part exists and what type it is
      const nextPart = parts[i + 1];
      let nextIsAggregatable = false;
      let nextIsText = false;

      if (nextPart) {
        const nextPartType = nextPart.type || nextPart.part_type || 'text';
        const nextShouldExclude = shouldExcludeFromAggregation(nextPart);
        nextIsAggregatable = (nextPartType === 'tool' || nextPartType === 'thinking') && !nextShouldExclude;
        nextIsText = nextPartType === 'text';
      }

      // If next part is not aggregatable, we need to close the group
      if (!nextIsAggregatable || i === parts.length - 1) {
        // Only create aggregate if:
        // 1. We have 2+ parts
        // 2. There's a text part after (nextIsText) OR we're not at the end but hitting a non-aggregatable part
        const shouldAggregate = currentGroup.length >= 2 && nextIsText;

        if (shouldAggregate) {
          result.push({
            type: 'aggregate',
            parts: [...currentGroup],
            id: `aggregate-${currentGroup.map(p => p?.id || 'unknown').join('-')}`,
          });
        } else {
          // Add all parts individually
          currentGroup.forEach(p => {
            result.push({
              type: 'part',
              part: p,
            });
          });
        }
        currentGroup = [];
      }
    } else {
      // Not aggregatable (text part, excluded tool, etc)
      // First close any open group
      const shouldAggregate = currentGroup.length >= 2 && partType === 'text';

      if (shouldAggregate) {
        result.push({
          type: 'aggregate',
          parts: [...currentGroup],
          id: `aggregate-${currentGroup.map(p => p?.id || 'unknown').join('-')}`,
        });
      } else if (currentGroup.length > 0) {
        // Add all parts individually
        currentGroup.forEach(p => {
          result.push({
            type: 'part',
            part: p,
          });
        });
      }
      currentGroup = [];

      // Add the current part as individual
      result.push({
        type: 'part',
        part,
      });
    }
  }

  return result;
}

/**
 * Calculates aggregated metrics from a group of parts
 * Returns { thinkingTime, toolCount, successCount, errorCount, toolIcons }
 */
export function calculateAggregatedMetrics(parts) {
  // Safety check
  if (!parts || !Array.isArray(parts)) {
    return {
      thinkingTime: 0,
      toolCount: 0,
      successCount: 0,
      errorCount: 0,
      toolIcons: [],
    };
  }

  let thinkingTime = 0;
  let toolCount = 0;
  let successCount = 0;
  let errorCount = 0;
  const toolIcons = [];

  for (const part of parts) {
    // Skip null/undefined parts
    if (!part) continue;

    const partType = part.type || part.part_type || 'text';

    if (partType === 'thinking') {
      // Calculate thinking duration (with safety checks)
      if (part.created_at && part.finished_at) {
        try {
          const start = new Date(part.created_at).getTime();
          const end = new Date(part.finished_at).getTime();
          if (!isNaN(start) && !isNaN(end) && end > start) {
            thinkingTime += (end - start) / 1000;
          }
        } catch (e) {
          // Ignore invalid dates
          console.warn('Invalid date in thinking part:', e);
        }
      }
    } else if (partType === 'tool') {
      toolCount++;

      // Get tool icon (with safety)
      const toolName = part.name || part.task_execution?.tool_name || part.task_execution?.tool?.name;
      const fallbackIcon = part.task_execution?.tool?.action_type?.connection_type?.icon || 'ri:hammer-fill';

      // Special case: web search
      let icon;
      if (part.meta_data?.provider_item_type === 'web_search_call') {
        icon = getToolIcon('web_search', fallbackIcon);
      } else {
        icon = getToolIcon(toolName, fallbackIcon);
      }

      toolIcons.push({
        icon,
        toolName: toolName || 'tool',
      });

      // Count success/error
      if (part.error) {
        errorCount++;
      } else if (part.is_done) {
        successCount++;
      }
    }
  }

  return {
    thinkingTime,
    toolCount,
    successCount,
    errorCount,
    toolIcons,
  };
}

/**
 * Formats aggregated time in a smart way
 * < 60s: "12.5s" or "45s"
 * >= 60s: "1m 30s" or "2m 5s"
 */
export function formatAggregatedTime(seconds) {
  // Safety checks
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return '0s';
  }

  if (seconds < 60) {
    return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Gets unique tool icons from parts (deduplicates consecutive duplicates)
 * Returns array of { icon, toolName }
 */
export function getUniqueToolIcons(toolIcons, maxVisible = 5) {
  // Safety checks
  if (!toolIcons || !Array.isArray(toolIcons) || toolIcons.length === 0) {
    return { visible: [], overflow: 0 };
  }

  // Ensure maxVisible is a valid number
  const safeMaxVisible = typeof maxVisible === 'number' && maxVisible > 0 ? maxVisible : 5;

  // Deduplicate consecutive duplicates only (preserve order and non-consecutive duplicates)
  const deduplicated = [];
  let lastIcon = null;

  for (const item of toolIcons) {
    // Skip null/undefined items
    if (!item) continue;

    if (item.icon !== lastIcon) {
      deduplicated.push(item);
      lastIcon = item.icon;
    }
  }

  // Limit to maxVisible
  const visible = deduplicated.slice(0, safeMaxVisible);
  const overflow = Math.max(0, deduplicated.length - safeMaxVisible);

  return { visible, overflow };
}
