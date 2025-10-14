import { useTheme } from '@mui/material/styles';
import React from 'react';

import QuestionOption from './QuestionOption';

// Question Group Component - represents a single question with options
const QuestionGroup = ({ title, children, groupId, selectedValue, onSelect }) => {
  const theme = useTheme();

  // Process children to inject props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;

    // Check for multi-option - look for value prop or data-mo-value attribute
    const optionValue = child.props?.value || child.props?.['data-mo-value'];
    const recommendedProp = child.props?.recommended || child.props?.['data-mo-recommended'];
    const isRecommended = recommendedProp === 'true' || recommendedProp === true;

    if (optionValue !== undefined) {
      return (
        <QuestionOption
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

  return (
    <div className="mb-4 last:mb-0">
      {title && (
        <div className="mb-2.5 px-1">
          <span
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: theme.palette.text.primary }}
          >
            {title}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-1.5">{enhancedChildren}</div>
    </div>
  );
};

export default QuestionGroup;
