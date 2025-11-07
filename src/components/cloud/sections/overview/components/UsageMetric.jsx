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
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 hover:shadow-lg transition-all"
    >
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${iconColors.bg} flex items-center justify-center ring-1 ring-border/50 shadow-sm`}>
              <Icon size={22} className={iconColors.text} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">
                {value.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 1, delay: delay + 0.1, ease: "easeOut" }}
              className={`h-full rounded-full ${getBarColor()}`}
            />
          </div>
        </div>
      </div>
    </m.div>
  );
};


