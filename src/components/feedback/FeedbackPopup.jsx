import { X } from 'lucide-react';
import { memo } from 'react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button.tsx';

// ----------------------------------------------------------------------

const FeedbackPopup = memo(({ title, children, onClose, showCloseButton = true }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 w-[300px] max-w-[300px] animate-slideInUp max-[640px]:w-[calc(100vw-40px)] max-[640px]:max-w-[calc(100vw-40px)] max-[640px]:right-5">
      <div className="bg-[#2a2a2a] rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative">
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 h-7 w-7 text-[#888] hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className={cn(showCloseButton && 'pr-6')}>
          {title && (
            <h2 className="text-white font-semibold text-[18px] mb-2">{title}</h2>
          )}

          {children}
        </div>
      </div>
    </div>
  );
});

FeedbackPopup.displayName = 'FeedbackPopup';

export default FeedbackPopup;
