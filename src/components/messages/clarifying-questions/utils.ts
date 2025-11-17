import React from 'react';

import type { QuestionGroupData } from './types';

export const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const createChildrenKey = (children: React.ReactNode): string => {
  const parts: (string | number)[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const questionTitle = child.props?.title || child.props?.['data-qg-title'];
    if (questionTitle !== undefined) {
      parts.push(questionTitle);
      const childCount = React.Children.count(child.props.children);
      parts.push(childCount);
    }
  });
  return parts.join('|');
};

export const createOptionsKey = (children: React.ReactNode): string => {
  const parts: string[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const optionValue = child.props?.value || child.props?.['data-mo-value'];
    if (optionValue !== undefined) {
      parts.push(optionValue);
    }
  });
  return parts.join('|');
};

export const parseQuestionGroups = (children: React.ReactNode): QuestionGroupData[] => {
  const groups: QuestionGroupData[] = [];
  let currentGroup: QuestionGroupData | null = null;
  let groupIndex = 0;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const questionTitle = child.props?.title || child.props?.['data-qg-title'];

    if (questionTitle !== undefined) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      const groupId = `group-${groupIndex++}`;

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
};

export const formatMessage = (
  selections: Record<string, string>,
  customTexts: Record<string, string>,
  additionalThoughts: string,
): string => {
  const formattedMessage = Object.entries(selections)
    .filter(([, value]) => Boolean(value))
    .map(([groupId, value], index) => {
      if (value === 'Not sure / Need to dive deeper on this' && customTexts[groupId]?.trim()) {
        return `${index + 1}. ${customTexts[groupId].trim()}`;
      }
      return `${index + 1}. ${value}`;
    })
    .join('\n');

  return additionalThoughts.trim()
    ? `${formattedMessage}\n\nAdditional context:\n${additionalThoughts.trim()}`
    : formattedMessage;
};

