import React from 'react';
import { useParams } from 'react-router-dom';

import BaseUsers from '../../databases/base/sections/BaseUsers.jsx';

const CloudUsers = (props) => {
  const { cloudId } = useParams();

  return <BaseUsers baseId={cloudId} {...props} />;
};

export default CloudUsers;
