import { memo, useState } from 'react';

import ModuleMenuLarge from './ModuleMenuLarge';

const MIN_WIDTH = 20;
const MIN_WIDTH_MIDDLE = 30;
const DEFAULT_WIDTH_LEFT = 40;
const DEFAULT_WIDTH_MIDDLE = 60;

const ModuleMenuDraggable = () => {
  const [leftWidthPercent, setLeftWidthPercent] = useState(DEFAULT_WIDTH_LEFT); // Initial width percentage of the left component
  const [middleWidthPercent, setMiddleWidthPercent] = useState(DEFAULT_WIDTH_MIDDLE);
  // const rightWidthPercent = useMemo(() => 100 - (leftWidthPercent + middleWidthPercent), [leftWidthPercent, middleWidthPercent]);

  // const handleDrag = useCallback((ui) => {
  //   const totalWidth = ui.node.parentNode.offsetWidth; // Step 1: Get the parent container's total width in pixels
  //   const deltaXPercent = (ui.deltaX / totalWidth) * 100; // Step 2: Convert the drag movement to a percentage of the total width

  //   setLeftWidthPercent(prev => {
  //     let newLeftWidthPercent = prev + deltaXPercent * 1.67;
  //     newLeftWidthPercent = Math.max(MIN_WIDTH, Math.min(newLeftWidthPercent, 100 - MIN_WIDTH)); // Applying constraints: min 10%, max 90%
  //     console.log("handleDrag", totalWidth, deltaXPercent, newLeftWidthPercent);
  //     return newLeftWidthPercent;
  //   }); // Update the left column's width percentage
  //   // The middle and right columns will automatically adjust based on the left column's width percentage
  // }, []);

  const handleResizeStart = (e, edge) => {
    e.stopPropagation(); // Prevent the drag event from triggering
    const startX = e.clientX; // Starting X position of the mouse
    const parentNode = e.target.parentNode;
    parentNode.style.userSelect = 'none';
    const parentNodeWidth = parentNode.offsetWidth; // Width of the parent container

    const startMiddleWidthPercent = middleWidthPercent; // Initial middle column width in percentage
    const startLeftWidthPercent = leftWidthPercent; // Initial left column width in percentage

    const doDrag = (e) => {
      const deltaX = e.clientX - startX; // Change in X position of the mouse
      const deltaXPercent = (deltaX / parentNodeWidth) * 100; // Change in percentage relative to the parent container

      if (edge === 'left') {
        // Calculate new widths when resizing from the left edge
        let newLeftWidthPercent = Math.max(MIN_WIDTH, startLeftWidthPercent + deltaXPercent);
        // let newMiddleWidthPercent = Math.max(MIN_WIDTH, 100 - newLeftWidthPercent - MIN_WIDTH); // Ensure right column maintains min 10%
        const newMiddleWidthPercent = Math.max(MIN_WIDTH, 100 - newLeftWidthPercent); // without output

        // Ensure the left column does not exceed its max possible width (with output)
        // if (newLeftWidthPercent + newMiddleWidthPercent > 100 - MIN_WIDTH) {
        //   newLeftWidthPercent = 100 - MIN_WIDTH - newMiddleWidthPercent;
        // }
        if (newLeftWidthPercent + newMiddleWidthPercent > 100) {
          newLeftWidthPercent = 100 - newMiddleWidthPercent;
        }

        setMiddleWidthPercent(newMiddleWidthPercent);
        setLeftWidthPercent(newLeftWidthPercent);
      }
      // else if (edge === 'right') {
      //   // Calculate new width when resizing from the right edge
      //   let newMiddleWidthPercent = Math.max(MIN_WIDTH_MIDDLE, Math.min(100 - MIN_WIDTH * 2, startMiddleWidthPercent + deltaXPercent)); // Middle max 80%

      //   setMiddleWidthPercent(newMiddleWidthPercent);
      // }
    };

    const stopDrag = () => {
      parentNode.style.userSelect = 'all';
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  // const onDragMove = useCallback((event) => {
  //   const totalWidth = event.activatorEvent.target.offsetParent.offsetParent.clientWidth; // Assuming the body is the parent container
  //   const deltaX = event.delta.x; // Change in X position of the mouse
  //   const deltaXPercent = (deltaX / totalWidth) * 100; // Change in percentage relative to the parent container

  //   setLeftWidthPercent(prev => {
  //     let newLeftWidthPercent = prev + deltaXPercent;
  //     newLeftWidthPercent = Math.max(MIN_WIDTH, Math.min(newLeftWidthPercent, 100 - MIN_WIDTH_MIDDLE - MIN_WIDTH));
  //     return newLeftWidthPercent;
  //   });
  // }, []);

  return (
    // <DndContext
    //   modifiers={[restrictToHorizontalAxis]}
    //   onDragMove={onDragMove}
    // >
    <ModuleMenuLarge
      left={leftWidthPercent}
      middle={middleWidthPercent}
      // right={rightWidthPercent}
      onResize={handleResizeStart}
    />
    // </DndContext>
  );
};

export default memo(ModuleMenuDraggable);
