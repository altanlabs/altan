import React from 'react';
import { useParams } from 'react-router-dom';

import BaseStorage from '../../databases/base/sections/BaseStorage.jsx';

const CloudStorage = (props) => {
  const { cloudId } = useParams();

  return <BaseStorage baseId={cloudId} {...props} />;
};

export default CloudStorage;
