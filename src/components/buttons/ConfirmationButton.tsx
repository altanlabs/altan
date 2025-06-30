import { Popover, Typography, Button } from '@mui/material';
import React, { memo, useCallback, useState } from 'react';

import { HoverBorderGradient } from '../aceternity/buttons/hover-border-gradient';

interface ConfirmationButtonProps {
  containerClassName?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  onClick?: () => void;
  disableAnimation?: boolean;
  children: React.ReactNode;
  confirmationMessage: string;
  isConfirmationEnabled?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  reversed?: boolean;
  danger?: boolean;
}

const ConfirmationButton: React.FC<ConfirmationButtonProps> = ({
  containerClassName,
  className,
  as = 'button',
  onClick,
  disableAnimation,
  children,
  confirmationMessage,
  isConfirmationEnabled = true,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  reversed = false,
  danger = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (isConfirmationEnabled) {
      setAnchorEl(event.currentTarget);
    } else if (onClick) {
      onClick();
    }
  }, [isConfirmationEnabled, onClick]);

  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleConfirm = useCallback(() => {
    if (onClick) {
      onClick();
    }
    handleClose();
  }, [handleClose, onClick]);

  const confirmButtonClass = danger
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-blue-500 hover:bg-blue-600 text-white';

  const cancelButtonClass = reversed
    ? 'bg-blue-500 hover:bg-blue-600 text-white border-transparent'
    : 'border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-500';

  const confirmText = reversed ? cancelButtonText : confirmButtonText;
  const cancelText = reversed ? confirmButtonText : cancelButtonText;

  return (
    <>
      <HoverBorderGradient
        containerClassName={containerClassName}
        as={as}
        className={className}
        onClick={handleOpen}
        disableAnimation={disableAnimation}
      >
        {children}
      </HoverBorderGradient>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'transparent'
            },
            className: 'backdrop-blur-lg'
          }
        }}
      >
        <div className="p-4 flex flex-col items-end space-y-2">
          <Typography variant="body1" className="text-black dark:text-white">
            {confirmationMessage}
          </Typography>
          <div className="flex space-x-2">
            <Button
              variant="contained"
              color={reversed ? 'inherit' : danger ? 'error' : 'primary'}
              onClick={handleConfirm}
              className={confirmButtonClass}
            >
              {confirmText}
            </Button>
            <Button
              variant={reversed ? 'contained' : 'outlined'}
              onClick={handleClose}
              className={cancelButtonClass}
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </Popover>
    </>
  );
};

export default memo(ConfirmationButton);
