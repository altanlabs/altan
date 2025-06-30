import { useTheme, useMediaQuery } from '@mui/material';
import React, { useState, memo, useEffect, useCallback } from 'react';

import StaticDrawerNavDesktop from './StaticDrawerNavDesktop';
import StaticDrawerNavMobile from './StaticDrawerNavMobile';
import AltanerComponentDialog from '../components/AltanerComponentDialog';

const StaticDrawerNav = ({ altanerId = null, ...navProps }) => {
  const [createComponent, setIsCreateComponent] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const onClickCreateComponent = useCallback(() => setIsCreateComponent(true), []);
  const onCloseCreateComponent = useCallback(() => setIsCreateComponent(false), []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (altanerId) {
          setIsCreateComponent(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [altanerId]);

  return (
    <>
      {isMobile ? (
        <StaticDrawerNavMobile
          onClickCreateComponent={onClickCreateComponent}
          altanerId={altanerId}
          {...navProps}
        />
      ) : (
        <StaticDrawerNavDesktop
          onClickCreateComponent={onClickCreateComponent}
          altanerId={altanerId}
          {...navProps}
        />
      )}
      <AltanerComponentDialog
        altanerId={altanerId}
        open={createComponent}
        onClose={onCloseCreateComponent}
      />
    </>
  );
};

export default memo(StaticDrawerNav);
