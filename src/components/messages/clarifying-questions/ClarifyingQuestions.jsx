import React from 'react';

import QuestionGroup from './QuestionGroup';
import { sendMessage } from '../../../redux/slices/room';
import { dispatch } from '../../../redux/store';

// Clarifying Questions Component - main container with multiple question groups
const ClarifyingQuestions = ({ children, threadId }) => {
  // State: { groupId: selectedValue }
  const [selections, setSelections] = React.useState({});
  // Track which group is currently expanded
  const [expandedGroupId, setExpandedGroupId] = React.useState(null);

  // Process children to create question groups
  const questionGroups = React.useMemo(() => {
    const groups = [];
    let currentGroup = null;
    let groupIndex = 0;

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;

      // Check for question-group - look for title prop or data-qg-title attribute
      const questionTitle = child.props?.title || child.props?.['data-qg-title'];

      if (questionTitle !== undefined) {
        // This is a question-group
        if (currentGroup) {
          groups.push(currentGroup);
        }
        const groupId = `group-${groupIndex++}`;
        currentGroup = {
          id: groupId,
          title: questionTitle,
          children: React.Children.toArray(child.props.children),
        };
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [children]);

  // Initialize first group as expanded
  React.useEffect(() => {
    if (expandedGroupId === null && questionGroups.length > 0) {
      setExpandedGroupId(questionGroups[0].id);
    }
  }, [expandedGroupId, questionGroups]);

  const handleSelect = React.useCallback(
    (groupId, value) => {
      setSelections((prev) => ({
        ...prev,
        [groupId]: value,
      }));

      // Find current group index
      const currentIndex = questionGroups.findIndex((g) => g.id === groupId);

      // If there's a next group, expand it after animation completes
      if (currentIndex !== -1 && currentIndex < questionGroups.length - 1) {
        setTimeout(() => {
          setExpandedGroupId(questionGroups[currentIndex + 1].id);
        }, 500);
      }
    },
    [questionGroups],
  );

  const handleConfirm = () => {
    const selectedValues = Object.values(selections).filter(Boolean);
    if (selectedValues.length === 0 || !threadId) return;

    // Format as numbered list: "1. option\n2. option\n..."
    const formattedMessage = selectedValues
      .map((option, index) => `${index + 1}. ${option}`)
      .join('\n');

    dispatch(
      sendMessage({
        content: formattedMessage,
        threadId,
      }),
    );

    // Reset selections after sending
    setSelections({});
  };

  const selectedCount = Object.values(selections).filter(Boolean).length;

  // Safety check: if no question groups, don't render
  if (questionGroups.length === 0) {
    return null;
  }

  return (
    <div className="my-3 p-3.5 bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-800/30 dark:to-gray-900/40 backdrop-blur-md border-2 border-gray-200/70 dark:border-gray-700/60 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-500/25 dark:to-purple-500/25 shadow-sm">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Select options to clarify
        </span>
        {selectedCount > 0 && (
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full shadow-sm bg-blue-500/20 text-blue-600 dark:bg-blue-500/30 dark:text-blue-300">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Question Groups */}
      <div className="mb-3 space-y-2">
        {questionGroups.map((group) => (
          <QuestionGroup
            key={group.id}
            groupId={group.id}
            title={group.title}
            selectedValue={selections[group.id]}
            onSelect={handleSelect}
            isExpanded={expandedGroupId === group.id}
            onToggle={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
          >
            {group.children}
          </QuestionGroup>
        ))}
      </div>

      {/* Continue Button - Always visible when selections exist */}
      {selectedCount > 0 && (
        <button
          onClick={handleConfirm}
          style={{ transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black"
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default ClarifyingQuestions;
