import { Tooltip } from '@mui/material';
import React, { memo } from 'react';

import RoomDetailsCard from './RoomDetailsCard.jsx';
import useResponsive from '../../../../hooks/useResponsive';
// import { bgBlur } from '../../../styled';

const RoomRowTooltip = ({ roomId, onClick, children, ...other }) => {
  const isSmallScreen = useResponsive('down', 'sm');

  return (
    <Tooltip
      title={(
        <RoomDetailsCard
          // account={account}
          roomId={roomId}
          onClick={onClick}
          maxMembersEnabled={true}
        />
      )}
      enterDelay={isSmallScreen ? 1000 : 500}
      enterNextDelay={isSmallScreen ? 1000 : 500}
      enterTouchDelay={isSmallScreen ? 1000 : 500}
      arrow
      {...!isSmallScreen ? { placement: 'right' } : {}}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: 'transparent',
          },
        },
      }}
      classes={{ tooltip: 'relative rounded-xl w-fit sm:min-w-[40vw] max-w-[600px] p-0 border border-gray-400 border-opacity-40 backdrop-blur-lg h-full' }}
      {...other}
    >
      <span>
        {children}
      </span>
    </Tooltip>
  );
};

export default memo(RoomRowTooltip);
