export interface QuestionGroupData {
  id: string;
  title: string;
  children: React.ReactElement[];
}

export interface AnsweredData {
  selections: Record<string, string>;
  customTexts: Record<string, string>;
  additionalThoughts: string;
  formattedMessage: string;
  questionTitles: string[];
  timestamp: number;
}

export interface QuestionOptionProps {
  value: string;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: (groupId: string, value: string) => void;
  groupId: string;
  children: React.ReactNode;
}

export interface QuestionGroupProps {
  groupId: string;
  title: string;
  selectedValue?: string;
  onSelect: (groupId: string, value: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export interface ClarifyingQuestionsProps {
  children: React.ReactNode;
  threadId?: string;
}

