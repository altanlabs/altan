import { TextField, Autocomplete, Typography } from '@mui/material';
import { Shield, Users } from 'lucide-react';
import { memo } from 'react';

const roleOptions = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'listener', label: 'Listener' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

const RoomSettingsSection = ({ formData, isSubmitting, onInputChange }) => {
  return (
    <div className="grid grid-cols-2 gap-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
          <Typography variant="body2" className="font-bold text-sm">
            Default Role
          </Typography>
        </div>
        <Autocomplete
          fullWidth
          disabled={isSubmitting}
          options={roleOptions}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value?.value}
          value={roleOptions.find(opt => opt.value === formData.policy.default_role) || roleOptions[2]}
          onChange={(event, newValue) => {
            onInputChange('policy.default_role')({
              target: { value: newValue ? newValue.value : 'member' },
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select role"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                  borderRadius: '14px',
                  borderWidth: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: 'rgba(0, 0, 0, 0.06)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: '2px',
                    borderColor: 'rgb(139, 92, 246)',
                  },
                  '.dark &': {
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(167, 139, 250)',
                    },
                  },
                },
              }}
            />
          )}
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
          <Typography variant="body2" className="font-bold text-sm">
            Max Members
          </Typography>
        </div>
        <TextField
          type="number"
          value={formData.policy.max_members || ''}
          onChange={onInputChange('policy.max_members')}
          fullWidth
          disabled={isSubmitting}
          placeholder="Unlimited"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
              borderRadius: '14px',
              borderWidth: '2px',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              '& fieldset': {
                borderWidth: '2px',
                borderColor: 'rgba(0, 0, 0, 0.06)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
              },
              '&.Mui-focused fieldset': {
                borderWidth: '2px',
                borderColor: 'rgb(139, 92, 246)',
              },
              '.dark &': {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(167, 139, 250)',
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default memo(RoomSettingsSection);
