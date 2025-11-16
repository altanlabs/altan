import { Icon } from '@iconify/react';
import { memo, useState, FC } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tool {
  id?: string;
  tool?: {
    name?: string;
    tool_type?: string;
    action_type?: {
      connection_type?: {
        name?: string;
        icon?: string;
        external_app?: {
          icon?: string;
        };
      };
    };
  };
}

interface AgentToolsListProps {
  tools?: Tool[];
  agentId?: string;
  spaceId?: string | undefined;
}

const AgentToolsList: FC<AgentToolsListProps> = ({ tools = [] }) => {
  const [expanded, setExpanded] = useState<string>('');

  const getToolIcon = (tool: Tool): string => {
    if (tool.tool?.tool_type === 'client') {
      return 'mdi:desktop-classic';
    }
    return (
      tool.tool?.action_type?.connection_type?.icon ||
      tool.tool?.action_type?.connection_type?.external_app?.icon ||
      'ri:hammer-fill'
    );
  };

  const isExpanded = expanded === 'tools';

  return (
    <Accordion type="single" collapsible value={expanded} onValueChange={setExpanded}>
      <AccordionItem value="tools" className="border-0">
        <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200">
          <div className="flex items-center justify-between w-full pr-2">
            <div className="text-left">
              <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                Tools
              </div>
              <div className={cn(
                "text-xs text-neutral-500 dark:text-neutral-400 transition-all duration-200",
                isExpanded ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              )}>
                {tools.length === 0 ? 'None' : `${tools.length} tool${tools.length !== 1 ? 's' : ''}`}
              </div>
            </div>
            <div className={cn(
              "transition-all duration-200",
              isExpanded ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}>
              {tools.length > 0 && (
                <Badge variant="outline" className="h-4 min-w-4 text-xs px-1.5 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  {tools.length}
                </Badge>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-3 pb-3 pt-0 animate-in fade-in-50 slide-in-from-top-2 duration-300">
          {tools.length === 0 ? (
            <div className="py-2">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                No tools configured
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              {tools.map((tool, index) => (
                <div
                  key={tool.id || index}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <Icon icon={getToolIcon(tool)} width={14} className="text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-neutral-900 dark:text-neutral-100 overflow-hidden text-ellipsis whitespace-nowrap">
                      {tool.tool?.name || 'Unnamed Tool'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default memo(AgentToolsList);

