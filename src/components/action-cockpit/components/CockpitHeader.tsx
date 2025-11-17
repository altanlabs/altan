/**
 * Cockpit Header Component
 * Unified header for the action cockpit showing total pending items
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';

import type { SectionInfo } from '../types';

interface CockpitHeaderProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  activeSections: SectionInfo[];
}

const getSectionLabel = (type: string, count: number): string => {
  switch (type) {
    case 'authorization':
      return `${count} authorization${count !== 1 ? 's' : ''}`;
    case 'plans':
      return `${count} plan${count !== 1 ? 's' : ''}`;
    case 'tasks':
      return `${count} task${count !== 1 ? 's' : ''}`;
    case 'questions':
      return `${count} question${count !== 1 ? 's' : ''}`;
    default:
      return `${count} item${count !== 1 ? 's' : ''}`;
  }
};

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  isExpanded,
  onToggleExpand,
  activeSections,
}) => {
  // Get the first (most urgent) section for collapsed display
  const primarySection = activeSections[0];

  // Build detailed breakdown text
  const buildBreakdown = (): string => {
    if (activeSections.length === 0) return 'No pending items';
    
    const parts: string[] = [];
    activeSections.forEach((section) => {
      const label = getSectionLabel(section.type, section.count);
      parts.push(label);
    });
    
    // Join with commas and "and" for last item if multiple
    if (parts.length === 1) {
      return parts[0];
    } else if (parts.length === 2) {
      return `${parts[0]} and ${parts[1]}`;
    } else {
      const last = parts.pop();
      return `${parts.join(', ')}, and ${last}`;
    }
  };

  const breakdown = buildBreakdown();

  return (
    <button
      onClick={onToggleExpand}
      className="cockpit-shimmer w-full flex items-center justify-between px-2 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-900">
          {primarySection ? (
            <span className="cockpit-pulse text-sm">
              {primarySection.type === 'authorization' && '🔑'}
              {primarySection.type === 'plans' && '📋'}
              {primarySection.type === 'tasks' && '✓'}
              {primarySection.type === 'questions' && '❓'}
            </span>
          ) : (
            <span className="text-sm">📌</span>
          )}
        </div>
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
            Action Required
          </span>
          <span className="text-[10px] text-left text-neutral-500 dark:text-neutral-500 truncate w-full">
            {breakdown}
          </span>
        </div>
      </div>
      {!isExpanded ? (
        <ChevronUp className="h-3 w-3 text-neutral-400 dark:text-neutral-600 flex-shrink-0" />
      ) : (
        <ChevronDown className="h-3 w-3 text-neutral-400 dark:text-neutral-600 flex-shrink-0" />
      )}
    </button>
  );
};

