import { Button, Typography } from '@mui/material';
import { Lock, Globe, Building2 } from 'lucide-react';
import { memo } from 'react';

const privacyOptions = [
  { value: 'private', label: 'Private', icon: Lock, desc: 'Only invited members' },
  { value: 'account', label: 'Account', icon: Building2, desc: 'All account members' },
  { value: 'public', label: 'Public', icon: Globe, desc: 'Everyone can join' },
];

const RoomPrivacySection = ({ formData, isSubmitting, onInputChange }) => {
  return (
    <div>
      <Typography variant="h6" className="mb-4 font-bold text-base">
        Privacy Settings
      </Typography>
      <div className="grid grid-cols-3 gap-3">
        {privacyOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = formData.policy.privacy === option.value;
          return (
            <Button
              key={option.value}
              type="button"
              onClick={() => onInputChange('policy.privacy')({ target: { value: option.value } })}
              disabled={isSubmitting}
              variant="outlined"
              className="normal-case"
              sx={{
                py: 2.5,
                px: 2,
                borderRadius: '16px',
                flexDirection: 'column',
                gap: 1.5,
                minHeight: '100px',
                borderWidth: '2px',
                transition: 'all 0.2s ease',
                backgroundColor: isSelected
                  ? 'rgba(139, 92, 246, 0.08)'
                  : 'transparent',
                borderColor: isSelected
                  ? 'rgb(139, 92, 246)'
                  : 'rgba(0, 0, 0, 0.08)',
                color: isSelected ? 'rgb(139, 92, 246)' : 'currentColor',
                '&:hover': {
                  borderWidth: '2px',
                  backgroundColor: isSelected
                    ? 'rgba(139, 92, 246, 0.12)'
                    : 'rgba(0, 0, 0, 0.04)',
                  borderColor: isSelected
                    ? 'rgb(139, 92, 246)'
                    : 'rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-2px)',
                },
                '.dark &': {
                  backgroundColor: isSelected
                    ? 'rgba(167, 139, 250, 0.12)'
                    : 'transparent',
                  borderColor: isSelected
                    ? 'rgb(167, 139, 250)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected ? 'rgb(167, 139, 250)' : 'currentColor',
                  '&:hover': {
                    backgroundColor: isSelected
                      ? 'rgba(167, 139, 250, 0.16)'
                      : 'rgba(255, 255, 255, 0.04)',
                    borderColor: isSelected
                      ? 'rgb(167, 139, 250)'
                      : 'rgba(255, 255, 255, 0.15)',
                  },
                },
              }}
            >
              <Icon size={24} strokeWidth={2.5} />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold">{option.label}</span>
                <span className="text-[0.6875rem] opacity-60 text-center leading-tight">
                  {option.desc}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(RoomPrivacySection);
