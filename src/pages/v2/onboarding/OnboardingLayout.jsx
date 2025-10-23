import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

import V2TopBar from '../components/V2TopBar';
import V2CompactFooter from '../components/V2CompactFooter';

const OnboardingLayout = ({ children, title = 'Altan · Your Agentic Business OS', showFooter = false }) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      {/* Black background */}
      <div className="fixed inset-0 bg-black -z-10" />

      {/* Top Bar - V2TopBar handles its own fixed positioning and z-index */}
      <V2TopBar onSearch={() => {}} />

      {/* Main Content */}
      <div className="w-full h-screen flex flex-col pt-16 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {/* Compact Footer - Only show on welcome scene */}
        {showFooter && <V2CompactFooter />}
      </div>
    </>
  );
};

export default memo(OnboardingLayout);

