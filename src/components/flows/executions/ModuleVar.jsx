import { Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { memo, useCallback } from 'react';

import AttributeItem from './components/AttributeItem.jsx';
import DynamicVirtuoso from './components/DynamicVirtuoso.jsx';
import IteratorModule from './components/IteratorModule.jsx';
import { VarOption } from '../../lexical/nodes/VarNode.tsx';

/**
 * Resolve nested properties in an object using a dot notation reference.
 * @param {string} ref - The reference path, e.g., "a.b[0].c".
 * @param {object} initialObject - The initial object to resolve the path in.
 * @returns {any} The resolved value.
 */
export const resolveNested = (ref, initialObject) => {
  let value = initialObject;
  const keys = ref.split('.');

  for (const k of keys) {
    if (!value) return null;

    if (typeof value === 'object' && !Array.isArray(value) && k in value) {
      value = value[k];
    } else if (Array.isArray(value) && k.startsWith('[') && k.endsWith(']')) {
      const index = parseInt(k.slice(1, -1), 10);
      if (isNaN(index)) throw new Error('Invalid index');
      value = value[index];
    } else {
      return null;
    }
  }

  return value;
};

// Utility functions for checking types
const isArray = Array.isArray;
const isObject = (obj) => obj && obj.constructor === Object;

// const isEmpty = (obj) => {
//   if ([undefined, null].includes(obj)) return true;
//   if (isArray(obj)) return !obj.length;
//   if (isObject(obj)) return !Object.entries(obj).length;
//   return false;
// };

const containsSearchTerm = (obj, searchTerm) => {
  if (!isObject(obj) || obj === null) {
    return false;
  }
  return Object.keys(obj).some(
    (key) => key.includes(searchTerm) || containsSearchTerm(obj[key], searchTerm),
  );
};

/**
 * Recursive component to render attributes as styled Typography components.
 */
const ModuleVar = ({
  obj,
  depth = 0,
  path = '',
  searchTerm = '',
  onSelect = null,
  moduleType = null,
  disableSelection = false,
  onShowPopover = null,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = useCallback(
    (currentPath, type, value) => {
      if (onSelect) {
        onSelect(new VarOption(currentPath, type, value));
      } else {
        enqueueSnackbar('Copied path to clipboard!');
        navigator.clipboard.writeText(`{{${currentPath}}}`);
      }
    },
    [onSelect, enqueueSnackbar],
  );

  if (
    [undefined, null].includes(obj) ||
    (!containsSearchTerm(obj, searchTerm) && !path.includes(searchTerm))
  ) {
    return null;
  }

  const renderItem = (item, index) => {
    const value = isArray(obj) ? item : item[1];
    const key = isArray(obj) ? index : item[0];

    // if (isEmpty(value)) return null;
    if (!isArray(obj) && !(key.includes(searchTerm) || containsSearchTerm(value, searchTerm)))
      return null;

    const attributePath = isArray(obj) ? `${path}.[${key}]` : path ? `${path}.${key}` : key;

    return (
      <AttributeItem
        key={key}
        value={value}
        depth={depth}
        path={attributePath}
        searchTerm={searchTerm}
        handleClick={handleClick}
        onSelect={onSelect}
        disableSelection={disableSelection}
        onShowPopover={onShowPopover}
      />
    );
  };

  if (moduleType === 'iterator' && depth === 0) {
    return (
      <IteratorModule
        value={obj}
        path={Object.keys(obj)[0]}
        handleClick={handleClick}
        searchTerm={searchTerm}
        onSelect={onSelect}
        disableSelection={disableSelection}
        onShowPopover={onShowPopover}
      />
    );
  }

  return isArray(obj) ? (
    !obj.length ? null : (
      <DynamicVirtuoso
        key={`virtuoso-arr-global-vars-${path}`}
        obj={obj}
        path={path}
        renderItem={renderItem}
      />
    )
  ) : (
    <Stack
      width="100%"
      height="100%"
      className="space-y-1"
    >
      {Object.entries(obj).map(renderItem)}
    </Stack>
  );
};

export default memo(ModuleVar);
