/**
 * Questions Section
 * Displays unanswered clarifying questions indicator within the action cockpit
 */

import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ChevronRight, MessageCircleQuestion } from 'lucide-react';
import { selectMessagesById } from '../../../redux/slices/room/selectors/messageSelectors';
import { makeSelectSortedThreadMessageIds } from '../../../redux/slices/room/selectors/threadSelectors';
import { useNavigateToMessage } from '../hooks/useNavigateToMessage';

interface QuestionsSectionProps {
  threadId: string;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({ threadId }) => {
  const messagesSelector = useMemo(() => makeSelectSortedThreadMessageIds(), []);
  const messageIds = useSelector((state) => messagesSelector(state, threadId));
  const messagesById = useSelector(selectMessagesById);
  const { navigateToMessage } = useNavigateToMessage();

  // Find messages with unanswered clarifying questions
  const questionsMessages = useMemo(() => {
    const messages = messageIds
      .map((id) => messagesById[id])
      .filter(Boolean);

    // Look for messages with clarifying-questions tags
    // This is a simplified check - you may need to enhance based on your message structure
    return messages.filter((msg) => {
      const content = msg?.content || '';
      return content.includes('<clarifying-questions>') || content.includes('clarifying-questions');
    });
  }, [messageIds, messagesById]);

  // Don't render if no questions
  if (questionsMessages.length === 0) {
    return null;
  }

  const handleClick = () => {
    // Navigate to the first message with questions
    if (questionsMessages.length > 0) {
      navigateToMessage(questionsMessages[0].id);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full px-2 py-1.5 flex items-center justify-between gap-2 border border-neutral-200 dark:border-neutral-800 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-left group"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-900">
          <MessageCircleQuestion className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
            {questionsMessages.length} question{questionsMessages.length !== 1 ? 's' : ''} need{questionsMessages.length === 1 ? 's' : ''} answers
          </p>
        </div>
      </div>
      <ChevronRight className="h-3 w-3 text-neutral-400 dark:text-neutral-600 flex-shrink-0 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors" />
    </button>
  );
};

export default memo(QuestionsSection);
export { QuestionsSection };

