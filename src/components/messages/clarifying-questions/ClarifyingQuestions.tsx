import { ChevronDown, MessageCircleQuestion, Send } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { sendMessage } from '../../../redux/slices/room/thunks/messageThunks';
import { dispatch } from '../../../redux/store';
import { Textarea } from '../../ui/textarea';

import { useAnsweredQuestions } from './hooks/useAnsweredQuestions';
import { useQuestionSelection } from './hooks/useQuestionSelection';
import QuestionGroup from './QuestionGroup';
import type { ClarifyingQuestionsProps } from './types';
import { createChildrenKey, formatMessage, hashString, parseQuestionGroups } from './utils';

const ClarifyingQuestions: React.FC<ClarifyingQuestionsProps> = ({ children, threadId }) => {
  const [additionalThoughts, setAdditionalThoughts] = useState('');
  const [showAnsweredDetails, setShowAnsweredDetails] = useState(false);

  const childrenKey = useMemo(() => createChildrenKey(children), [children]);
  const questionSetHash = useMemo(() => hashString(childrenKey), [childrenKey]);

  const { isAlreadyAnswered, previousAnswers, markAsAnswered } = useAnsweredQuestions(questionSetHash);

  const questionGroups = useMemo(() => parseQuestionGroups(children), [childrenKey]);

  const {
    selections,
    customTexts,
    setCustomTexts,
    expandedGroupId,
    setExpandedGroupId,
    handleSelect,
    resetSelections,
  } = useQuestionSelection(questionGroups);

  const handleConfirm = (): void => {
    const selectedValues = Object.values(selections).filter(Boolean);
    if (selectedValues.length === 0 || !threadId) return;

    const finalMessage = formatMessage(selections, customTexts, additionalThoughts);

    markAsAnswered({
      selections,
      customTexts,
      additionalThoughts,
      formattedMessage: finalMessage,
      questionTitles: questionGroups.map((g) => g.title),
    });

    dispatch(
      sendMessage({
        content: finalMessage,
        threadId,
      }),
    );

    resetSelections();
    setAdditionalThoughts('');
  };

  const selectedCount = Object.values(selections).filter(Boolean).length;

  if (questionGroups.length === 0) {
    return null;
  }

  if (isAlreadyAnswered && previousAnswers) {
    return (
      <div className="my-2 px-0.5">
        <button
          onClick={() => setShowAnsweredDetails(!showAnsweredDetails)}
          className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          <div className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
          <span>Answered</span>
          <ChevronDown
            className={`h-2.5 w-2.5 transition-transform ${showAnsweredDetails ? 'rotate-180' : ''}`}
          />
        </button>
        {showAnsweredDetails && (
          <div className="mt-1.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-500 whitespace-pre-line pl-3.5">
            {previousAnswers.formattedMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="my-3 space-y-1.5">
      <div className="flex items-center gap-1.5 px-0.5">
        <MessageCircleQuestion className="h-3 w-3 text-neutral-400 dark:text-neutral-600" />
        <span className="text-[11px] text-neutral-500 dark:text-neutral-500">
          {selectedCount > 0 ? `${selectedCount} selected` : 'Clarify'}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="space-y-1">
          {questionGroups.map((group) => {
            const isNotSureSelected = selections[group.id] === 'Not sure / Need to dive deeper on this';
            return (
              <div key={group.id} className="space-y-1">
                <QuestionGroup
                  groupId={group.id}
                  title={group.title}
                  selectedValue={selections[group.id]}
                  onSelect={handleSelect}
                  isExpanded={expandedGroupId === group.id}
                  onToggle={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
                >
                  {group.children}
                </QuestionGroup>

                {isNotSureSelected && (
                  <Textarea
                    placeholder="Explain what you'd like to clarify..."
                    value={customTexts[group.id] || ''}
                    onChange={(e) => setCustomTexts((prev) => ({ ...prev, [group.id]: e.target.value }))}
                    className="min-h-[40px] resize-none text-[11px] ml-0.5"
                    autoFocus
                  />
                )}
              </div>
            );
          })}
        </div>

        {selectedCount > 0 && (
          <>
            <Textarea
              placeholder="Additional context (optional)"
              value={additionalThoughts}
              onChange={(e) => setAdditionalThoughts(e.target.value)}
              className="min-h-[40px] resize-none text-[11px]"
            />
            <button
              onClick={handleConfirm}
              className="w-full px-2 py-1.5 rounded text-[11px] font-medium bg-neutral-800 dark:bg-neutral-200 text-neutral-100 dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1"
            >
              <Send className="h-3 w-3" />
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClarifyingQuestions;

