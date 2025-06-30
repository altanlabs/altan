import { useParams } from 'react-router';

import { CompactLayout } from '../../../layouts/dashboard';

// ----------------------------------------------------------------------

export default function ViewPage() {
  const { tableId, viewId } = useParams();
  console.log('view', viewId);
  return <CompactLayout title={'View · Altan'}></CompactLayout>;
}
