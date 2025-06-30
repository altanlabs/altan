// TemplateCard.jsx - Main component that routes to specific card types
import PropTypes from 'prop-types';
import React from 'react';

import AgentTemplateCard from './AgentTemplateCard';
import ProjectTemplateCard from './ProjectTemplateCard';
import WorkflowTemplateCard from './WorkflowTemplateCard';

const TemplateCard = ({ template }) => {
  // Determine template type - prioritize template_type over entity_type
  const templateType = template.template_type || template.entity_type;

  switch (templateType) {
    case 'workflow':
      return <WorkflowTemplateCard template={template} />;
    case 'agent':
      return <AgentTemplateCard template={template} />;
    default:
      return <ProjectTemplateCard template={template} />;
  }
};

TemplateCard.propTypes = {
  template: PropTypes.object.isRequired,
};

export default TemplateCard;
