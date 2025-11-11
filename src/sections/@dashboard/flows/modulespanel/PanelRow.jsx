import { m } from 'framer-motion';
import { memo } from 'react';

import { Badge } from '@components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { cn } from '@lib/utils';

import Iconify from '../../../../components/iconify';
import IconRenderer from '../../../../components/icons/IconRenderer.jsx';

const stripBrackets = (name) => name.replace(/\[.*?\]\s*/, '');

const PanelRow = ({
  icon,
  name,
  description,
  options = null,
  onClick = null,
  hideArrow = false,
  disabled = false,
  isSemanticResult = false,
  sx = {},
}) => {
  const handleClick = disabled ? undefined : onClick;

  return (
    <TooltipProvider delayDuration={300}>
      <m.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={disabled ? {} : { x: 2 }}
        whileTap={disabled ? {} : { scale: 0.998 }}
        onClick={handleClick}
        className={cn(
          'relative flex items-center gap-2 px-2 py-2.5 w-full transition-all duration-200',
          'border-l-2 border-transparent',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:border-foreground/20 hover:bg-muted/50',
          sx.backgroundColor && 'bg-muted/30',
        )}
        style={sx}
      >
        <div className="flex-shrink-0">
          <IconRenderer icon={icon} size={28} className="transition-transform duration-200" />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{stripBrackets(name)}</p>
              {description && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{description}</p>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">{description || name}</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1.5 ml-auto">
          {isSemanticResult && (
            <Badge variant="secondary" className="h-4 text-[9px] px-1.5">
              <Iconify icon="mdi:magic" width={10} className="mr-0.5" />
              AI
            </Badge>
          )}
          {options !== null && (
            <Badge variant="outline" className="h-4 text-[9px] px-1.5">
              {options.length}
            </Badge>
          )}
          {!hideArrow && (
            <Iconify
              icon="mdi:chevron-right"
              width={14}
              className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>
      </m.div>
    </TooltipProvider>
  );
};

export default memo(PanelRow);
