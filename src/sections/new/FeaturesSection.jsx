import React from 'react';

import AgentTeamSection from './AgentTeamSection';
import AICloudSection from './AICloudSection';
import CustomAgentsSection from './CustomAgentsSection';
import FeaturesCTA from './FeaturesCTA';
import ICPSection from './ICPSection';
import SoftwareSystemsSection from './SoftwareSystemsSection';

const FeaturesSection = () => {
  return (
    <div className="relative w-full">
      <SoftwareSystemsSection />
      <AgentTeamSection />
      <CustomAgentsSection />
      <AICloudSection />
      <ICPSection />
      <FeaturesCTA />
    </div>
  );
};

export default FeaturesSection;
