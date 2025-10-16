import React from 'react';

import { cn } from '@lib/utils';

import QuestionOption from './QuestionOption';

// Question Group Component - represents a single question with options
const QuestionGroup = ({
  title,
  children,
  groupId,
  selectedValue,
  onSelect,
  isExpanded,
  onToggle,
}) => {
  // Process children to inject props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;

    // Check for multi-option - look for value prop or data-mo-value attribute
    const optionValue = child.props?.value || child.props?.['data-mo-value'];
    const recommendedProp = child.props?.recommended || child.props?.['data-mo-recommended'];
    const isRecommended = recommendedProp === 'true' || recommendedProp === true;

    if (optionValue !== undefined) {
      return (
        <QuestionOption
          value={optionValue}
          isSelected={selectedValue === optionValue}
          isRecommended={isRecommended}
          onSelect={onSelect}
          groupId={groupId}
        >
          {child.props?.children}
        </QuestionOption>
      );
    }
    return null;
  });

  const hasSelection = !!selectedValue;

  return (
    <div className="rounded-lg border-2 border-gray-200/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/20 overflow-hidden transition-all">
      {/* Header - Clickable to toggle */}
      {title && (
        <button
          onClick={onToggle}
          className={cn(
            'w-full px-3 py-2.5 flex items-center justify-between transition-colors',
            'hover:bg-gray-100/50 dark:hover:bg-gray-700/30',
            hasSelection && 'bg-green-50/50 dark:bg-green-900/20',
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-gray-200">
              {title}
            </span>
            {hasSelection && (
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
          <svg
            className={cn(
              'w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {/* Collapsible Content */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="p-3 pt-1 flex flex-col gap-1.5">
          {enhancedChildren}
        </div>
      </div>
    </div>
  );
};

export default QuestionGroup;
