import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * A custom hook to calculate the best position for the popover.
 * You can tweak the logic to suit your placement preferences.
 */
function usePopoverPosition({ anchorEl, isOpen, defaultSize }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!anchorEl || !isOpen) return;

    const rect = anchorEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Some default logic for placement:
    // Try to place to the right if there's space,
    // otherwise to the left, otherwise below, otherwise above.
    // You can easily extend or refine this.
    let top = rect.bottom;
    let left = rect.left;

    // Right placement if enough space
    if (rect.right + defaultSize.width < viewportWidth) {
      top = rect.top;
      left = rect.right;
    }
    // Left placement if enough space
    else if (rect.left - defaultSize.width > 0) {
      top = rect.top;
      left = rect.left - defaultSize.width;
    }
    // Bottom placement if there's space
    else if (rect.bottom + defaultSize.height < viewportHeight) {
      top = rect.bottom;
      left = rect.left;
    }
    // Otherwise top
    else if (rect.top - defaultSize.height > 0) {
      top = rect.top - defaultSize.height;
      left = rect.left;
    }

    setPosition({ top, left });
  }, [anchorEl, defaultSize, isOpen]);

  useEffect(() => {
    updatePosition();
    // Listen to scroll/resize events in case you want dynamic repositioning
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition, true);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition, true);
    };
  }, [updatePosition]);

  return position;
}

const ResizablePopover = ({
  isOpen,
  anchorEl,
  onClose,
  children,
  defaultSize = { width: 300, height: 400 },
  minSize = { width: 200, height: 200 },
  maxSize = { width: 600, height: 800 },
  className = '',
  popoverClassName = '',
  resizableProps = {},
  onResizeStart,
  onResizeStop,
}) => {
  const popoverRef = useRef(null);
  // Calculate position for the popover container
  const { top, left } = usePopoverPosition({
    anchorEl,
    isOpen,
    defaultSize,
  });

  // If it's not open, don't render anything
  if (!isOpen) return null;

  // The popover container element
  const popoverContent = (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: top,
        left: left,
        // You may tweak or define your own styling here
        zIndex: 9999,
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        border: '1px solid #ccc',
      }}
      className={popoverClassName}
    >
      {/* Header with Close Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f0f0f0',
          borderBottom: '1px solid #ccc',
          padding: '0.5rem',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>Popover Title</div>
        <button onClick={onClose}>Close</button>
      </div>

      <Resizable
        defaultSize={defaultSize}
        minWidth={minSize.width}
        minHeight={minSize.height}
        maxWidth={maxSize.width}
        maxHeight={maxSize.height}
        onResizeStart={onResizeStart}
        onResizeStop={onResizeStop}
        className={`border ${className}`}
        {...resizableProps}
      >
        {children}
      </Resizable>
    </div>
  );

  // We render via a portal so that the popover is positioned
  // at the body level. This prevents parent overflow issues,
  // and ensures it floats above other elements.
  // You can remove createPortal if you prefer inline rendering.
  return createPortal(popoverContent, document.body);
};

ResizablePopover.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  anchorEl: PropTypes.instanceOf(Element),
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  defaultSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  minSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  maxSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  className: PropTypes.string,
  popoverClassName: PropTypes.string,
  resizableProps: PropTypes.object,
  onResizeStart: PropTypes.func,
  onResizeStop: PropTypes.func,
};

export default memo(ResizablePopover);

// import { memo, useEffect, useState } from "react";
// import PropTypes from "prop-types";
// import { Popover } from "@mui/material";
// import { Resizable } from "re-resizable";

// const ResizablePopover = ({
//   isOpen,
//   anchorEl,
//   onClose,
//   children,
//   defaultSize = { width: 300, height: 400 },
//   minSize = { width: 200, height: 200 },
//   maxSize = { width: 600, height: 800 },
//   className = "",
//   popoverClassName = "",
//   resizableProps = {},
//   popoverProps = {},
//   onResizeStart,
//   onResizeStop,
// }) => {
//   const [popoverPosition, setPopoverPosition] = useState({
//     vertical: "bottom",
//     horizontal: "center",
//   });

//   useEffect(() => {
//     if (!anchorEl) return;

//     const rect = anchorEl.getBoundingClientRect();
//     const viewportWidth = window.innerWidth;
//     const viewportHeight = window.innerHeight;

//     let vertical = "bottom";
//     let horizontal = "center";

//     // Determine the best position for the Popover
//     if (rect.right + defaultSize.width < viewportWidth) {
//       horizontal = "right";
//       vertical = "center";
//     } else if (rect.left - defaultSize.width > 0) {
//       horizontal = "left";
//       vertical = "center";
//     } else if (rect.bottom + defaultSize.height < viewportHeight) {
//       vertical = "bottom";
//       horizontal = "center";
//     } else if (rect.top - defaultSize.height > 0) {
//       vertical = "top";
//       horizontal = "center";
//     }

//     setPopoverPosition({ vertical, horizontal });
//   }, [anchorEl, defaultSize]);

//   return (
//     <Popover
//       open={isOpen}
//       anchorEl={anchorEl}
//       onClose={onClose}
//       anchorOrigin={{
//         vertical: popoverPosition.vertical,
//         horizontal: popoverPosition.horizontal,
//       }}
//       transformOrigin={{
//         vertical: popoverPosition.vertical === "top" ? "bottom" : "top",
//         horizontal: popoverPosition.horizontal === "left" ? "right" : "left",
//       }}
//       className={popoverClassName}
//       hideBackdrop
//       {...popoverProps} // Spread additional Popover props
//     >
//       <Resizable
//         defaultSize={defaultSize}
//         minWidth={minSize.width}
//         minHeight={minSize.height}
//         maxWidth={maxSize.width}
//         maxHeight={maxSize.height}
//         onResizeStart={onResizeStart}
//         onResizeStop={onResizeStop}
//         className={`border ${className}`}
//         {...resizableProps} // Spread additional Resizable props
//       >
//         {children}
//       </Resizable>
//     </Popover>
//   );
// };

// // PropTypes for type safety and documentation
// ResizablePopover.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   anchorEl: PropTypes.object,
//   onClose: PropTypes.func.isRequired,
//   children: PropTypes.node,
//   defaultSize: PropTypes.shape({
//     width: PropTypes.number,
//     height: PropTypes.number,
//   }),
//   minSize: PropTypes.shape({
//     width: PropTypes.number,
//     height: PropTypes.number,
//   }),
//   maxSize: PropTypes.shape({
//     width: PropTypes.number,
//     height: PropTypes.number,
//   }),
//   className: PropTypes.string,
//   popoverClassName: PropTypes.string,
//   resizableProps: PropTypes.object,
//   popoverProps: PropTypes.object,
//   onResizeStart: PropTypes.func,
//   onResizeStop: PropTypes.func,
// };

// export default memo(ResizablePopover);
