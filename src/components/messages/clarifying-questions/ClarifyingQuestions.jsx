import { MessageCircleQuestion, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import React from 'react';

import QuestionGroup from './QuestionGroup';
import { sendMessage } from '../../../redux/slices/room/thunks/messageThunks';
import { dispatch } from '../../../redux/store.ts';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button.tsx';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Textarea } from '../../ui/textarea';

// Simple hash function for question sets
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

// Helper to create a stable key from children structure
const createChildrenKey = (children) => {
  const parts = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const questionTitle = child.props?.title || child.props?.['data-qg-title'];
    if (questionTitle !== undefined) {
      parts.push(questionTitle);
      // Include count of child options for more stable tracking
      const childCount = React.Children.count(child.props.children);
      parts.push(childCount);
    }
  });
  return parts.join('|');
};

// LocalStorage helpers for answered questions
const STORAGE_KEY = 'clarifying_questions_answered';

const getAnsweredQuestions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveAnsweredQuestion = (hash, data) => {
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

// Clarifying Questions Component - main container with multiple question groups
const ClarifyingQuestions = ({ children, threadId }) => {
  // State: { groupId: selectedValue }
  const [selections, setSelections] = React.useState({});
  // Track which group is currently expanded
  const [expandedGroupId, setExpandedGroupId] = React.useState(null);
  // Additional thoughts from user
  const [additionalThoughts, setAdditionalThoughts] = React.useState('');
  // Track custom text for "Not sure" selections: { groupId: customText }
  const [customTexts, setCustomTexts] = React.useState({});
  // Track if this question set was previously answered
  const [isAlreadyAnswered, setIsAlreadyAnswered] = React.useState(false);
  const [previousAnswers, setPreviousAnswers] = React.useState(null);
  // Track if expanded view is shown for already answered
  const [showAnsweredDetails, setShowAnsweredDetails] = React.useState(false);

  // Track pending timeout to cancel on re-render
  const timeoutRef = React.useRef(null);

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Create stable key from children structure to prevent unnecessary recalculations
  const childrenKey = React.useMemo(() => createChildrenKey(children), [children]);

  // Generate hash for this question set
  const questionSetHash = React.useMemo(() => hashString(childrenKey), [childrenKey]);

  // Check if this question set has been answered before
  React.useEffect(() => {
    const answered = getAnsweredQuestions();
    if (answered[questionSetHash]) {
      setIsAlreadyAnswered(true);
      setPreviousAnswers(answered[questionSetHash]);
    }
  }, [questionSetHash]);

  // Process children to create question groups - use stable key instead of children reference
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

        // Get existing children and append the default "Not sure" option
        const existingChildren = React.Children.toArray(child.props.children);
        const defaultOption = React.createElement(
          'multi-option',
          {
            key: 'not-sure',
            value: 'Not sure / Need to dive deeper on this',
            'data-mo-value': 'Not sure / Need to dive deeper on this',
          },
          'Not sure / Need to dive deeper on this',
        );

        currentGroup = {
          id: groupId,
          title: questionTitle,
          children: [...existingChildren, defaultOption],
        };
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenKey]); // Use stable key instead of children to prevent recalc on every stream update

  // Initialize first group as expanded - only run once when groups are first available
  React.useEffect(() => {
    if (expandedGroupId === null && questionGroups.length > 0) {
      setExpandedGroupId(questionGroups[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedGroupId, questionGroups.length]); // Use length instead of entire array to prevent unnecessary reruns

  const handleSelect = React.useCallback(
    (groupId, value) => {
      setSelections((prev) => ({
        ...prev,
        [groupId]: value,
      }));

      // If selecting "Not sure", don't auto-expand next - let user write custom text
      const isNotSure = value === 'Not sure / Need to dive deeper on this';

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If not "Not sure", find current group index and expand next
      if (!isNotSure) {
        const currentIndex = questionGroups.findIndex((g) => g.id === groupId);

        // If there's a next group, expand it after animation completes
        if (currentIndex !== -1 && currentIndex < questionGroups.length - 1) {
          timeoutRef.current = setTimeout(() => {
            setExpandedGroupId(questionGroups[currentIndex + 1].id);
            timeoutRef.current = null;
          }, 500);
        }
      }
    },
    [questionGroups],
  );

  const handleConfirm = React.useCallback(() => {
    const selectedValues = Object.values(selections).filter(Boolean);
    if (selectedValues.length === 0 || !threadId) return;

    // Format as numbered list, using custom text for "Not sure" options
    const formattedMessage = Object.entries(selections)
      .filter(([, value]) => Boolean(value))
      .map(([groupId, value], index) => {
        // If it's "Not sure" and has custom text, use that instead
        if (value === 'Not sure / Need to dive deeper on this' && customTexts[groupId]?.trim()) {
          return `${index + 1}. ${customTexts[groupId].trim()}`;
        }
        return `${index + 1}. ${value}`;
      })
      .join('\n');

    // Add additional thoughts if provided
    const finalMessage = additionalThoughts.trim()
      ? `${formattedMessage}\n\nAdditional context:\n${additionalThoughts.trim()}`
      : formattedMessage;

    // Save to localStorage
    saveAnsweredQuestion(questionSetHash, {
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

    // Mark as answered and update state
    setIsAlreadyAnswered(true);
    setPreviousAnswers({
      selections,
      customTexts,
      additionalThoughts,
      formattedMessage: finalMessage,
      questionTitles: questionGroups.map((g) => g.title),
      timestamp: Date.now(),
    });

    // Reset selections, custom texts, and thoughts after sending
    setSelections({});
    setCustomTexts({});
    setAdditionalThoughts('');
  }, [selections, customTexts, additionalThoughts, threadId, questionSetHash, questionGroups]);

  const selectedCount = Object.values(selections).filter(Boolean).length;

  // Safety check: if no question groups, don't render
  if (questionGroups.length === 0) {
    return null;
  }

  // If already answered, show compact "answered" state
  if (isAlreadyAnswered && previousAnswers) {
    return (
      <div className="my-3">
        <button
          onClick={() => setShowAnsweredDetails(!showAnsweredDetails)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span>Answered clarification questions</span>
          <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${showAnsweredDetails ? 'rotate-180' : ''}`} />
        </button>
        {showAnsweredDetails && (
          <div className="mt-2 text-xs text-foreground/70 whitespace-pre-line bg-muted/30 rounded-lg p-2.5 border animate-in fade-in-50 slide-in-from-top-1">
            {previousAnswers.formattedMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="my-2">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <MessageCircleQuestion className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Select options to clarify
          </span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {selectedCount} selected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        {/* Question Groups */}
        <div className="space-y-2">
          {questionGroups.map((group) => {
            const isNotSureSelected = selections[group.id] === 'Not sure / Need to dive deeper on this';
            return (
              <div key={group.id} className="space-y-2">
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

                {/* Show text input when "Not sure" is selected */}
                {isNotSureSelected && (
                  <div className="ml-2 space-y-1.5 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                    <label className="text-xs font-medium text-muted-foreground">
                      Please explain your thoughts:
                    </label>
                    <Textarea
                      placeholder="What would you like to clarify or dive deeper into?"
                      value={customTexts[group.id] || ''}
                      onChange={(e) => setCustomTexts((prev) => ({ ...prev, [group.id]: e.target.value }))}
                      className="min-h-[60px] resize-none text-sm"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Thoughts */}
        {selectedCount > 0 && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Additional context (optional)
            </label>
            <Textarea
              placeholder="Add any additional thoughts or context..."
              value={additionalThoughts}
              onChange={(e) => setAdditionalThoughts(e.target.value)}
              className="min-h-[70px] resize-none"
            />
          </div>
        )}

        {/* Continue Button - Always visible when selections exist */}
        {selectedCount > 0 && (
          <Button
            onClick={handleConfirm}
            className="w-full"
            size="default"
          >
            <Send className="w-4 h-4 mr-2" />
            Continue
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ClarifyingQuestions;
