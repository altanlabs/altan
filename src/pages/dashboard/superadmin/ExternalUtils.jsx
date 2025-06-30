import React, { memo, useEffect } from 'react';

import { SAExternalDataProvider } from './external/provider/SAExternalDataProvider';
import SAExternalSection from './external/SAExternalSection';
import MultiTabProvider from './providers/MultiTabProvider';
import { useNavigationPrompt } from './providers/NavigationConfirmProvider';
import { CompactLayout } from '../../../layouts/dashboard';

const ExternalUtils = () => {
  const { setIsBlocking } = useNavigationPrompt();

  useEffect(() => {
    setIsBlocking(true);
    return () => setIsBlocking(false);
  }, []);

  return (
    <CompactLayout
      title="External · Superadmin · Altan"
      fullWidth
      overflowHidden
      noPadding
    >
      <SAExternalDataProvider>
        <MultiTabProvider>
          <SAExternalSection />
        </MultiTabProvider>
      </SAExternalDataProvider>
    </CompactLayout>
  );
};

export default memo(ExternalUtils);
