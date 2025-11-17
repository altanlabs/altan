import { useCallback, useEffect, useRef, useState } from 'react';

import type { QuestionGroupData } from '../types';

export const useQuestionSelection = (questionGroups: QuestionGroupData[]) => {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize first group as expanded
  useEffect(() => {
    if (expandedGroupId === null && questionGroups.length > 0) {
      setExpandedGroupId(questionGroups[0].id);
    }
  }, [expandedGroupId, questionGroups.length]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSelect = useCallback(
    (groupId: string, value: string) => {
      setSelections((prev) => ({
        ...prev,
        [groupId]: value,
      }));

      const isNotSure = value === 'Not sure / Need to dive deeper on this';

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!isNotSure) {
        const currentIndex = questionGroups.findIndex((g) => g.id === groupId);

        if (currentIndex !== -1 && currentIndex < questionGroups.length - 1) {
          timeoutRef.current = setTimeout(() => {
            setExpandedGroupId(questionGroups[currentIndex + 1].id);
            timeoutRef.current = null;
          }, 300);
        }
      }
    },
    [questionGroups],
  );

  const resetSelections = useCallback(() => {
    setSelections({});
    setCustomTexts({});
  }, []);

  return {
    selections,
    customTexts,
    setCustomTexts,
    expandedGroupId,
    setExpandedGroupId,
    handleSelect,
    resetSelections,
  };
};

