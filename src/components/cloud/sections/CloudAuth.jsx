import React from 'react';
import { useParams } from 'react-router-dom';

import BaseAuth from '../../databases/base/sections/BaseAuth.jsx';

const CloudAuth = (props) => {
  const { cloudId } = useParams();

  return <BaseAuth baseId={cloudId} {...props} />;
};

export default CloudAuth;
