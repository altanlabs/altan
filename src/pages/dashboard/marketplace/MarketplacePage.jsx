import React, { memo } from 'react';

import TemplateMarketplace from './templates/TemplateMarketplace';
import { CompactLayout } from '../../../layouts/dashboard';

const MarketplacePage = () => {
  return (
    <CompactLayout
      fullWidth
      title="Marketplace"
    >
      <TemplateMarketplace />
    </CompactLayout>
  );
};

export default memo(MarketplacePage);
