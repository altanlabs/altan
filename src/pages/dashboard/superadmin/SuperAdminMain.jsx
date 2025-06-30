import { memo } from 'react';

// @mui
import { CompactLayout } from '../../../layouts/dashboard';

const SuperAdminMain = () => {
  return (
    <CompactLayout
      title="Superadmin · Altan"
      fullWidth
      noPadding
    >
      <iframe
        src="https://lookerstudio.google.com/embed/reporting/5e920d4b-bf93-490d-811f-80e4aafd7295/page/mhPyD"
        frameBorder="0"
        style={{
          border: 0,
          width: '100%',
          height: '100%',
        }}
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </CompactLayout>
  );
};

export default memo(SuperAdminMain);
