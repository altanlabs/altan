import React, { useEffect, useState } from 'react';

import { cn } from '@lib/utils';

import type { QuestionOptionProps } from './types';

const QuestionOption: React.FC<QuestionOptionProps> = ({
  children,
  value,
  isSelected,
  isRecommended,
  onSelect,
  groupId,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const selectionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleClick = (): void => {
    if (!isSelected) {
      setIsAnimating(true);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      selectionTimeoutRef.current = setTimeout(() => {
        onSelect(groupId, value || (typeof children === 'string' ? children : ''));
        selectionTimeoutRef.current = null;
      }, 100);
    }
  };

  useEffect(() => {
    if (isSelected) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        animationTimeoutRef.current = null;
      }, 200);
    }
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isSelected]);

  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full px-1.5 py-1 rounded text-[11px] text-left group',
        'transition-all',
        isSelected
          ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
          : 'hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'h-1 w-1 rounded-full flex-shrink-0 transition-all',
            isSelected
              ? 'bg-neutral-900 dark:bg-neutral-100 scale-125'
              : 'bg-neutral-300 dark:bg-neutral-700 scale-75 group-hover:scale-100',
          )}
        />
        <span className="flex-1 leading-tight flex items-center gap-1.5">
          {children}
          {isRecommended && !isSelected && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900">
              ★
            </span>
          )}
        </span>
      </div>
    </button>
  );
};

export default React.memo(QuestionOption);

