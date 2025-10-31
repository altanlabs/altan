import React, { memo } from 'react';

import AltanerTemplateMarketplace from '../../../components/templates/AltanerTemplateMarketplace';

const MarketplacePage = () => {
  return (
    <div className="p-4 pt-12">
      <AltanerTemplateMarketplace />
    </div>
  );
};

export default memo(MarketplacePage);
