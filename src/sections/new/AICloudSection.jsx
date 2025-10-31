import { m } from 'framer-motion';
import { ArrowRight, CheckCircle2, Cloud, Code2, Layers, Shield, Zap } from 'lucide-react';
import React from 'react';

const AICloudSection = () => {
  const comparison = [
    { old: 'Static UI', new: 'Generative UI' },
    { old: 'CDN of Pixels', new: 'CDN of Tokens' },
    { old: 'Human-written Code', new: 'Agent-written Code' },
  ];

  return (
    <section id="cloud" className="relative w-full py-24 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm mb-6">
            <Cloud className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Enterprise Production-Ready</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6">
            The AI Cloud
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rethinking cloud services for the AI era. Infrastructure that deploys, monitors,
            optimizes, and repairs itself.
          </p>
        </m.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* Large Card - From Pages to Agents */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2 md:row-span-2"
          >
            <div className="h-full p-8 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-semibold text-foreground mb-4">From Pages to Agents</h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Traditional pages are synchronous and static. Agents think for minutes or hours,
                writing their own code to achieve goals.
              </p>

              <div className="space-y-3">
                {comparison.map((item, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground">{item.old}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{item.new}</span>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
          </m.div>

          {/* Problems to Solutions */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-1"
          >
            <div className="h-full p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Problems to Solutions</h3>
              <p className="text-muted-foreground leading-relaxed">
                An agentic cloud that doesn't just alert you—it fixes issues automatically.
              </p>
            </div>
          </m.div>

          {/* Enterprise Ready */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-1"
          >
            <div className="h-full p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Enterprise Ready</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built on AlloyDB and Kubernetes with enterprise-grade security and scalability.
              </p>
            </div>
          </m.div>

          {/* Infrastructure Features */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="md:col-span-3"
          >
            <div className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Infrastructure</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['AlloyDB PostgreSQL', 'Kubernetes (GKE)', 'Auto-Scaling', 'Multi-Tenant Isolation'].map(
                  (feature, index) => (
                    <m.div
                      key={feature}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </m.div>
                  ),
                )}
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default AICloudSection;
