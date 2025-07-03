import React from 'react';
import { useParams } from 'react-router-dom';

import CloneTemplate from '../components/clone/CloneTemplate.jsx';
import { CompactLayout } from '../layouts/dashboard';

function CloneTemplatePage() {
  const { templateId } = useParams();

  return (
    <CompactLayout>
      <CloneTemplate clonedTemplateId={templateId} />
    </CompactLayout>
  );
}

export default CloneTemplatePage;
