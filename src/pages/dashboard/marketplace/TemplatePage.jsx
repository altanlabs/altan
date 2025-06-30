import React from 'react';
import { useParams } from 'react-router-dom';

import TemplateDetails from './components/template/TemplateDetails';
import { CompactLayout } from '../../../layouts/dashboard';

// Main TemplatePage Component
const TemplatePage = () => {
  const { templateId } = useParams();

  return (
    <CompactLayout title="Template" description="Template" noPadding>
      <TemplateDetails templateId={templateId} />
    </CompactLayout>
  );
};

export default TemplatePage;
