import { m } from 'framer-motion';
import { Server, Cpu, HardDrive, Database } from 'lucide-react';
import React from 'react';

import { UsageMetric } from './UsageMetric';

export const InfrastructureActivity = ({
  cpuUsage,
  memoryUsage,
  storageUsage,
}) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-sm p-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Server size={16} className="text-white" />
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          Infrastructure Health
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <UsageMetric
          icon={Cpu}
          title="CPU Usage"
          value={cpuUsage}
          delay={0.6}
          gradientColors="bg-gradient-to-r from-emerald-500 to-teal-500"
          iconColors={{
            bg: 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30',
            text: 'text-emerald-600 dark:text-emerald-400',
            hover: 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5',
          }}
        />
        <UsageMetric
          icon={HardDrive}
          title="Memory Usage"
          value={memoryUsage}
          delay={0.7}
          gradientColors="bg-gradient-to-r from-blue-500 to-indigo-500"
          iconColors={{
            bg: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
            text: 'text-blue-600 dark:text-blue-400',
            hover: 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5',
          }}
        />
        <UsageMetric
          icon={Database}
          title="Storage Usage"
          value={storageUsage}
          delay={0.8}
          gradientColors="bg-gradient-to-r from-purple-500 to-pink-500"
          iconColors={{
            bg: 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
            text: 'text-purple-600 dark:text-purple-400',
            hover: 'bg-gradient-to-br from-purple-500/5 to-pink-500/5',
          }}
        />
      </div>
    </m.div>
  );
};
