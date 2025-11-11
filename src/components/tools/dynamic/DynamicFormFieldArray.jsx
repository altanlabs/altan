import React, { useCallback, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Button } from '@/components/ui/button';

import DynamicFormFieldArrayItem from './DynamicFormFieldArrayItem';
import { getNested } from './utils';
import Iconify from '../../iconify';

// Helper function to split string from right
const rsplit = (str, sep, maxsplit) => {
  const split = str.split(sep);
  return maxsplit ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit)) : split;
};

// Helper function to get default values for new array elements
const getDefaultValues = (schema) => {
  if (!schema?.items?.properties) {
    return !!schema?.items?.type && schema.items.type === 'object' ? {} : '';
  }
  return Object.fromEntries(
    Object.entries(schema.items.properties).map(([key, value]) => [key, value.default ?? null]),
  );
};

// Helper function to get sort position for new elements
const getSortPosition = (schema, fieldsLength) => {
  return !!schema?.sort_key ? { [schema?.sort_key]: fieldsLength } : {};
};

const DynamicFormFieldArray = ({ fieldKey, schema, enableLexical }) => {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    name: fieldKey,
    keyName: 'key',
  });

  const defaultValues = useMemo(() => getDefaultValues(schema), [schema]);

  const sortPosition = useMemo(
    () => getSortPosition(schema, fields.length),
    [fields.length, schema],
  );

  const handleAddElement = useCallback(
    () => {
      append({
        ...defaultValues,
        ...sortPosition,
      });
    },
    [append, defaultValues, sortPosition],
  );

  const handleDragEnd = useCallback(
    (e) => {
      const { active, over } = e;
      if (!active || !over || active?.id === over?.id) {
        return;
      }

        const [, indexA] = rsplit(active.id, '.', 1);
        const [, indexB] = rsplit(over.id, '.', 1);
      arrayMove(fields, parseInt(indexA, 10), parseInt(indexB, 10));
    },
    [fields],
  );

  const sortableItems = useMemo(
    () => fields.map((item, index) => `${fieldKey}.${index}`),
    [fieldKey, fields],
  );

  const renderArrayItem = useCallback(
    (elem, index) => {
      const fKey = `${fieldKey}.${index}`;
      const handleDelete = () => remove(index);
      const key = `${fKey}_${elem.key}_${schema?.sort_key ? getNested(elem, schema.sort_key) : null}`;
      return (
        <div key={key}>
          <DynamicFormFieldArrayItem
            fieldKey={fKey}
            index={index}
            onDelete={handleDelete}
            enableLexical={enableLexical}
            schema={schema}
          />
        </div>
      );
    },
    [enableLexical, fieldKey, remove, schema],
  );

  if (!schema?.items) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col items-start w-full gap-2">
        <div className="w-full px-1">
          <SortableContext
            items={sortableItems}
            strategy={verticalListSortingStrategy}
          >
            {fields?.map(renderArrayItem)}
          </SortableContext>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleAddElement}
          className="w-full h-8"
        >
          <Iconify icon="mdi:plus" width={16} className="mr-1.5" />
          Add {schema?.items?.title ?? 'Element'}
        </Button>
      </div>
    </DndContext>
  );
};

export default React.memo(DynamicFormFieldArray);
