import { m } from 'framer-motion';
import { Check, Code, GitBranch, Workflow, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { GlassButton } from '../../../../components/ui/glass-button';

const ServicesAgentRenderer = ({ description }) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [builtServices, setBuiltServices] = useState([]);

  const services = [
    {
      id: 'payment',
      name: 'Payment Workflow',
      icon: Workflow,
      endpoint: '/api/payments',
      methods: ['POST /checkout', 'GET /status', 'POST /refund'],
    },
    {
      id: 'notification',
      name: 'Notification Service',
      icon: Zap,
      endpoint: '/api/notifications',
      methods: ['POST /send', 'GET /history', 'PUT /preferences'],
    },
    {
      id: 'webhook',
      name: 'Webhook Handler',
      icon: GitBranch,
      endpoint: '/api/webhooks',
      methods: ['POST /stripe', 'POST /github', 'POST /custom'],
    },
  ];

  const handleBuild = async () => {
    setIsBuilding(true);
    setBuiltServices([]);

    // Build services one by one
    for (let i = 0; i < services.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setBuiltServices((prev) => [...prev, services[i].id]);
    }

    setIsBuilding(false);
  };

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
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ae2cdd] to-[#ae00ff] bg-clip-text text-transparent">
            Building Services
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
            <span>RESTful API endpoints</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Business logic workflows</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Third-party integrations</span>
          </div>
        </m.div>

        {/* Build Services Button */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-start"
        >
          <GlassButton
            onClick={handleBuild}
            disabled={isBuilding || builtServices.length === services.length}
            size="default"
            className="disabled:opacity-70 disabled:cursor-not-allowed"
            contentClassName="flex items-center gap-2"
          >
            <Code className="w-5 h-5" />
            {builtServices.length === services.length
              ? 'Services Live!'
              : isBuilding
                ? 'Building...'
                : 'Build Services'}
          </GlassButton>
        </m.div>
      </m.div>

      {/* Right side - Backend Services */}
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
              <h4 className="text-lg font-semibold text-foreground mb-1">Backend Services</h4>
              <p className="text-sm text-muted-foreground">
                {builtServices.length} / {services.length} services deployed
              </p>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isBuilt = builtServices.includes(service.id);
                const isCurrentlyBuilding = isBuilding && builtServices.length === index;

                return (
                  <m.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isBuilt
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-border/30 bg-background/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            isBuilt
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Check mark when built */}
                        {isBuilt && (
                          <m.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </m.div>
                        )}
                      </div>

                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="font-semibold text-foreground mb-1">{service.name}</div>
                        <code className="text-xs text-muted-foreground font-mono">
                          {service.endpoint}
                        </code>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex items-center gap-2">
                        {isCurrentlyBuilding ? (
                          <m.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full" />
                          </m.div>
                        ) : isBuilt ? (
                          <span className="text-xs font-medium text-green-500">Live</span>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">Pending</span>
                        )}
                      </div>
                    </div>

                    {/* API endpoints - show when built */}
                    {isBuilt && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 pt-3 border-t border-border/30 space-y-1.5"
                      >
                        {service.methods.map((method) => (
                          <div
                            key={method}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                method.startsWith('POST')
                                  ? 'bg-blue-500/20 text-blue-500'
                                  : method.startsWith('GET')
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-orange-500/20 text-orange-500'
                              }`}
                            >
                              {method.split(' ')[0]}
                            </div>
                            <code className="text-muted-foreground font-mono">
                              {method.split(' ')[1]}
                            </code>
                          </div>
                        ))}
                      </m.div>
                    )}
                  </m.div>
                );
              })}
            </div>

            {/* Services Summary - Show when all built */}
            {builtServices.length === services.length && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 pt-6 border-t border-border/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      All services deployed
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {services.reduce((acc, s) => acc + s.methods.length, 0)} endpoints ready to
                      handle requests
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </m.div>
            )}
          </m.div>
        </div>

        {/* Glow effect when building */}
        {isBuilding && (
          <m.div
            className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-3xl blur-2xl -z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </m.div>
    </div>
  );
};

export default ServicesAgentRenderer;
