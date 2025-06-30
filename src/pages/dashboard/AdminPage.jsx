// import { useState, useEffect } from 'react';
import { memo } from 'react';

import { CompactLayout } from '../../layouts/dashboard';
import MultiTabProvider from './superadmin/providers/MultiTabProvider';
import InternalTable from '../dashboard/superadmin/internal/InternalTable';
// ----------------------------------------------------------------------

const AdminPage = () => {
  return (
    <CompactLayout title={'Admin · Altan'}>
      <MultiTabProvider>
        <InternalTable isSuperAdmin={false} />
      </MultiTabProvider>
    </CompactLayout>
  );
};

export default memo(AdminPage);
