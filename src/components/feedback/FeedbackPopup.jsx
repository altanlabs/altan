import { memo } from 'react';
import { X } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

// ----------------------------------------------------------------------

const FeedbackPopup = memo(({ title, children, onClose, showCloseButton = true }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 w-[400px] max-w-[400px] animate-slideInUp sm:w-[calc(100vw-40px)] sm:max-w-[calc(100vw-40px)] sm:left-5">
      <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        {showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 text-[#888] hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        <div className={cn(showCloseButton && 'pr-8')}>
          {title && (
            <h2 className="text-white font-semibold text-lg mb-4">{title}</h2>
          )}

          {children}
        </div>
      </div>
    </div>
  );
});

FeedbackPopup.displayName = 'FeedbackPopup';

export default FeedbackPopup;

