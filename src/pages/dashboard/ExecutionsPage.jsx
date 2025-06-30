import ExecutionsWidget from './components/ExecutionsWidget';
import { CompactLayout } from '../../layouts/dashboard';

export default function ExecutionsPage() {
  return (
    <CompactLayout
      noPadding
      title="Task Usage · Altan"
    >
      <ExecutionsWidget />
    </CompactLayout>
  );
}
