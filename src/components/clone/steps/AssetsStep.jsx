import React, { memo } from 'react';

import AssetsCard from '../assets/AssetsCard';

function AssetsStep({ assets }) {
  return <AssetsCard assets={assets} />;
}

export default memo(AssetsStep);
