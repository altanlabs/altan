import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';

import DynamicFormFieldArrayItem from './DynamicFormFieldArrayItem';
import { getNested } from './utils';
import Iconify from '../../iconify';

const rsplit = (str, sep, maxsplit) => {
  const split = str.split(sep);
  return maxsplit ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit)) : split;
};

const DynamicFormFieldArray = ({ fieldKey, schema, enableLexical }) => {
  // const [fullKey, setFullKey] = useState(0);
  // const [isSorted, setIsSorted] = useState(true);
  // const { setValue } = useFormContext();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  // const currentFields = useWatch({
  //   control,
  //   name: fieldKey
  // });
  // const rawFields = useWatch({ name: fieldKey });

  // const fields = useMemo(() => {
  //   if (typeof rawFields === "object" && Array.isArray(rawFields)) {
  //     return rawFields;
  //   }
  //   if (!!rawFields && typeof rawFields === "string") {
  //     try {
  //       return JSON.parse(rawFields);
  //     } catch (e) {
  //       return [];
  //     }
  //   }
  //   return [];
  // }, [rawFields]);

  // TODO: fix array showing 0 fields after freetext

  const {
    fields,
    append,
    // update,
    remove,
    // swap
  } = useFieldArray({
    name: fieldKey,
    keyName: 'key',
  });

  // console.log("fields", fields);

  const defaultValues = useMemo(() => {
    if (!schema?.items?.properties) {
      return !!schema?.items?.type && schema.items.type === 'object' ? {} : '';
    }
    return Object.fromEntries(
      Object.entries(schema.items.properties).map(([key, value]) => [key, value.default ?? null]),
    );
  }, [schema?.items]);

  const sortPosition = useMemo(
    () => (!!schema?.sort_key ? { [schema?.sort_key]: fields.length } : {}),
    [fields.length, schema?.sort_key],
  );

  const addElement = useCallback(
    () =>
      append({
        ...defaultValues,
        ...sortPosition,
      }),
    [append, defaultValues, sortPosition],
  );

  // const onSwap = useCallback((index, mode) => {
  //   const arrayLength = fields.length;
  //   if ((mode === 'up' && !index) || (mode === 'down' && arrayLength - 1 === index)) {
  //     return null;
  //   }
  //   return () => {
  //     const indexA = index;
  //     const indexB = index + (mode === 'up' ? -1 : 1)
  //     if (schema?.sort_key) {
  //       const fieldA = fields[indexA];
  //       const fieldB = fields[indexB];
  //       const newFieldA = { ...fieldA, [schema?.sort_key]: fieldB[schema?.sort_key] };
  //       const newFieldB = { ...fieldB, [schema?.sort_key]: fieldA[schema?.sort_key] };
  //       // console.log("fieldA", indexA, fieldA);
  //       // console.log("fieldB", indexB, fieldB);
  //       update(indexB, newFieldA);
  //       update(indexA, newFieldB);
  //     } else {
  //       swap(indexA, indexB);
  //     }
  //     // setFullKey(prev => prev + 1);
  //   }
  // }, [fields, schema?.sort_key, swap]);

  const handleArrayItemDragEnd = useCallback(
    (e) => {
      const { active, over } = e;
      if (!active || !over) {
        return;
      }
      if (active?.id !== over?.id) {
        const [, indexA] = rsplit(active.id, '.', 1);
        const [, indexB] = rsplit(over.id, '.', 1);
        arrayMove(fields, parseInt(indexA), parseInt(indexB));
        // console.log("newFields",newFields);
        // if (schema?.sort_key) {
        //   newFields.forEach((item, i) => setNested(item, schema?.sort_key, i));
        // }
        // setValue(fieldKey, newFields, {
        //   shouldValidate: true,
        //   shouldTouch: true,
        //   shouldDirty: true,
        // });
      }
    },
    [fields],
  );

  // console.log("fields", fields);

  // const sortedFields = useMemo(() => {
  //   if (!schema?.sort_key || !fields.length) return null;

  //   return [...fields].sort((a, b) => {
  //     const aValue = getNested(a, schema.sort_key);
  //     const bValue = getNested(b, schema.sort_key);

  //     if (aValue === undefined || aValue === null || isNaN(aValue)) return 1;
  //     if (bValue === undefined || bValue === null || isNaN(bValue)) return -1;

  //     return Number(aValue) - Number(bValue);
  //   });
  // }, [fields, schema?.sort_key]);

  // useEffect(() => {
  //   setIsSorted(!schema.sort_key);
  // }, [schema.sort_key]);

  // useEffect(() => {
  //   if (!sortedFields?.length || isSorted) {
  //     return ;
  //   }
  //   setIsSorted(true);
  //   setValue(fieldKey, sortedFields);
  // }, [sortedFields]);

  // console.log("@dynarray.fields", typeof fields, fields, schema?.sort_key);
  // console.log("@dynarray.value", typeof value, value);

  const sortableItems = useMemo(
    () => fields.map((item, index) => `${fieldKey}.${index}`),
    [fieldKey, fields],
  );

  const renderArrayItem = useCallback(
    (elem, index) => {
      const fKey = `${fieldKey}.${index}`;
      const onDelete = () => remove(index);
      const key = `${fKey}_${elem.key}_${schema?.sort_key ? getNested(elem, schema.sort_key) : null}`;
      return (
        <div key={key}>
          <DynamicFormFieldArrayItem
            fieldKey={fKey}
            index={index}
            onDelete={onDelete}
            // onSwap={onSwap}
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
      onDragEnd={handleArrayItemDragEnd}
    >
      <Stack
        alignItems="start"
        width="100%"
      >
        <div style={{ width: '100%', px: 1 }}>
          {/* key={fullKey}>*/}
          <SortableContext
            items={sortableItems}
            strategy={verticalListSortingStrategy}
          >
            {fields?.map(renderArrayItem)}
          </SortableContext>
        </div>

        <Button
          size="small"
          onClick={addElement}
          startIcon={<Iconify icon="mdi:plus" />}
          fullWidth
        >
          Add {schema?.items?.title ?? 'Element'}
        </Button>
      </Stack>
    </DndContext>
  );
};

export default React.memo(DynamicFormFieldArray);
