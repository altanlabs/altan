import React from 'react';
import { useParams } from 'react-router-dom';

import BaseFunctions from '../../databases/base/sections/BaseFunctions.jsx';

const CloudFunctions = (props) => {
  const { cloudId } = useParams();

  return <BaseFunctions baseId={cloudId} {...props} />;
};

export default CloudFunctions;
