import React from 'react';

import AgentTeamSection from './AgentTeamSection';
import AICloudSection from './AICloudSection';
import CustomAgentsSection from './CustomAgentsSection';
import FeaturesCTA from './FeaturesCTA';
import ICPSection from './ICPSection';
import SoftwareSystemsSection from './SoftwareSystemsSection';
import NewPricing from '../pricing/NewPricing';

const FeaturesSection = () => {
  return (
    <div className="relative w-full">
      <SoftwareSystemsSection />
      <AgentTeamSection />
      <CustomAgentsSection />
      <AICloudSection />
      <ICPSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-8 text-center">
          Pricing
        </h2>
        <NewPricing />
      </div>
      <FeaturesCTA />
    </div>
  );
};

export default FeaturesSection;
