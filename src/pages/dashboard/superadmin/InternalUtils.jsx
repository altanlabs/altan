import React, { memo, useEffect } from 'react';

import InternalTable from './internal/InternalTable.jsx';
import MultiTabProvider from './providers/MultiTabProvider.jsx';
import { useNavigationPrompt } from './providers/NavigationConfirmProvider.jsx';
import { CompactLayout } from '../../../layouts/dashboard';

const InternalUtils = () => {
  const { setIsBlocking } = useNavigationPrompt();

  useEffect(() => {
    setIsBlocking(true);
    return () => setIsBlocking(false);
  }, []);

  return (
    <CompactLayout
      title="Internal · Superadmin · Altan"
      fullWidth
      noPadding
    >
      <MultiTabProvider>
        <InternalTable />
      </MultiTabProvider>
    </CompactLayout>
  );
};

export default memo(InternalUtils);
