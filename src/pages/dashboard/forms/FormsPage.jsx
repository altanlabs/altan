import React, { memo } from 'react';

import { CompactLayout } from '../../../layouts/dashboard';
import Forms from '../../../sections/@dashboard/forms/Forms';

function FormsPage() {
  return (
    <CompactLayout title="Forms · Altan">
      <Forms />
    </CompactLayout>
  );
}

export default memo(FormsPage);
