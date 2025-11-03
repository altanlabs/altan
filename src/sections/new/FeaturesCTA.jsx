import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { useHistory } from 'react-router-dom';

const FeaturesCTA = () => {
  const history = useHistory();

  return (
    <section id="cta" className="relative w-full py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
            Ready to build the future?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of teams building production-ready software with AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => history.push('/auth/register')}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium text-lg hover:bg-primary/90 transition-colors"
            >
              Get started free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => history.push('/demo')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-foreground font-medium text-lg hover:bg-background transition-colors"
            >
              Enter demo
            </button>
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default FeaturesCTA;
