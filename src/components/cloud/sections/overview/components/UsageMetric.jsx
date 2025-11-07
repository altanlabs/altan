import React from 'react';
import { m } from 'framer-motion';

export const UsageMetric = ({
  icon: Icon,
  title,
  value,
  description,
  delay,
  gradientColors,
  iconColors,
}) => {
  const getBarColor = () => {
    if (value > 80) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (value > 60) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return gradientColors;
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 p-5 hover:shadow-xl transition-all backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
    >
      <div className={`absolute inset-0 ${iconColors.hover} opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconColors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon size={20} className={iconColors.text} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">
                {value.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative h-2.5 bg-border/60 rounded-full overflow-hidden shadow-inner">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 1, delay: delay + 0.1, ease: "easeOut" }}
              className={`h-full rounded-full relative overflow-hidden ${getBarColor()}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </m.div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </m.div>
  );
};


