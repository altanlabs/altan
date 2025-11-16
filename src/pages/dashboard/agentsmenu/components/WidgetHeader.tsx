/**
 * WidgetHeader Component
 * Following Single Responsibility Principle - handles only header rendering
 */

import { memo } from 'react';
import { AgentOrbAvatar } from '../../../../components/agents/AgentOrbAvatar';
import { Button } from '../../../../components/ui/button';
// @ts-ignore - JSX component without types
import Iconify from '../../../../components/iconify/Iconify';
import type { WidgetHeaderProps } from '../types';

interface CollapsedHeaderProps {
  agentCount: number;
  onExpand: () => void;
}

interface ExpandedHeaderProps {
  onCollapse: () => void;
  onCreateAgent: () => void;
}

export const CollapsedHeader = memo<CollapsedHeaderProps>(({ agentCount, onExpand }) => (
  <div
    onClick={onExpand}
    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/20 transition-colors"
  >
    <AgentOrbAvatar
      size={40}
      agentId="agents-widget"
      isStatic={false}
      className="shadow-lg"
    />
    <div className="flex-1">
      <h3 className="font-semibold text-sm text-foreground">Agents</h3>
      {agentCount > 0 && (
        <p className="text-xs text-muted-foreground">{agentCount} available</p>
      )}
    </div>
    <Iconify icon="mdi:chevron-up" width={20} className="text-muted-foreground" />
  </div>
));

CollapsedHeader.displayName = 'CollapsedHeader';

export const ExpandedHeader = memo<ExpandedHeaderProps>(({ onCollapse, onCreateAgent }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
    <AgentOrbAvatar
      size={40}
      agentId="agents-widget"
      isStatic={false}
      className="flex-shrink-0 shadow-lg"
    />
    <h3 className="flex-1 font-semibold text-base text-foreground">Agents</h3>
    <Button
      onClick={onCreateAgent}
      size="sm"
      className="rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground flex-shrink-0"
    >
      <Iconify icon="mdi:plus-circle" width={16} className="mr-1.5" />
      Create Agent
    </Button>
    <button
      onClick={onCollapse}
      className="p-2 hover:bg-accent/30 rounded transition-colors flex-shrink-0"
      title="Minimize"
    >
      <Iconify icon="mdi:chevron-down" width={20} className="text-muted-foreground" />
    </button>
  </div>
));

ExpandedHeader.displayName = 'ExpandedHeader';

