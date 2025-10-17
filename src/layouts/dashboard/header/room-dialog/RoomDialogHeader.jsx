import { IconButton, Typography } from '@mui/material';
import { Sparkles, X } from 'lucide-react';
import { memo } from 'react';

const RoomDialogHeader = ({ editMode, onClose, isSubmitting }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-10 py-8 border-b dark:border-white/[0.06] border-black/[0.06] bg-white/95 dark:bg-black/95 backdrop-blur-2xl">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-400/20 dark:to-fuchsia-400/20 flex items-center justify-center border border-violet-500/20 dark:border-violet-400/30 shadow-lg shadow-violet-500/5">
            <Sparkles size={24} className="text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
          </div>
          <div>
            <Typography variant="h5" className="font-bold text-xl mb-0.5 tracking-tight">
              {editMode ? 'Edit Room' : 'Create Room'}
            </Typography>
            <Typography variant="body2" className="text-sm opacity-50">
              {editMode ? 'Update your room settings' : 'Set up your collaborative space'}
            </Typography>
          </div>
        </div>
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          className="w-11 h-11 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
          sx={{
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <X size={22} strokeWidth={2} />
        </IconButton>
      </div>
    </div>
  );
};

export default memo(RoomDialogHeader);
