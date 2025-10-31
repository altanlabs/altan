import { m } from 'framer-motion';
import { Briefcase, Code2, Palette, Rocket, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';

const ICPSection = () => {
  const [activeICP, setActiveICP] = useState(0);

  const icps = [
    {
      title: 'Founders',
      icon: Rocket,
      description: 'Ship your MVP in days, not months. Focus on your vision while AI agents handle the code.',
      benefits: [
        'Launch faster than competitors',
        'No technical co-founder needed',
        'Production-ready from day one',
      ],
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Product Teams',
      icon: Users,
      description: 'Accelerate development cycles and ship features 10x faster with autonomous AI agents.',
      benefits: [
        'Parallel feature development',
        'Automated testing & deployment',
        'Continuous optimization',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Developers',
      icon: Code2,
      description: 'Focus on solving complex problems while agents handle boilerplate, testing, and infrastructure.',
      benefits: [
        'Auto-generated boilerplate code',
        'Instant infrastructure setup',
        'Built-in best practices',
      ],
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Designers',
      icon: Palette,
      description: 'Turn designs into production code instantly. No more waiting for developer handoff.',
      benefits: [
        'Design to code in minutes',
        'Pixel-perfect implementation',
        'Interactive prototypes',
      ],
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Agencies',
      icon: Briefcase,
      description: 'Scale your delivery capacity without hiring. Handle more clients with AI-powered development.',
      benefits: [
        'Scale without headcount',
        'Consistent code quality',
        'Faster client delivery',
      ],
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Enterprises',
      icon: TrendingUp,
      description: 'Modernize legacy systems and accelerate digital transformation with enterprise-grade AI.',
      benefits: [
        'Legacy system migration',
        'Enterprise security & compliance',
        'Multi-team coordination',
      ],
      color: 'from-slate-500 to-zinc-500',
    },
  ];

  return (
    <section id="customers" className="relative w-full py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6">
            Where every team{' '}
            <span className="text-primary">ships faster</span>
          </h2>
        </m.div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-[300px,1fr] gap-8 lg:gap-16">
          {/* Left: ICP List */}
          <div className="space-y-2">
            {icps.map((icp, index) => (
              <m.button
                key={icp.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => setActiveICP(index)}
                type="button"
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                  activeICP === index
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      activeICP === index ? `bg-gradient-to-br ${icp.color}` : 'bg-muted'
                    }`}
                  >
                    <icp.icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        activeICP === index ? 'text-white' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold transition-colors duration-300 ${
                        activeICP === index ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {icp.title}
                    </h3>
                  </div>
                </div>
              </m.button>
            ))}
          </div>

          {/* Right: Active ICP Details */}
          <m.div
            key={activeICP}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="p-8 md:p-12 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm">
              {/* Icon & Title */}
              <div className="mb-8">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${icps[activeICP].color} mb-6`}
                >
                  {React.createElement(icps[activeICP].icon, {
                    className: 'w-8 h-8 text-white',
                  })}
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                  {icps[activeICP].title}
                </h3>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {icps[activeICP].description}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
                  How Altan Helps
                </h4>
                {icps[activeICP].benefits.map((benefit, index) => (
                  <m.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-muted/50"
                  >
                    <div className={`mt-0.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${icps[activeICP].color}`} />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </m.div>
                ))}
              </div>

              {/* Decorative gradient */}
              <div
                className={`absolute -z-10 top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br ${icps[activeICP].color} opacity-5 blur-3xl`}
              />
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
};

export default ICPSection;

