import { m } from 'framer-motion';
import { Database, FolderOpen, Radio, Server, Zap } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const CloudAgentRenderer = ({ description }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedServices, setDeployedServices] = useState([]);

  const services = [
    { id: 'database', label: 'PostgreSQL', icon: Database, status: 'offline' },
    { id: 'storage', label: 'Storage', icon: FolderOpen, status: 'offline' },
    { id: 'realtime', label: 'Realtime', icon: Radio, status: 'offline' },
    { id: 'apis', label: 'REST APIs', icon: Server, status: 'offline' },
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployedServices([]);
    for (let i = 0; i < services.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDeployedServices((prev) => [...prev, services[i].id]);
    }

    setIsDeploying(false);
  };

  // Auto-trigger deployment animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDeploy();
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
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
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#00fbff] to-[#68dffd] bg-clip-text text-transparent">
            Cloud Infrastructure
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
            <span>PostgreSQL & Supabase ready</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Auto-scaling infrastructure</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Enterprise-grade security</span>
          </div>
        </m.div>

        {/* Status indicator */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-start"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00fbff]/10 to-[#68dffd]/10 border border-[#00fbff]/20">
            <Zap className="w-5 h-5 text-[#00fbff]" />
            <span className="text-sm font-medium">
              {deployedServices.length === services.length
                ? 'Infrastructure Live!'
                : isDeploying
                  ? 'Deploying...'
                  : 'Infrastructure ready'}
            </span>
          </div>
        </m.div>
      </m.div>

      {/* Right side - Infrastructure Services */}
      <m.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl p-6">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground mb-1">Cloud Infrastructure</h4>
              <p className="text-sm text-muted-foreground">
                {deployedServices.length} / {services.length} services running
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-2 gap-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isDeployed = deployedServices.includes(service.id);
                const isCurrentlyDeploying =
                  isDeploying &&
                  deployedServices.length === index;

                return (
                  <m.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isDeployed
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-border/30 bg-background/30'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                        isDeployed
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isCurrentlyDeploying ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Label */}
                    <div className="text-sm font-medium text-foreground mb-1">{service.label}</div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDeployed ? 'bg-green-500' : 'bg-muted-foreground/50'
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {isDeployed ? 'Running' : 'Offline'}
                      </span>
                    </div>

                    {/* Deploying indicator */}
                    {isCurrentlyDeploying && (
                      <m.div
                        className="absolute top-2 right-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <div className="w-3 h-3 border-2 border-foreground border-t-transparent rounded-full" />
                      </m.div>
                    )}
                  </m.div>
                );
              })}
            </div>

            {/* Infrastructure Stats - Show when all deployed */}
            {deployedServices.length === services.length && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 pt-6 border-t border-border/30 grid grid-cols-3 gap-4"
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">12%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">CPU</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">245MB</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Memory</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">1.2GB</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Storage</div>
                </div>
              </m.div>
            )}
          </m.div>
        </div>

        {/* Glow effect when deploying */}
        {isDeploying && (
          <m.div
            className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl -z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </m.div>
    </div>
  );
};

export default CloudAgentRenderer;
