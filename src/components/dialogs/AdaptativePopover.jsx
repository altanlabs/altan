import { Popover } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState, memo } from 'react';

const AdaptivePopover = ({
  isOpen,
  anchorEl,
  onClose,
  children,
  defaultSize = { width: 300, height: 400 },
  fallbackPosition = { vertical: 'bottom', horizontal: 'center' },
  popoverProps = {},
}) => {
  const [popoverPosition, setPopoverPosition] = useState(fallbackPosition);

  useEffect(() => {
    if (!anchorEl) {
      // If there's no anchor, revert to the fallback or do nothing
      setPopoverPosition(fallbackPosition);
      return;
    }

    const rect = anchorEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let vertical = 'bottom';
    let horizontal = 'center';

    // Attempt to position right
    if (rect.right + defaultSize.width < viewportWidth) {
      horizontal = 'right';
      vertical = 'center';
    }
    // Attempt to position left
    else if (rect.left - defaultSize.width > 0) {
      horizontal = 'left';
      vertical = 'center';
    }
    // Attempt to position bottom
    else if (rect.bottom + defaultSize.height < viewportHeight) {
      vertical = 'bottom';
      horizontal = 'center';
    }
    // Attempt to position top
    else if (rect.top - defaultSize.height > 0) {
      vertical = 'top';
      horizontal = 'center';
    }

    setPopoverPosition({ vertical, horizontal });
  }, [anchorEl, defaultSize, fallbackPosition]);

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={onClose}
      // Our computed anchor origin
      anchorOrigin={{
        vertical: popoverPosition.vertical,
        horizontal: popoverPosition.horizontal,
      }}
      // Our computed transform origin
      transformOrigin={{
        vertical: popoverPosition.vertical === 'top' ? 'bottom' : 'top',
        horizontal: popoverPosition.horizontal === 'left' ? 'right' : 'left',
      }}
      // To preserve focus on outside inputs/components
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      hideBackdrop
      {...popoverProps}
    >
      {children}
    </Popover>
  );
};

AdaptivePopover.propTypes = {
  /**
   * Whether the popover is open.
   */
  isOpen: PropTypes.bool.isRequired,

  /**
   * Optional anchor element to position against.
   */
  anchorEl: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),

  /**
   * Callback fired when the component requests to be closed.
   */
  onClose: PropTypes.func.isRequired,

  /**
   * The contents of the popover.
   */
  children: PropTypes.node,

  /**
   * Size used to help figure out the best positioning (width/height).
   */
  defaultSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),

  /**
   * Fallback position if no anchorEl is provided or if no side fits well.
   */
  fallbackPosition: PropTypes.shape({
    vertical: PropTypes.oneOf(['top', 'center', 'bottom']),
    horizontal: PropTypes.oneOf(['left', 'center', 'right']),
  }),

  /**
   * Additional props to pass to the MUI Popover.
   */
  popoverProps: PropTypes.object,
};

export default memo(AdaptivePopover);
