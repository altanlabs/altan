import React from 'react';
import { useParams } from 'react-router-dom';

import Cloud from '../../components/cloud/Cloud.jsx';

function CloudPage() {
  const { cloudId } = useParams();

  return <Cloud cloudId={cloudId} />;
}

export default CloudPage;

