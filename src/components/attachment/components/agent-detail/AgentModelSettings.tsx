import { FileText } from 'lucide-react';
import { memo, useState, FC } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import WebSearchConfig from './WebSearchConfig';

const models = [
  { provider: 'Anthropic', models: ['claude-4-1-opus-latest', 'claude-4-opus-latest', 'claude-4-5-sonnet-latest', 'claude-4-sonnet-latest'] },
  { provider: 'OpenAI', models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'o4-mini', 'o3', 'o3-mini', 'o4-mini-deep-research'] },
];

const modelToProvider: Record<string, string> = {};
models.forEach((providerData) => {
  providerData.models.forEach((model) => {
    modelToProvider[model] = providerData.provider;
  });
});

const alwaysReasoningModels = ['o1-mini', 'o1', 'o3-mini', 'o3', 'o4-mini'];
const optionalReasoningModels = ['gpt-5', 'claude-4-1-opus-latest', 'claude-4-opus-latest', 'claude-4-5-sonnet-latest', 'claude-4-sonnet-latest'];

const betaHeaderOptions = [
  'message-batches-2024-09-24',
  'prompt-caching-2024-07-31',
  'computer-use-2024-10-22',
  'computer-use-2025-01-24',
  'pdfs-2024-09-25',
  'token-counting-2024-11-01',
  'token-efficient-tools-2025-02-19',
  'output-128k-2025-02-19',
  'files-api-2025-04-14',
  'mcp-client-2025-04-04',
  'dev-full-thinking-2025-05-14',
  'interleaved-thinking-2025-05-14',
  'code-execution-2025-05-22',
  'extended-cache-ttl-2025-04-11',
  'context-1m-2025-08-07',
];

interface AgentData {
  id: string;
  llm_config?: {
    model_id?: string;
    provider?: string;
    settings?: {
      temperature?: number;
      token_limit?: number;
      reasoning_effort?: string;
      reasoning_enabled?: boolean;
      beta_headers?: string[];
      web_search?: {
        enabled?: boolean;
      };
    };
  };
}

interface AgentModelSettingsProps {
  agentData: AgentData;
  onFieldChange: (field: string, value: any) => void;
}

