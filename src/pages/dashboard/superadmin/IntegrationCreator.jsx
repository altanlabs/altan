import React, { memo, useEffect } from 'react';

import CreatorSection from './creator/CreatorSection.jsx';
import { SAExternalDataProvider } from './external/provider/SAExternalDataProvider.jsx';
import { SAExternalSettingsProvider } from './external/provider/SAExternalSettingsProvider.jsx';
import MultiTabProvider from './providers/MultiTabProvider.jsx';
import { useNavigationPrompt } from './providers/NavigationConfirmProvider.jsx';
import { CompactLayout } from '../../../layouts/dashboard';

const IntegrationCreator = () => {
  const { setIsBlocking } = useNavigationPrompt();

  useEffect(() => {
    setIsBlocking(true);
    return () => setIsBlocking(false);
  }, []);

  return (
    <CompactLayout
      title="Creator · Superadmin · Altan"
      fullWidth
    >
      <SAExternalDataProvider>
        <MultiTabProvider>
          <SAExternalSettingsProvider>
            <CreatorSection />
          </SAExternalSettingsProvider>
        </MultiTabProvider>
      </SAExternalDataProvider>
    </CompactLayout>
  );
};

export default memo(IntegrationCreator);
