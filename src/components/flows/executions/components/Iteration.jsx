import { memo, useCallback } from 'react';

import AttributeItem from './AttributeItem.jsx';

const Iteration = ({
  content,
  path = '',
  handleClick,
  searchTerm,
  onSelect,
  disableSelection,
  onShowPopover,
}) => {
  const calculatePath = useCallback(
    (key) => {
      return Array.isArray(content) ? `${path}.[${key}]` : `${path}.${key}`;
    },
    [path, content],
  );

  const renderAttributeItem = useCallback(
    (value, key = null) => {
      const currentPath = key !== null ? calculatePath(key) : path;
      return (
        <AttributeItem
          key={key || currentPath}
          value={value}
          depth={0}
          path={currentPath}
          handleClick={(currentPath) => handleClick(currentPath, typeof value, value)}
          searchTerm={searchTerm}
          onSelect={onSelect}
          disableSelection={disableSelection}
          onShowPopover={onShowPopover}
        />
      );
    },
    [calculatePath, path, searchTerm, onSelect, disableSelection, onShowPopover, handleClick],
  );

  if (typeof content === 'object' && content !== null) {
    // Object.entries for objects/arrays
    return Object.entries(content).map(([key, val]) => renderAttributeItem(val, key));
  }

  // Primitive types
  return renderAttributeItem(content);
};

export default memo(Iteration);
