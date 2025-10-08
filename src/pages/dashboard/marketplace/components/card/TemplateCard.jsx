// TemplateCard.jsx - Main component that routes to specific card types
import PropTypes from 'prop-types';
import React from 'react';

import AgentTemplateCard from './AgentTemplateCard';
import ProjectTemplateCard from './ProjectTemplateCard';
import WorkflowTemplateCard from './WorkflowTemplateCard';

const TemplateCard = ({ template, onClick }) => {
  // Determine template type - prioritize template_type over entity_type
  const templateType = template.template_type || template.entity_type;

  switch (templateType) {
    case 'workflow':
      return <WorkflowTemplateCard template={template} onClick={onClick} />;
    case 'agent':
      return <AgentTemplateCard template={template} onClick={onClick} />;
    default:
      return <ProjectTemplateCard template={template} onClick={onClick} />;
  }
};

TemplateCard.propTypes = {
  template: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

export default TemplateCard;
