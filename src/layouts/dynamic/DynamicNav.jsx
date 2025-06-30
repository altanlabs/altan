import { useTheme, useMediaQuery } from '@mui/material';
import React, { memo } from 'react';

import StaticDrawerNavDesktop from './DynamicNavDesktop';
import StaticDrawerNavMobile from './DynamicNavMobile';

const DynamicNav = ({
  id = null,
  onClickCreateComponent = null,
  onDeleteComponent = null,
  ...navProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {isMobile ? (
        <StaticDrawerNavMobile
          id={id}
          onClickCreateComponent={onClickCreateComponent}
          onDeleteComponent={onDeleteComponent}
          {...navProps}
        />
      ) : (
        <StaticDrawerNavDesktop
          id={id}
          onClickCreateComponent={onClickCreateComponent}
          onDeleteComponent={onDeleteComponent}
          {...navProps}
        />
      )}
    </>
  );
};

export default memo(DynamicNav);
