import { truncate } from 'lodash';
import { memo, useState, useEffect, useCallback } from 'react';

import { cn } from '@lib/utils';

import useCopyToClipboard from '../../../../hooks/useCopyToClipboard';
import Iconify from '../../../iconify';
import ModuleVar from '../ModuleVar.jsx';

/**
 * Resolve nested properties in an object using a dot notation reference.
 * @param {string} ref - The reference path, e.g., "a.b[0].c".
 * @param {object} initialObject - The initial object to resolve the path in.
 * @returns {any} The resolved value.
 */

// Utility functions for checking types
const isArray = Array.isArray;
const isObject = (obj) => obj && obj.constructor === Object;

const isJSONString = (str) => {
  try {
    return typeof str === 'string' && JSON.parse(str) && true;
  } catch {
    return false;
  }
};

const AttributeItem = ({
  value,
  depth,
  path,
  handleClick,
  searchTerm = '',
  disableSelection = false,
  onSelect,
  onShowPopover,
}) => {
  const title = path.split('.').pop();
  const [isCollapsed, setIsCollapsed] = useState(
    isArray(value) || (title.includes('__stats') && !searchTerm.includes('__stats')),
  );
  const isObjectOrArray = isObject(value) || isArray(value);
  const { copy } = useCopyToClipboard();

  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);

  useEffect(() => {
    if (searchTerm && title.includes(searchTerm)) {
      setIsCollapsed(false);
    }
  }, [searchTerm, title]);

  const handlePreviewClick = useCallback(
    (e) => {
      e.stopPropagation();

      const content =
        isObject(value) || isArray(value) ? (
          <div className="whitespace-pre-wrap break-words">{JSON.stringify(value, null, 2)}</div>
        ) : isJSONString(value) ? (
          <div className="whitespace-pre-wrap break-words">
            {JSON.stringify(JSON.parse(value), null, 2)}
          </div>
        ) : (
          String(value)
        );

      onShowPopover(e, content);
    },
    [value, onShowPopover],
  );

  const onClickInsert = useCallback(
    (e) => {
      e.stopPropagation();
      if (!disableSelection) {
        handleClick(path, typeof value, value);
      }
    },
    [disableSelection, handleClick, path, value],
  );

  return (
    <div
      className="flex flex-col w-full space-y-1"
      style={{ paddingLeft: depth * 8 }}
    >
      <div className="flex items-center space-x-2 group w-full">
        <span
          className={cn(
            'px-2 py-1 rounded bg-gray-600 text-white text-sm cursor-pointer',
            !disableSelection && 'hover:bg-gray-500',
          )}
          onClick={onClickInsert}
        >
          {`${title}${isArray(value) ? '[]' : ''}`}
        </span>
        {!isObjectOrArray && (
          <span
            className="text-sm text-gray-700 w-full flex-no-wrap truncate cursor-pointer hover:underline"
            onClick={() => copy(!isObjectOrArray ? String(value) : JSON.stringify(value))}
          >
            {truncate(String(value), { length: 200 })}
          </span>
        )}
        {isObjectOrArray && (
          <Iconify
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={toggleCollapse}
            icon={isCollapsed ? 'mdi:chevron-right' : 'mdi:expand-more'}
          />
        )}
        <button
          className="hidden group-hover:block px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-400"
          onClick={handlePreviewClick}
        >
          Preview
        </button>
      </div>

      {!isCollapsed && isObjectOrArray && (
        <ModuleVar
          obj={value}
          depth={depth + 1}
          path={path}
          searchTerm={searchTerm}
          disableSelection={disableSelection}
          onShowPopover={onShowPopover}
          onSelect={onSelect}
        />
      )}
    </div>
  );
};

export default memo(AttributeItem);
