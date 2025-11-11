import { memo, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '@lib/utils';

import FormParameter from '../form/FormParameter';

const DynamicFormFieldArrayItem = ({
  fieldKey,
  schema,
  enableLexical,
  index,
  onDelete,
}) => {
  const { active, isDragging, attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: fieldKey,
      transition: {
        duration: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    });

  const updatedTransform = useMemo(
    () =>
      !active
    ? transform
    : {
        ...transform,
            scaleY: !isDragging ? 1 : 1.02,
            scaleX: !isDragging ? 1 : 1.02,
          },
    [active, transform, isDragging],
  );

  const style = useMemo(
    () => ({
    transform: CSS.Transform.toString(updatedTransform),
    transition,
    opacity: !!active && !isDragging ? 0.5 : 1,
    }),
    [updatedTransform, transition, active, isDragging],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg transition-shadow',
        isDragging
          ? 'shadow-lg ring-2 ring-border/50'
          : 'shadow-sm ring-1 ring-border/20 hover:ring-border/40',
      )}
      {...attributes}
    >
      <FormParameter
        fieldKey={fieldKey}
        schema={schema.items}
        required={false}
        isArrayElement={true}
        onDeleteArrayElement={onDelete}
        dragListeners={listeners}
        dragRef={setNodeRef}
        isDragging={isDragging}
        enableLexical={enableLexical}
        sortKey={schema.sort_key}
        index={index}
      />
    </div>
  );
};

export default memo(DynamicFormFieldArrayItem);
