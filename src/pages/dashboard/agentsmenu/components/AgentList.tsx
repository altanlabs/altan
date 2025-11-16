/**
 * AgentList Component
 * Following Single Responsibility Principle - handles agent list rendering with different states
 */

/* eslint-disable react/prop-types */
import { memo } from 'react';

import { AgentListItem } from './AgentListItem';
// @ts-expect-error - JSX component without types
import Iconify from '../../../../components/iconify/Iconify';
import { Button } from '../../../../components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import type { AgentListProps } from '../types';

const LoadingSkeleton = memo(() => (
  <div>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="flex items-center gap-3 px-3 py-3.5 border-b border-border/40"
      >
        <div className="w-10 h-10 rounded-full bg-muted/50 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3.5 bg-muted/50 rounded w-1/3 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

interface EmptyStateProps {
  searchQuery: string;
  onNavigateToAgents: () => void;
}

const EmptyState = memo<EmptyStateProps>(({ searchQuery, onNavigateToAgents }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
      <Iconify icon="lucide:bot" width={24} className="text-muted-foreground" />
    </div>
    <p className="text-sm font-medium text-foreground mb-1">
      {searchQuery ? 'No agents found' : 'No agents yet'}
    </p>
    <p className="text-xs text-muted-foreground/70 mb-5">
      {searchQuery ? 'Try a different search' : 'Create your first AI agent to get started'}
    </p>
    {!searchQuery && (
      <Button onClick={onNavigateToAgents} size="sm" variant="outline" className="h-8 text-xs">
        Create agent
      </Button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

export const AgentList = memo<AgentListProps>(({
  agents,
  isLoading,
  searchQuery,
  onAgentClick,
  onAgentEdit,
  onNavigateToAgents,
}) => (
  <ScrollArea className="flex-1 overflow-x-hidden">
    <div className="w-full">
      {isLoading ? (
        <LoadingSkeleton />
      ) : agents.length === 0 ? (
        <EmptyState searchQuery={searchQuery} onNavigateToAgents={onNavigateToAgents} />
      ) : (
        <div>
          {agents.map((agent) => (
            <AgentListItem
              key={agent.id}
              agent={agent}
              onClick={onAgentClick}
              onEdit={onAgentEdit}
            />
          ))}
        </div>
      )}
    </div>
  </ScrollArea>
));

AgentList.displayName = 'AgentList';

