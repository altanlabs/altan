import { memo } from 'react';

import PythonEditor from '../../components/flows/modules/PythonEditor';
import { CompactLayout } from '../../layouts/dashboard';

const AdvancedEditorPage = () => {
  return (
    <CompactLayout title="Advanced Editor">
      <PythonEditor />
    </CompactLayout>
  );
};

export default memo(AdvancedEditorPage);
