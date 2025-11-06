import React from 'react';
import { useParams } from 'react-router-dom';

import BaseLogs from '../../databases/base/sections/BaseLogs.jsx';

const CloudLogs = (props) => {
  const { cloudId } = useParams();

  return <BaseLogs baseId={cloudId} {...props} />;
};

export default CloudLogs;
