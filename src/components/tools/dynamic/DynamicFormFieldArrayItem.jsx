import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';

import FormParameter from '../form/FormParameter';

const DynamicFormFieldArrayItem = ({
  fieldKey,
  schema,
  enableLexical,
  index,
  // onSwap,
  onDelete,
}) => {
  const { active, isDragging, attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: fieldKey,
      transition: {
        duration: 250, // milliseconds
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    });

  const updatedTransform = !active
    ? transform
    : {
        ...transform,
        scaleY: !isDragging ? 1 : 1.05,
        scaleX: !isDragging ? 1 : 1.05,
      };

  const style = {
    transform: CSS.Transform.toString(updatedTransform),
    transition,
    opacity: !!active && !isDragging ? 0.5 : 1,
    ...(isDragging && { boxShadow: '0 0 10px rgba(0,0,0,0.2)' }),
  };

  const draggableActive = true; // !!item && item.id !== 'new';

  return (
    <div
      style={{
        ...style,
        borderRadius: '8px',
        boxShadow: isDragging
          ? 'rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px'
          : 'rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px',
      }}
      {...(draggableActive ? attributes : {})}
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
