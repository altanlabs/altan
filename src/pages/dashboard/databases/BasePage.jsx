import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';

import Base from '../../../components/databases/base/Base';
import { CompactLayout } from '../../../layouts/dashboard';
import { selectBaseById } from '../../../redux/slices/bases';

export default function BasePage() {
  const { baseId } = useParams();
  const [searchParams] = useSearchParams();
  const hideHeader = searchParams.get('hideHeader') === 'true';
  const base = useSelector((state) => selectBaseById(state, baseId));

  return (
    <CompactLayout
      title={base ? `${base?.name} · Altan` : 'Base · Altan'}
      noPadding
      hideHeader={hideHeader}
    >
      <Base hideChat={true} />
    </CompactLayout>
  );
}