const AgentModelSettings: FC<AgentModelSettingsProps> = ({ agentData, onFieldChange }) => {
  const [expanded, setExpanded] = useState<string>('');
  const [betaOpen, setBetaOpen] = useState(false);

  const llmModel = agentData?.llm_config?.model_id || 'o3-mini';
  const provider = agentData?.llm_config?.provider || modelToProvider[llmModel];
  const temperature = agentData?.llm_config?.settings?.temperature ?? 0.7;
  const tokenLimit = agentData?.llm_config?.settings?.token_limit ?? -1;
  const reasoningEffort = agentData?.llm_config?.settings?.reasoning_effort || 'medium';
  const reasoningEnabled = agentData?.llm_config?.settings?.reasoning_enabled ?? false;
  const betaHeaders = agentData?.llm_config?.settings?.beta_headers ?? [];
  const webSearchEnabled = agentData?.llm_config?.settings?.web_search?.enabled ?? false;

  const handleModelChange = (newModel: string): void => {
    const newProvider = modelToProvider[newModel];
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      model_id: newModel,
      provider: newProvider,
    });
  };

  const handleReasoningEnabledChange = (enabled: boolean): void => {
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, reasoning_enabled: enabled },
    });
  };

  const handleReasoningEffortChange = (effort: string): void => {
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: { ...agentData.llm_config?.settings, reasoning_effort: effort },
    });
  };

  const handleBetaHeaderToggle = (option: string): void => {
    const newHeaders = betaHeaders.includes(option)
      ? betaHeaders.filter((h) => h !== option)
      : [...betaHeaders, option];
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: {
        ...agentData.llm_config?.settings,
        beta_headers: newHeaders,
      },
    });
  };

  const showReasoningControls = alwaysReasoningModels.includes(llmModel) ||
    (optionalReasoningModels.includes(llmModel) && reasoningEnabled);

  const isExpanded = expanded === 'model';

  return (
    <Accordion type="single" collapsible value={expanded} onValueChange={setExpanded}>
      <AccordionItem value="model" className="border-0">
        <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200">
          <div className="flex items-center justify-between w-full pr-2">
            <div className="text-left">
              <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                Model
              </div>
              <div className={cn(
                "text-xs text-neutral-500 dark:text-neutral-400 font-mono transition-all duration-200",
                isExpanded ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              )}>
                {provider} · {llmModel}
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1 transition-all duration-200",
              isExpanded ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}>
              {showReasoningControls && (
                <Badge variant="outline" className="h-4 text-xs px-1.5 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  {reasoningEffort}
                </Badge>
              )}
              {webSearchEnabled && (
                <Badge variant="outline" className="h-4 text-xs px-1.5 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  web
                </Badge>
              )}
              {betaHeaders.length > 0 && (
                <Badge variant="outline" className="h-4 text-xs px-1.5 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                  β{betaHeaders.length}
                </Badge>
              )}
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                {temperature.toFixed(1)}
              </span>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-3 pb-3 pt-0 animate-in fade-in-50 slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            {/* Model Selection */}
            <div>
              <Label className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 block">
                MODEL
              </Label>
              <Select value={llmModel} onValueChange={handleModelChange}>
                <SelectTrigger className="h-8 text-sm bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                  {models.map((providerGroup) => (
                    <SelectGroup key={providerGroup.provider}>
                      <SelectLabel className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {providerGroup.provider}
                      </SelectLabel>
                      {providerGroup.models.map((model) => (
                        <SelectItem
                          key={model}
                          value={model}
                          className="text-sm pl-6 focus:bg-neutral-100 dark:focus:bg-neutral-800"
                        >
                          {model}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional Reasoning Toggle */}
            {optionalReasoningModels.includes(llmModel) && (
              <div className="flex items-center justify-between">
                <Label htmlFor="reasoning-toggle" className="text-xs text-neutral-700 dark:text-neutral-300">
                  Enable extended thinking
                </Label>
                <Switch
                  id="reasoning-toggle"
                  checked={reasoningEnabled}
                  onCheckedChange={handleReasoningEnabledChange}
                  className="data-[state=checked]:bg-neutral-900 dark:data-[state=checked]:bg-neutral-100"
                />
              </div>
            )}

            {/* Reasoning Effort */}
            {showReasoningControls && (
              <div>
                <Label className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 block">
                  REASONING EFFORT
                </Label>
                <div className="flex gap-1">
                  {['low', 'medium', 'high'].map((effort) => (
                    <button
                      key={effort}
                      onClick={() => handleReasoningEffortChange(effort)}
                      className={cn(
                        'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                        reasoningEffort === effort
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      )}
                    >
                      {effort}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Token Limit */}
            {tokenLimit > 0 && (
              <div>
                <Label className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 block">
                  TOKEN LIMIT
                </Label>
                <Badge variant="outline" className="h-6 text-xs border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
                  <FileText className="h-3 w-3 mr-1" />
                  {tokenLimit.toLocaleString()} tokens max
                </Badge>
              </div>
            )}

            {/* Beta Headers - Only for Anthropic */}
            {provider?.toLowerCase() === 'anthropic' && (
              <div>
                <Label className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 block">
                  BETA FEATURES
                </Label>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-950">
                  <button
                    onClick={() => setBetaOpen(!betaOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <span className="text-xs">
                      {betaHeaders.length === 0 ? 'Select features' : `${betaHeaders.length} selected`}
                    </span>
                    <span className="text-xs">▼</span>
                  </button>
                  {betaOpen && (
                    <div className="border-t border-neutral-200 dark:border-neutral-800 max-h-48 overflow-y-auto">
                      {betaHeaderOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={betaHeaders.includes(option)}
                            onCheckedChange={() => handleBetaHeaderToggle(option)}
                            className="border-neutral-300 dark:border-neutral-700"
                          />
                          <span className="text-neutral-700 dark:text-neutral-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {betaHeaders.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {betaHeaders.map((header) => (
                      <Badge
                        key={header}
                        variant="outline"
                        className="h-5 text-xs border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                      >
                        {header}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Web Search Configuration */}
            <WebSearchConfig
              agentData={agentData}
              onFieldChange={onFieldChange}
              provider={provider}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default memo(AgentModelSettings);

