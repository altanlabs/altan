/**
 * AgentListItem Component
 * Following Single Responsibility Principle - handles rendering of a single agent item
 */

/* eslint-disable react/prop-types */
import { memo } from 'react';

import { AgentAvatar } from './AgentAvatar';
// @ts-expect-error - JSX component without types
import Iconify from '../../../../components/iconify/Iconify';
import { cn } from '../../../../lib/utils';
import type { AgentListItemProps } from '../types';

export const AgentListItem = memo<AgentListItemProps>(({ agent, onClick, onEdit }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-3.5',
        'transition-all duration-150 group cursor-pointer',
        'border-b border-border/40',
        'hover:bg-accent/5 hover:border-border/60'
      )}
      onClick={() => onClick(agent)}
    >
      <div className="relative flex-shrink-0">
        <AgentAvatar agent={agent} size={40} />
        {/* Subtle online status indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-[1.5px] border-background" />
      </div>

      <div className="flex-1 min-w-0 overflow-hidden mr-2">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-[13px] text-foreground truncate leading-tight">
            {agent.name}
          </h4>
          {agent.cloned_from && (
            <div
              className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50"
              title="Cloned agent"
            >
              <Iconify icon="lucide:copy" width={9} className="text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Clone</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={(e) => onEdit(agent, e)}
        className={cn(
          'flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md',
          'transition-all duration-150',
          'opacity-0 group-hover:opacity-100',
          'bg-muted/50 border border-border/50',
          'hover:bg-muted hover:border-border',
          'z-10'
        )}
        title="Edit agent"
      >
        <Iconify icon="lucide:edit-3" width={9} className="text-muted-foreground" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Edit</span>
      </button>
    </div>
  );
});

AgentListItem.displayName = 'AgentListItem';

