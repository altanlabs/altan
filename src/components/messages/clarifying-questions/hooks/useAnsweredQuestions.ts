import { useCallback, useEffect, useState } from 'react';

import type { AnsweredData } from '../types';

const STORAGE_KEY = 'clarifying_questions_answered';

const getAnsweredQuestions = (): Record<string, AnsweredData> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveAnsweredQuestion = (hash: string, data: Omit<AnsweredData, 'timestamp'>): void => {
  try {
    const answered = getAnsweredQuestions();
    answered[hash] = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answered));
  } catch {
    // Ignore storage errors
  }
};

export const useAnsweredQuestions = (questionSetHash: string) => {
  const [isAlreadyAnswered, setIsAlreadyAnswered] = useState(false);
  const [previousAnswers, setPreviousAnswers] = useState<AnsweredData | null>(null);

  useEffect(() => {
    const answered = getAnsweredQuestions();
    if (answered[questionSetHash]) {
      setIsAlreadyAnswered(true);
      setPreviousAnswers(answered[questionSetHash]);
    }
  }, [questionSetHash]);

  const markAsAnswered = useCallback(
    (data: Omit<AnsweredData, 'timestamp'>) => {
      saveAnsweredQuestion(questionSetHash, data);
      setIsAlreadyAnswered(true);
      setPreviousAnswers({
        ...data,
        timestamp: Date.now(),
      });
    },
    [questionSetHash],
  );

  return {
    isAlreadyAnswered,
    previousAnswers,
    markAsAnswered,
  };
};

