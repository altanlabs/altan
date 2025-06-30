// FloatingChatWindow.jsx
import React, { memo, useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';

import { cn } from '@lib/utils';

import Iconify from '../iconify';

const FloatingWindow = ({
  onClose,
  name,
  offsetX = 0,
  offsetY = 0,
  additionalClasses,
  onExternalOpen,
  baseWidth = 400,
  baseHeight = 700,
  enableExpand = false,
  enableMinimize = false,
  usePortal = false,
  defaultPosition,

  // NEW: Optional anchorEl
  anchorEl = null,
  children,
}) => {
  // ----------------------------------------------------------------
  // 1. State for minimized / maximized
  // ----------------------------------------------------------------
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPositionReady, setIsPositionReady] = useState(!anchorEl);

  // ----------------------------------------------------------------
  // 2. Initial dimension logic
  // ----------------------------------------------------------------
  const defaultHeight = Math.min(window.innerHeight - 250, baseHeight);

  // ----------------------------------------------------------------
  // 3. Position & size states
  // ----------------------------------------------------------------
  const [position, setPosition] = useState(() => {
    if (defaultPosition === 'bottomRight') {
      return {
        x: window.innerWidth - baseWidth - offsetX - 20,
        y: window.innerHeight - defaultHeight - offsetY,
      };
    }
    return {
      x: window.innerWidth - baseWidth - offsetX - 50,
      y: window.innerHeight - defaultHeight - 200,
    };
  });
  const [size, setSize] = useState({
    width: Math.min(baseWidth, window.innerWidth - 20),
    height: defaultHeight,
  });

  // ----------------------------------------------------------------
  // 4. Refs to remember size & position for toggling maximize
  // ----------------------------------------------------------------
  const prevSizeRef = useRef(size);
  const prevPositionRef = useRef(position);

  // ----------------------------------------------------------------
  // 5. Callbacks
  // ----------------------------------------------------------------
  const expandWindow = useCallback(() => setIsMinimized(false), []);
  const toggleExpand = useCallback(() => setIsMaximized((prev) => !prev), []);
  const minimizeWindow = useCallback(() => setIsMinimized(true), []);

  const onResizeStop = useCallback((e, direction, ref, delta, newPosition) => {
    setSize({
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
    });
    setPosition(newPosition);
  }, []);

  const onDragStop = useCallback((e, d) => {
    setPosition({ x: d.x, y: d.y });
  }, []);

  // ----------------------------------------------------------------
  // 6. If maximized, stretch to fill screen
  // ----------------------------------------------------------------
  useEffect(() => {
    if (isMaximized) {
      prevSizeRef.current = size;
      prevPositionRef.current = position;
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setPosition(prevPositionRef.current);
      setSize(prevSizeRef.current);
    }
  }, [isMaximized]);

  // ----------------------------------------------------------------
  // 7. Handle window resizing while in maximized mode
  // ----------------------------------------------------------------
  useLayoutEffect(() => {
    const handleResize = () => {
      if (isMaximized) {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized]);

  // ----------------------------------------------------------------
  // 8. NEW: Position logic if anchorEl is provided
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!anchorEl || isMinimized) return;

    const rect = anchorEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // We'll store potential X and Y
    let x = 0;
    let y = 0;

    // Simple approach: first try to place it on the right if there's room
    if (rect.right + baseWidth < viewportWidth) {
      x = rect.right + 10;
      y = rect.top;
    }
    // If that fails, try placing to the left
    else if (rect.left - baseWidth > 0) {
      x = rect.left - baseWidth - 10;
      y = rect.top;
    }
    // Otherwise, try placing below
    else if (rect.bottom + baseHeight < viewportHeight) {
      x = rect.left;
      y = rect.bottom + 10;
    }
    // Lastly, place above
    else {
      x = rect.left;
      y = rect.top - baseHeight - 10;
    }

    // Make sure we keep the window in the viewport if possible
    // (You could clamp or do other logic as needed)
    x = Math.max(0, Math.min(x, viewportWidth - baseWidth));
    y = Math.max(0, Math.min(y, viewportHeight - baseHeight));

    // Update state with these anchor-based coords
    setPosition({ x, y });
    setIsPositionReady(true); // Mark position as ready after first calculation
  }, [anchorEl, baseWidth, baseHeight]);

  // ----------------------------------------------------------------
  // 9. Render
  // ----------------------------------------------------------------

  // If minimized, we just show a small bar to re-expand
  const minimizedContent = (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2
                 flex flex-row gap-2 items-center p-2 rounded-lg shadow-lg
                 border border-sky-500 cursor-pointer bg-gray-100 text-black
                 dark:bg-gray-800 dark:text-white z-[10000]"
      onClick={expandWindow}
    >
      <Iconify icon="tabler:chevron-up" />
      <div className="text-sm font-medium">{name}</div>
      <button
        className="p-1 rounded-full hover:bg-gray-200 text-black
                   dark:hover:bg-gray-700 dark:text-white"
        onClick={onClose}
      >
        <Iconify icon="line-md:close" />
      </button>
    </div>
  );

  // Main window content (resizable + draggable)
  const contentNode = (
    <Rnd
      size={size}
      position={position}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      minWidth={250}
      minHeight={300}
      maxWidth={isMaximized ? window.innerWidth : 600}
      maxHeight={isMaximized ? window.innerHeight : 1000}
      bounds="window"
      className={cn(
        'overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700 z-[10000]',
        additionalClasses,
      )}
      dragHandleClassName="handle"
      // If you really want to ensure we never forcibly focus inside,
      // you could do:
      // tabIndex={-1}
    >
      <div className="relative h-full w-full ">
        <div
          className="relative flex cursor-move justify-between items-center
                     bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm
                     text-black dark:text-white h-10"
        >
          <div className="select-none handle py-2 px-3 text-lg font-medium flex-no-wrap truncate flex items-center">
            <Iconify
              icon="mdi:drag"
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              width={20}
              height={20}
            />
          </div>
          <div className="flex items-center space-x-1">
            {onExternalOpen && (
              <button
                className="p-1 rounded-full hover:bg-gray-200 text-black
                           dark:hover:bg-gray-700 dark:text-white"
                onClick={onExternalOpen}
              >
                <Iconify icon="ion:open-outline" />
              </button>
            )}
            {enableMinimize && (
              <button
                className="p-1 rounded-full hover:bg-gray-200 text-black
                           dark:hover:bg-gray-700 dark:text-white"
                onClick={minimizeWindow}
              >
                <Iconify icon="tabler:chevron-down" />
              </button>
            )}
            {enableExpand && (
              <button
                className="p-1 rounded-full hover:bg-gray-200 text-black
                           dark:hover:bg-gray-700 dark:text-white"
                onClick={toggleExpand}
              >
                <Iconify icon={isMaximized ? 'tabler:minimize' : 'tabler:maximize'} />
              </button>
            )}
            <button
              className="p-1 rounded-full hover:bg-gray-200 text-black
                         dark:hover:bg-gray-700 dark:text-white"
              onClick={onClose}
            >
              <Iconify icon="line-md:close" />
            </button>
          </div>
        </div>
        <div className="absolute inset-0 top-10">{children}</div>
      </div>
    </Rnd>
  );

  if (!isPositionReady) {
    return null; // Don't render until position is calculated
  }

  // For focus: By default, Rnd won't auto-focus on mount. If you have
  // an input with autoFocus inside `content`, that could steal focus.
  // Remove or adjust that if you don't want it to happen.

  // Decide whether to portal or not, as you do now
  return usePortal || isMinimized
    ? createPortal(isMinimized ? minimizedContent : contentNode, document.body)
    : contentNode;
};

