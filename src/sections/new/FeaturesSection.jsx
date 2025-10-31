import React from 'react';

import AgentTeamSection from './AgentTeamSection';
import AICloudSection from './AICloudSection';
import FeaturesCTA from './FeaturesCTA';
import ICPSection from './ICPSection';

const FeaturesSection = () => {
  return (
    <div className="relative w-full">
      <AgentTeamSection />
      <AICloudSection />
      <ICPSection />
      <FeaturesCTA />
    </div>
  );
};

export default FeaturesSection;
