import { Icon } from '@iconify/react';

import CustomDialog from '../../../../components/dialogs/CustomDialog';

export const MODE_LABELS = {
  manual: 'Interactive Mode',
  autopilot: 'Autopilot (Max Mode)',
};

/**
 * Track autopilot upgrade dialog events
 */
const trackAutopilotUpgradeEvent = (action, additionalData = {}) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'autopilot_upgrade_dialog', {
        action, // 'discard' or 'go_to_pricing'
        dialog_type: 'autopilot_upgrade',
        source: 'dashboard_create',
        ...additionalData,
      });
      console.log('📊 Autopilot upgrade dialog event tracked:', { action, ...additionalData });
    } else {
      console.warn('❌ gtag not available - autopilot upgrade tracking skipped');
    }
  } catch (error) {
    console.error('💥 Error tracking autopilot upgrade event:', error);
  }
};

function AutopilotUpgradeDialog({ open, onClose }) {
  const handleUpgrade = () => {
    // Track going to pricing page
    trackAutopilotUpgradeEvent('autopilot_click_pricing', {
      pricing_source: 'autopilot_upgrade_dialog',
      upgrade_type: 'autopilot_max_mode',
    });

    window.open('/pricing', '_blank');
    onClose();
  };

  const handleDiscard = () => {
    onClose();
  };

  const features = [
    {
      icon: 'mdi:brain',
      text: '1M-token "Max Mode" context for all agents',
      highlight: true,
    },
    {
      icon: 'mdi:auto-fix',
      text: 'Background planning & automatic execution of steps',
      highlight: false,
    },
    {
      icon: 'mdi:diamond-stone',
      text: 'Smartest models and tools',
      highlight: false,
    },
    {
      icon: 'mdi:clock-fast',
      text: 'Status updates while you focus on other work',
      highlight: false,
    },
  ];

  return (
    <CustomDialog
      dialogOpen={open}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-lg"
    >
      <div>
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 dark:from-purple-400/10 dark:via-blue-400/10 dark:to-cyan-400/10" />

        {/* Premium badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            PREMIUM
          </div>
        </div>

        <div className="relative p-8">
          {/* Header with enhanced icon */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                <Icon
                  icon="mdi:lightning-bolt"
                  className="w-7 h-7 text-white"
                />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-xl blur opacity-20 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Autopilot + Max Mode
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Unlock the full potential of AI
              </p>
            </div>
          </div>

          {/* Main description */}
          <div className="mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Plan and execute your project{' '}
              <span className="font-semibold text-gray-900 dark:text-white">end-to-end</span> in the
              background. Unlock the largest context windows, full autonomy, and our best models.
            </p>
          </div>

          {/* Enhanced features list */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Icon
                icon="mdi:star"
                className="w-5 h-5 text-amber-500"
              />
              What you get:
            </h4>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${
                    feature.highlight
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 ring-1 ring-purple-200/50 dark:ring-purple-700/50'
                      : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      feature.highlight
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Icon
                      icon={feature.icon}
                      className="w-4 h-4"
                    />
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      feature.highlight
                        ? 'text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 relative group bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-2">
                <Icon
                  icon="mdi:rocket"
                  className="w-5 h-5"
                />
                Upgrade Now
              </div>
            </button>
            <button
              onClick={handleDiscard}
              className="px-6 py-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
            >
              Maybe Later
            </button>
          </div>

          {/* Bottom accent */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Join +30.000 builders using Autopilot
            </p>
          </div>
        </div>
      </div>
    </CustomDialog>
  );
}

export default AutopilotUpgradeDialog;