export default memo(FloatingWindow);

// // FloatingChatWindow.jsx
// import React, { memo, useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
// import { Rnd } from 'react-rnd';
// import Iconify from '../iconify';
// import { createPortal } from 'react-dom';
// import { cn } from "@lib/utils";

// const FloatingWindow = ({
//   onClose,
//   name,
//   offsetX = 0,
//   additionalClasses,
//   content,
//   onExternalOpen,
//   baseWidth = 400,
//   baseHeight = 700,
//   enableExpand = false,
//   enableMinimize = false,
//   usePortal = false
// }) => {
//   const [isMinimized, setIsMinimized] = useState(false);
//   const defaultHeight = Math.min(window.innerHeight - 250, baseHeight);

//   const [isMaximized, setIsMaximized] = useState(false);
//   const [position, setPosition] = useState({
//     x: window.innerWidth - baseWidth - offsetX - 50,
//     y: window.innerHeight - defaultHeight - 200,
//   });
//   const [size, setSize] = useState({
//     width: Math.min(baseWidth, window.innerWidth - 20),
//     height: defaultHeight,
//   });

//   const prevSizeRef = useRef(size);
//   const prevPositionRef = useRef(position);

//   const expandWindow = useCallback(() => setIsMinimized(false), []);
//   const toggleExpand = useCallback(() => setIsMaximized(prev => !prev), []);
//   const minimizeWindow = useCallback(() => setIsMinimized(true), []);

