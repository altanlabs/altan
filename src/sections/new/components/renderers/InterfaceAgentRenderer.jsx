import { m } from 'framer-motion';
import { Loader2, Rocket } from 'lucide-react';
import React, { useState } from 'react';

import { GlassButton } from '../../../../components/ui/glass-button';

const InterfaceAgentRenderer = ({ description }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);

  const handlePublish = () => {
    setIsDeploying(true);
    
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
      
      // Open the deployed site
      setTimeout(() => {
        window.open('https://a29dad-new-app.altanlabs.com/', '_blank');
      }, 500);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsDeployed(false);
      }, 3000);
    }, 2500);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      {/* Left side - Description */}
      <m.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6 flex flex-col justify-center h-full"
      >
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#f9cf39] to-[#fb190b] bg-clip-text text-transparent">
            Building Your Interface
          </h3>
        </m.div>

        <m.p
          className="text-lg text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {description}
        </m.p>

        <m.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Component library configured</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Responsive design implemented</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Modern UI patterns applied</span>
          </div>
        </m.div>
      </m.div>

      {/* Right side - UI Preview */}
      <m.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        {/* UI Preview with Overlay Button */}
        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            {/* UI Screenshot - Full Space */}
            <img
              src="https://api.altan.ai/platform/media/544e8ee2-19fc-4f29-aab9-f4d6952dbaf6"
              alt="Interface Preview"
              className="w-full h-auto"
            />
            
            {/* Publish Button Overlay - Top Right */}
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute top-4 right-4"
            >
              <GlassButton
                onClick={handlePublish}
                disabled={isDeploying || isDeployed}
                size="sm"
                className="disabled:opacity-70 disabled:cursor-not-allowed"
                contentClassName="flex items-center gap-2 text-white"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : isDeployed ? (
                  <>
                    <Rocket className="w-4 h-4" />
                    Published!
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Publish
                  </>
                )}
              </GlassButton>
            </m.div>
            
            {/* Deployment overlay */}
            {isDeploying && (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-white font-medium">Deploying...</p>
                </div>
              </m.div>
            )}
          </m.div>
        </div>
      </m.div>
    </div>
  );
};

export default InterfaceAgentRenderer;

