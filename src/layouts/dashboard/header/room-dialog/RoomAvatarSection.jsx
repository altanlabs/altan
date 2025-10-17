import { TextField } from '@mui/material';
import { m } from 'framer-motion';
import { memo } from 'react';

import { UploadAvatar } from '../../../../components/upload';

const RoomAvatarSection = ({ formData, isSubmitting, onInputChange, onAvatarDrop }) => {
  return (
    <div className="flex gap-6 items-start">
      <UploadAvatar
        className="w-28 h-28 rounded-2xl border-2 dark:border-white/[0.1] border-black/[0.1] shadow-xl"
        sx={{
          width: 112,
          height: 112,
          borderRadius: '16px',
          '&:hover': {
            transform: 'scale(1.02)',
            transition: 'transform 0.2s ease',
          },
        }}
        file={formData.avatar_url}
        onDrop={onAvatarDrop}
        onDelete={() => onInputChange('avatar_url')({ target: { value: null } })}
        disabled={isSubmitting}
      />
      <div className="flex-1 space-y-4">
        <TextField
          placeholder="Enter room name"
          value={formData.name}
          onChange={onInputChange('name')}
          required
          fullWidth
          disabled={isSubmitting}
          className="text-base"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '14px',
              padding: '4px 8px',
              backgroundColor: 'transparent',
              '& fieldset': {
                borderWidth: '2px',
                borderColor: 'rgba(0, 0, 0, 0.08)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.15)',
              },
              '&.Mui-focused fieldset': {
                borderWidth: '2px',
                borderColor: 'rgb(139, 92, 246)',
              },
              '.dark &': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(167, 139, 250)',
                },
              },
            },
          }}
        />
        {formData.name.trim() && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <TextField
              placeholder="Add a description (optional)"
              value={formData.description}
              onChange={onInputChange('description')}
              fullWidth
              disabled={isSubmitting}
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                  borderRadius: '14px',
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
          </m.div>
        )}
      </div>
    </div>
  );
};

export default memo(RoomAvatarSection);