//   const onResizeStop = useCallback((e, direction, ref, delta, position) => {
//     setSize({
//       width: parseInt(ref.style.width, 10),
//       height: parseInt(ref.style.height, 10),
//     });
//     setPosition(position);
//   }, []);

//   const onDragStop = useCallback((e, d) => {
//     setPosition({ x: d.x, y: d.y });
//   }, []);

//   useEffect(() => {
//     if (isMaximized) {
//       prevSizeRef.current = size;
//       prevPositionRef.current = position;
//       setPosition({ x: 0, y: 0 });
//       setSize({ width: window.innerWidth, height: window.innerHeight });
//     } else {
//       setPosition(prevPositionRef.current);
//       setSize(prevSizeRef.current);
//     }
//   }, [isMaximized]);

//   useLayoutEffect(() => {
//     const handleResize = () => {
//       if (isMaximized) {
//         setSize({ width: window.innerWidth - 300, height: window.innerHeight });
//       }
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [isMaximized]);

//   const minimizedContent = (
//     <div
//       className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] flex flex-row gap-2 items-center p-2 rounded-lg shadow-lg border border-sky-500 cursor-pointer bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
//       onClick={expandWindow}
//     >
//       <Iconify icon="tabler:chevron-up" />
//       <div className="text-sm font-medium">{name}</div>
//       <button
//         className="p-1 rounded-full hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white"
//         onClick={onClose}
//       >
//         <Iconify icon="line-md:close" />
//       </button>
//     </div>
//   );

//   const contentNode = (
//     <Rnd
//       size={size}
//       position={position}
//       onDragStop={onDragStop}
//       onResizeStop={onResizeStop}
//       minWidth={250}
//       minHeight={300}
//       maxWidth={isMaximized ? window.innerWidth : 600}
//       maxHeight={isMaximized ? window.innerHeight : 1000}
//       bounds="window"
//       className={cn("overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700", additionalClasses)}
//       dragHandleClassName="handle"
//     >
//       {/* <div className="flex flex-col h-full rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800"> */}
//       <div className="relative h-full w-full shadow-lg backdrop-blur-xl">
//         <div className="relative flex handle cursor-move justify-between items-center bg-gray-100 text-black dark:bg-gray-900 dark:text-white">
//           <div className="select-none py-2 px-3 text-lg font-medium flex-no-wrap truncate">
//             {name}
//           </div>
//           <div className="flex items-center space-x-1">
//             {onExternalOpen && (
//               <button
//                 className="p-1 rounded-full hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white"
//                 onClick={onExternalOpen}
//               >
//                 <Iconify icon="ion:open-outline" />
//               </button>
//             )}
//             {enableMinimize && (
//               <button
//                 className="p-1 rounded-full hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white"
//                 onClick={minimizeWindow}
//               >
//                 <Iconify icon="tabler:chevron-down" />
//               </button>
//             )}
//             {enableExpand && (
//               <button
//                 className="p-1 rounded-full hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white"
//                 onClick={toggleExpand}
//               >
//                 <Iconify
//                   icon={isMaximized ? 'tabler:minimize' : 'tabler:maximize'}
//                 />
//               </button>
//             )}
//             <button
//               className="p-1 rounded-full hover:bg-gray-200 text-black dark:hover:bg-gray-700 dark:text-white"
//               onClick={onClose}
//             >
//               <Iconify icon="line-md:close" />
//             </button>
//           </div>
//         </div>
//         <div className='absolute inset-0 top-11'>
//           {content}
//         </div>
//       </div>
//     </Rnd>
//   );

//   return (usePortal || isMinimized) ? createPortal(isMinimized ? minimizedContent : contentNode, document.body) : contentNode;
// };

// export default memo(FloatingWindow);
