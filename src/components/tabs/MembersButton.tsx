import { memo, useCallback, useState } from 'react';
import { Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import MembersList from '../members/MembersList.jsx';

interface MembersButtonProps {
  disabled?: boolean;
  size?: 'small' | 'default';
}

const MembersButton = ({ disabled = false, size = 'small' }: MembersButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled) return;
    setIsOpen(!isOpen);
  }, [disabled, isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClick}
              disabled={disabled}
              className="h-8 w-8"
            >
              <Users className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Room members</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-[360px] p-0 shadow-lg"
      >
        <div className="p-4">
          <MembersList
            maxHeight={350}
            showTitle={true}
            compact={true}
            showInviteButton={true}
            emptyMessage="No members in this room."
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default memo(MembersButton);

