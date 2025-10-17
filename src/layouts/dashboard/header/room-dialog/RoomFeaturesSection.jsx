import { Switch, Typography } from '@mui/material';
import { Brain, Bot, Mic, Sparkles } from 'lucide-react';
import { memo } from 'react';

const RoomFeaturesSection = ({ formData, isSubmitting, onInputChange }) => {
  const features = [
    {
      key: 'memory_enabled',
      icon: Brain,
      title: 'Memory',
      description: 'Contextual awareness across conversations',
      checked: formData.policy.memory_enabled,
      color: 'emerald',
    },
    {
      key: 'cagi_enabled',
      icon: Bot,
      title: 'Multi-Agent (CAGI)',
      description: 'Collaborative autonomous AI agents',
      checked: formData.policy.cagi_enabled,
      color: 'violet',
    },
    {
      key: 'voice_enabled',
      icon: Mic,
      title: 'Voice',
      description: 'Real-time voice conversations',
      checked: formData.policy.voice_enabled,
      color: 'fuchsia',
    },
  ];

  const getColorClasses = (color, isActive) => {
    const colorMap = {
      emerald: {
        bg: isActive ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-transparent',
        border: isActive ? 'border-emerald-300 dark:border-emerald-700' : 'border-black/[0.06] dark:border-white/[0.06]',
        icon: 'text-emerald-600 dark:text-emerald-400',
      },
      violet: {
        bg: isActive ? 'bg-violet-50 dark:bg-violet-950/30' : 'bg-transparent',
        border: isActive ? 'border-violet-300 dark:border-violet-700' : 'border-black/[0.06] dark:border-white/[0.06]',
        icon: 'text-violet-600 dark:text-violet-400',
      },
      fuchsia: {
        bg: isActive ? 'bg-fuchsia-50 dark:bg-fuchsia-950/30' : 'bg-transparent',
        border: isActive ? 'border-fuchsia-300 dark:border-fuchsia-700' : 'border-black/[0.06] dark:border-white/[0.06]',
        icon: 'text-fuchsia-600 dark:text-fuchsia-400',
      },
    };
    return colorMap[color];
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
        <Typography variant="h6" className="font-bold text-base">
          Features
        </Typography>
      </div>
      <div className="flex flex-col gap-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          const colors = getColorClasses(feature.color, feature.checked);
          return (
            <div
              key={feature.key}
              className={`flex items-center justify-between py-4 px-5 rounded-2xl border-2 transition-all duration-200 ${colors.bg} ${colors.border} hover:shadow-md`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${feature.checked ? colors.bg : 'bg-black/5 dark:bg-white/5'}`}>
                  <Icon size={22} className={colors.icon} strokeWidth={2.5} />
                </div>
                <div>
                  <Typography variant="body2" className="text-sm font-bold mb-0.5">
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" className="text-xs opacity-60">
                    {feature.description}
                  </Typography>
                </div>
              </div>
              <Switch
                checked={feature.checked}
                onChange={(e) => onInputChange(`policy.${feature.key}`)(e)}
                disabled={isSubmitting}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: feature.color === 'emerald' ? '#10b981' : feature.color === 'violet' ? '#8b5cf6' : '#d946ef',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: feature.color === 'emerald' ? '#10b981' : feature.color === 'violet' ? '#8b5cf6' : '#d946ef',
                  },
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(RoomFeaturesSection);
