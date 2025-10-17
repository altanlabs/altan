import { Button } from '@mui/material';
import { Check, Loader2 } from 'lucide-react';
import { memo } from 'react';

const RoomDialogFooter = ({ editMode, isSubmitting, formData, onClose }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 px-10 py-8 border-t dark:border-white/[0.06] border-black/[0.06] bg-white/95 dark:bg-black/95 backdrop-blur-2xl">
      <div className="flex justify-end gap-4 max-w-4xl mx-auto">
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="outlined"
          className="normal-case text-sm font-semibold rounded-xl px-8 py-3 border-black/[0.1] dark:border-white/[0.1] hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          sx={{
            minWidth: '120px',
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || !formData.name.trim()}
          className="normal-case text-sm font-bold rounded-xl px-10 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none transition-all"
          sx={{
            minWidth: '140px',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&.Mui-disabled': {
              color: 'white',
              opacity: 0.5,
            },
          }}
          startIcon={isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
        >
          {isSubmitting ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Room' : 'Create Room')}
        </Button>
      </div>
    </div>
  );
};

export default memo(RoomDialogFooter);
