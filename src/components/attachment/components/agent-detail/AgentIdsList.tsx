import { Copy, Check } from 'lucide-react';
import { memo, useState, FC } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AgentData {
  id?: string;
  account_id?: string;
  space_id?: string;
  elevenlabs_id?: string;
}

interface AgentIdsListProps {
  agentData: AgentData;
}

const AgentIdsList: FC<AgentIdsListProps> = ({ agentData }) => {
  const [expanded, setExpanded] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, label: string): void => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedId(label);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        // Silently fail
      });
  };

  const cropId = (id?: string): string => {
    if (!id) return 'N/A';
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  const ids = [
    { label: 'Agent ID', value: agentData?.id },
    { label: 'Account ID', value: agentData?.account_id },
    { label: 'Space ID', value: agentData?.space_id },
    { label: 'ElevenLabs ID', value: agentData?.elevenlabs_id },
  ].filter((item) => item.value);

  const isExpanded = expanded === 'ids';

  return (
    <Accordion type="single" collapsible value={expanded} onValueChange={setExpanded}>
      <AccordionItem value="ids" className="border-0">
        <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200">
          <div className="text-left">
            <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
              Identifiers
            </div>
            <div className={cn(
              "text-xs text-neutral-500 dark:text-neutral-400 transition-all duration-200",
              isExpanded ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
            )}>
              {ids.length} ID{ids.length !== 1 ? 's' : ''}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-3 pb-3 pt-0 animate-in fade-in-50 slide-in-from-top-2 duration-300">
          <div className="space-y-1.5">
            {ids.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <Label className="text-xs text-neutral-500 dark:text-neutral-400 w-24 flex-shrink-0">
                  {item.label}
                </Label>
                <div className="flex items-center gap-1 flex-1 min-w-0 px-2 py-1 bg-neutral-100 dark:bg-neutral-800/50 rounded">
                  <code className="flex-1 text-xs font-mono text-neutral-700 dark:text-neutral-300 overflow-hidden text-ellipsis whitespace-nowrap">
                    {cropId(item.value)}
                  </code>
                  <button
                    onClick={() => item.value && handleCopy(item.value, item.label)}
                    className="flex-shrink-0 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    {copiedId === item.label ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default memo(AgentIdsList);

