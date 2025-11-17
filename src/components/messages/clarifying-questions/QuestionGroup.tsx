import { Check, ChevronDown } from 'lucide-react';
import React, { useMemo } from 'react';

import { cn } from '@lib/utils';

import QuestionOption from './QuestionOption';
import type { QuestionGroupProps } from './types';
import { createOptionsKey } from './utils';

const QuestionGroup: React.FC<QuestionGroupProps> = ({
  title,
  children,
  groupId,
  selectedValue,
  onSelect,
  isExpanded,
  onToggle,
}) => {
  const optionsKey = useMemo(() => createOptionsKey(children), [children]);

  const enhancedChildren = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null;

      const optionValue = child.props?.value || child.props?.['data-mo-value'];
      const recommendedProp = child.props?.recommended || child.props?.['data-mo-recommended'];
      const isRecommended = recommendedProp === 'true' || recommendedProp === true;

      if (optionValue !== undefined) {
        return (
          <QuestionOption
            key={optionValue}
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
  }, [optionsKey, selectedValue, onSelect, groupId]);

  const hasSelection = !!selectedValue;

  return (
    <div className={cn(
      'overflow-hidden rounded-md transition-all',
      isExpanded && !hasSelection && 'bg-neutral-50/50 dark:bg-neutral-900/30 ring-1 ring-neutral-200/50 dark:ring-neutral-800/50'
    )}>
      {title && (
        <button
          onClick={onToggle}
          className={cn(
            'w-full px-1 py-1 flex items-center gap-1.5 transition-colors group relative',
            'hover:text-neutral-900 dark:hover:text-neutral-100',
          )}
        >
          {isExpanded && !hasSelection && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-200/60 dark:via-neutral-700/60 to-transparent animate-shimmer pointer-events-none" />
          )}
          <ChevronDown
            className={cn(
              'h-2.5 w-2.5 transition-all flex-shrink-0 relative z-10',
              isExpanded && !hasSelection && 'text-neutral-600 dark:text-neutral-400 rotate-180',
              isExpanded && hasSelection && 'text-neutral-500 dark:text-neutral-500 rotate-180',
              !isExpanded && 'text-neutral-400 dark:text-neutral-600',
            )}
          />
          <span className={cn(
            'text-[11px] font-medium transition-colors relative z-10',
            hasSelection 
              ? 'text-neutral-900 dark:text-neutral-100' 
              : isExpanded 
                ? 'text-neutral-800 dark:text-neutral-200'
                : 'text-neutral-600 dark:text-neutral-400'
          )}>
            {title}
          </span>
          {hasSelection && (
            <Check className="h-2.5 w-2.5 text-neutral-500 dark:text-neutral-500 relative z-10" />
          )}
        </button>
      )}

      <div
        className={cn(
          'overflow-hidden transition-all',
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="pl-4 pr-1 pt-1 pb-1.5 flex flex-col gap-0.5">
          {enhancedChildren}
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuestionGroup);

