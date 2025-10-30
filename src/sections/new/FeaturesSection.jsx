import React from 'react';

import AgentTeamSection from './AgentTeamSection';
import AICloudSection from './AICloudSection';
import FeaturesCTA from './FeaturesCTA';
import ICPSection from './ICPSection';
import SolutionsSection from './SolutionsSection';

const FeaturesSection = () => {
  return (
    <div className="relative w-full">
      <SolutionsSection />
      <AgentTeamSection />
      <AICloudSection />
      <ICPSection />
      <FeaturesCTA />
    </div>
  );
};

export default FeaturesSection;
