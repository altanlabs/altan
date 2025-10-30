import { m } from 'framer-motion';
import React from 'react';

const SolutionsSection = () => {
  const solutions = [
    'Internal tools',
    'Customer portals',
    'CRMs',
    'Chatbots',
    'Automations',
    'Billing systems',
  ];

  return (
    <section className="relative w-full py-24 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Headline */}
          <m.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground">
              Software that ships.
            </h2>
          </m.div>

          {/* Right: Solutions Grid */}
          <m.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {solutions.map((solution, index) => (
              <m.div
                key={solution}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background transition-colors"
              >
                <span className="text-lg font-medium text-foreground">{solution}</span>
              </m.div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;

