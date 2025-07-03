import React from 'react';
import { useParams, useHistory } from 'react-router-dom';

import CloneTemplate from '../components/clone/CloneTemplate.jsx';

function CloneTemplatePage() {
  const { templateId } = useParams();
  const history = useHistory();

  const handleClose = () => {
    history.goBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CloneTemplate 
        clonedTemplateId={templateId}
        onClose={handleClose}
      />
    </div>
  );
}

export default CloneTemplatePage; 