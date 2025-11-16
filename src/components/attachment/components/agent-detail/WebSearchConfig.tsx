import { memo, useState } from 'react';
import {
  Search,
  Globe,
  MapPin,
  Clock,
  Map,
  Earth,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Crosshair,
  Link,
  History,
  Info,
  CheckCircle2,
  Ban,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Types
interface WebSearchFilters {
  allowed_domains?: string[];
  blocked_domains?: string[];
}

interface UserLocation {
  type?: 'approximate';
  city?: string;
  region?: string;
  country?: string;
  timezone?: string;
}

interface WebSearchConfig {
  enabled?: boolean;
  search_context_size?: 'low' | 'medium' | 'high';
  max_searches?: number;
  include_sources?: boolean;
  include_actions?: boolean;
  filters?: WebSearchFilters;
  user_location?: UserLocation;
}

interface AgentData {
  id: string;
  llm_config?: {
    settings?: {
      web_search?: WebSearchConfig;
    };
  };
  [key: string]: any;
}

interface WebSearchConfigProps {
  agentData: AgentData;
  onFieldChange: (field: string, value: any) => void;
  provider?: string;
}

interface Preset {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  config: WebSearchConfig;
}

interface Country {
  code: string;
  label: string;
}

// Constants
const COUNTRIES: Country[] = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'CN', label: 'China' },
  { code: 'IN', label: 'India' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
  { code: 'FI', label: 'Finland' },
  { code: 'PL', label: 'Poland' },
  { code: 'RU', label: 'Russia' },
  { code: 'KR', label: 'South Korea' },
  { code: 'SG', label: 'Singapore' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'AT', label: 'Austria' },
  { code: 'BE', label: 'Belgium' },
  { code: 'IE', label: 'Ireland' },
  { code: 'PT', label: 'Portugal' },
  { code: 'GR', label: 'Greece' },
  { code: 'CZ', label: 'Czech Republic' },
].sort((a, b) => a.label.localeCompare(b.label));

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Helsinki',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
].sort();

const WEB_SEARCH_PRESETS: Record<string, Preset> = {
  disabled: {
    name: 'Disabled',
    icon: Ban,
    config: { enabled: false },
  },
  basic: {
    name: 'Basic',
    icon: Globe,
    config: {
      enabled: true,
      search_context_size: 'low',
      max_searches: 3,
      include_sources: true,
      include_actions: false,
    },
  },
  standard: {
    name: 'Standard',
    icon: Search,
    config: {
      enabled: true,
      search_context_size: 'medium',
      max_searches: 5,
      include_sources: true,
      include_actions: true,
    },
  },
  advanced: {
    name: 'Advanced',
    icon: Filter,
    config: {
      enabled: true,
      search_context_size: 'high',
      max_searches: 10,
      include_sources: true,
      include_actions: true,
    },
  },
  research: {
    name: 'Research',
    icon: Info,
    config: {
      enabled: true,
      search_context_size: 'high',
      max_searches: 15,
      include_sources: true,
      include_actions: true,
    },
  },
};

const WebSearchConfigComponent = ({
  agentData,
  onFieldChange,
  provider,
}: WebSearchConfigProps) => {
  const [webSearchExpanded, setWebSearchExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newAllowedDomain, setNewAllowedDomain] = useState('');
  const [newBlockedDomain, setNewBlockedDomain] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<UserLocation | null>(null);

  // Web search config
  const webSearchConfig = agentData?.llm_config?.settings?.web_search || {};
  const webSearchEnabled = webSearchConfig?.enabled ?? false;
  const searchContextSize = webSearchConfig?.search_context_size || 'medium';
  const maxSearches = webSearchConfig?.max_searches ?? 5;
  const includeSources = webSearchConfig?.include_sources ?? true;
  const includeActions = webSearchConfig?.include_actions ?? false;
  const allowedDomains = webSearchConfig?.filters?.allowed_domains || [];
  const blockedDomains = webSearchConfig?.filters?.blocked_domains || [];
  const userLocation = webSearchConfig?.user_location || {};

  const handleWebSearchChange = (updates: Partial<WebSearchConfig>) => {
    const currentWebSearch = agentData?.llm_config?.settings?.web_search || {};
    onFieldChange('llm_config', {
      ...agentData.llm_config,
      settings: {
        ...agentData.llm_config?.settings,
        web_search: {
          ...currentWebSearch,
          ...updates,
        },
      },
    });
  };

  const handlePresetChange = (presetKey: string) => {
    const preset = WEB_SEARCH_PRESETS[presetKey];
    handleWebSearchChange(preset.config);
  };

  const handleAddAllowedDomain = () => {
    if (newAllowedDomain.trim()) {
      const currentFilters = webSearchConfig?.filters || {};
      handleWebSearchChange({
        filters: {
          ...currentFilters,
          allowed_domains: [...(currentFilters.allowed_domains || []), newAllowedDomain.trim()],
        },
      });
      setNewAllowedDomain('');
    }
  };

  const handleRemoveAllowedDomain = (domain: string) => {
    const currentFilters = webSearchConfig?.filters || {};
    handleWebSearchChange({
      filters: {
        ...currentFilters,
        allowed_domains: (currentFilters.allowed_domains || []).filter((d) => d !== domain),
      },
    });
  };

  const handleAddBlockedDomain = () => {
    if (newBlockedDomain.trim()) {
      const currentFilters = webSearchConfig?.filters || {};
      handleWebSearchChange({
        filters: {
          ...currentFilters,
          blocked_domains: [...(currentFilters.blocked_domains || []), newBlockedDomain.trim()],
        },
      });
      setNewBlockedDomain('');
    }
  };

  const handleRemoveBlockedDomain = (domain: string) => {
    const currentFilters = webSearchConfig?.filters || {};
    handleWebSearchChange({
      filters: {
        ...currentFilters,
        blocked_domains: (currentFilters.blocked_domains || []).filter((d) => d !== domain),
      },
    });
  };

  const handleLocationChange = (field: keyof UserLocation, value: string) => {
    const currentLocation = webSearchConfig?.user_location || {};
    handleWebSearchChange({
      user_location: {
        ...currentLocation,
        type: 'approximate',
        [field]: value || undefined,
      },
    });
  };

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);

    try {
      const response = await fetch('https://ipapi.co/json/');

      if (!response.ok) {
        throw new Error('Failed to detect location');
      }

      const data = await response.json();

      const detectedLoc: UserLocation = {
        city: data.city,
        region: data.region,
        country: data.country_code,
        timezone: data.timezone,
      };

      setDetectedLocation(detectedLoc);

      handleWebSearchChange({
        user_location: {
          type: 'approximate',
          city: data.city,
          region: data.region,
          country: data.country_code,
          timezone: data.timezone,
        },
      });
    } catch (error) {
      console.error('Location detection error:', error);
      setLocationError('Failed to detect location. Please enter manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleClearLocation = () => {
    handleWebSearchChange({
      user_location: undefined,
    });
    setDetectedLocation(null);
    setLocationError(null);
  };

  const getCurrentPreset = (): string => {
    for (const [key, preset] of Object.entries(WEB_SEARCH_PRESETS)) {
      const config = preset.config;
      if (
        config.enabled === webSearchEnabled &&
        (!webSearchEnabled ||
          (config.search_context_size === searchContextSize &&
            config.max_searches === maxSearches &&
            config.include_sources === includeSources &&
            config.include_actions === includeActions))
      ) {
        return key;
      }
    }
    return 'custom';
  };

  const currentPreset = getCurrentPreset();
  const advancedOptionsCount =
    allowedDomains.length + blockedDomains.length + (userLocation.city ? 1 : 0);

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search
              className={cn(
                'h-4 w-4',
                webSearchEnabled ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'
              )}
            />
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Web Search
            </span>
            {webSearchEnabled && (
              <Badge
                variant="outline"
                className="h-5 text-[10px] border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900"
              >
                {currentPreset !== 'custom'
                  ? WEB_SEARCH_PRESETS[currentPreset].name
                  : 'Custom'}
              </Badge>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Switch
                  checked={webSearchEnabled}
                  onCheckedChange={(checked) => handleWebSearchChange({ enabled: checked })}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {webSearchEnabled ? 'Disable web search' : 'Enable web search'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(WEB_SEARCH_PRESETS).map(([key, preset]) => {
            const Icon = preset.icon;
            const isActive = currentPreset === key;
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handlePresetChange(key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                      isActive
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {preset.name}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {preset.config.enabled
                    ? `${preset.config.max_searches} searches, ${preset.config.search_context_size} context`
                    : 'Disabled'}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {webSearchEnabled && (
          <div className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 space-y-3">
            {/* Provider Settings */}
            <div className="grid grid-cols-2 gap-3">
              {/* Context Size */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                    Context Size
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-neutral-400" />
                    </TooltipTrigger>
                    <TooltipContent>Amount of web content to retrieve</TooltipContent>
                  </Tooltip>
                  {provider?.toLowerCase() === 'openai' && (
                    <Badge className="h-4 text-[9px] px-1.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-0">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleWebSearchChange({ search_context_size: size })}
                      className={cn(
                        'flex-1 px-2 py-1.5 rounded-md text-[11px] font-medium capitalize transition-colors',
                        searchContextSize === size
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Searches */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                    Max Searches
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-neutral-400" />
                    </TooltipTrigger>
                    <TooltipContent>Maximum number of search queries</TooltipContent>
                  </Tooltip>
                  {provider?.toLowerCase() === 'anthropic' && (
                    <Badge className="h-4 text-[9px] px-1.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-0">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="px-2">
                  <Slider
                    value={[maxSearches]}
                    onValueChange={([val]) => handleWebSearchChange({ max_searches: val })}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-neutral-500">1</span>
                    <span className="text-[11px] font-mono text-neutral-900 dark:text-neutral-100">
                      {maxSearches}
                    </span>
                    <span className="text-[10px] text-neutral-500">20</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Response Options */}
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                Response Options
              </Label>
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="include-sources"
                        checked={includeSources}
                        onCheckedChange={(checked) =>
                          handleWebSearchChange({ include_sources: !!checked })
                        }
                      />
                      <Label
                        htmlFor="include-sources"
                        className="text-xs font-normal text-neutral-700 dark:text-neutral-300 cursor-pointer flex items-center gap-1.5"
                      >
                        <Link className="h-3 w-3" />
                        Include sources
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Include citation links in responses</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="show-actions"
                        checked={includeActions}
                        onCheckedChange={(checked) =>
                          handleWebSearchChange({ include_actions: !!checked })
                        }
                      />
                      <Label
                        htmlFor="show-actions"
                        className="text-xs font-normal text-neutral-700 dark:text-neutral-300 cursor-pointer flex items-center gap-1.5"
                      >
                        <History className="h-3 w-3" />
                        Show actions
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Show search actions performed by agent</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWebSearchExpanded(!webSearchExpanded)}
                className="w-full justify-between h-8 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <span className="flex items-center gap-1.5">
                  {webSearchExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  Advanced Options
                </span>
                {advancedOptionsCount > 0 && (
                  <Badge className="h-4 text-[9px] px-1.5 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 border-0">
                    {advancedOptionsCount}
                  </Badge>
                )}
              </Button>

              {webSearchExpanded && (
                <div className="mt-3 p-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
                  {/* Location Context */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          className={cn(
                            'h-3 w-3',
                            detectedLocation
                              ? 'text-neutral-900 dark:text-neutral-100'
                              : 'text-neutral-500'
                          )}
                        />
                        <Label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                          User Location
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-neutral-400" />
                          </TooltipTrigger>
                          <TooltipContent>Provide location context for localized results</TooltipContent>
                        </Tooltip>
                        {detectedLocation && (
                          <Badge className="h-4 text-[9px] px-1.5 bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 border-0">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                            Auto-detected
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleAutoDetectLocation}
                              disabled={detectingLocation}
                              className="h-7 w-7 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                              {detectingLocation ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Crosshair className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Auto-detect from IP</TooltipContent>
                        </Tooltip>
                        {(userLocation.city || userLocation.region || userLocation.country) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClearLocation}
                                className="h-7 w-7 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clear location</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    {locationError && (
                      <Alert variant="destructive" className="py-2 text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        <AlertDescription>{locationError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="relative">
                          <Globe className="absolute left-2.5 top-2.5 h-3 w-3 text-neutral-400" />
                          <Input
                            placeholder="City"
                            value={userLocation.city || ''}
                            onChange={(e) => handleLocationChange('city', e.target.value)}
                            className="h-8 pl-8 text-xs"
                            list="cities"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="relative">
                          <Map className="absolute left-2.5 top-2.5 h-3 w-3 text-neutral-400" />
                          <Input
                            placeholder="Region/State"
                            value={userLocation.region || ''}
                            onChange={(e) => handleLocationChange('region', e.target.value)}
                            className="h-8 pl-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="relative">
                          <Earth className="absolute left-2.5 top-2.5 h-3 w-3 text-neutral-400" />
                          <Input
                            placeholder="Country (e.g., US)"
                            value={userLocation.country || ''}
                            onChange={(e) => handleLocationChange('country', e.target.value.toUpperCase())}
                            className="h-8 pl-8 text-xs font-mono"
                            maxLength={3}
                            list="countries"
                          />
                          <datalist id="countries">
                            {COUNTRIES.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.label}
                              </option>
                            ))}
                          </datalist>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-2.5 h-3 w-3 text-neutral-400" />
                          <Input
                            placeholder="Timezone"
                            value={userLocation.timezone || ''}
                            onChange={(e) => handleLocationChange('timezone', e.target.value)}
                            className="h-8 pl-8 text-xs"
                            list="timezones"
                          />
                          <datalist id="timezones">
                            {TIMEZONES.map((tz) => (
                              <option key={tz} value={tz} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Domain Filters */}
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="w-full justify-start h-7 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    >
                      <Filter className="h-3 w-3 mr-1.5" />
                      Domain Filters
                    </Button>

                    {showFilters && (
                      <div className="space-y-3">
                        {/* Allowed Domains */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                            <Label className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                              Allowed Domains
                            </Label>
                          </div>
                          <div className="flex gap-1.5">
                            <div className="relative flex-1">
                              <Globe className="absolute left-2.5 top-2.5 h-3 w-3 text-neutral-400" />
                              <Input
                                placeholder="e.g., wikipedia.org"
                                value={newAllowedDomain}
                                onChange={(e) => setNewAllowedDomain(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddAllowedDomain()}
                                className="h-8 pl-8 text-xs"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleAddAllowedDomain}
                              className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          {allowedDomains.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {allowedDomains.map((domain) => (
                                <Badge
                                  key={domain}
                                  variant="outline"
                                  className="h-6 text-[10px] font-mono bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                >
                                  {domain}
                                  <button
                                    onClick={() => handleRemoveAllowedDomain(domain)}
                                    className="ml-1.5 hover:text-neutral-900 dark:hover:text-neutral-100"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Blocked Domains */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1">
                            <Ban className="h-3 w-3 text-neutral-600 dark:text-neutral-400" />
                            <Label className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                              Blocked Domains
                            </Label>
                          </div>
                          <div className="flex gap-1.5">
                            <div className="relative flex-1">
                              <Globe className="absolute left-2.5 top-2.5 h-3 w-3 text-neutral-400" />
                              <Input
                                placeholder="e.g., example.com"
                                value={newBlockedDomain}
                                onChange={(e) => setNewBlockedDomain(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddBlockedDomain()}
                                className="h-8 pl-8 text-xs"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleAddBlockedDomain}
                              className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          {blockedDomains.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {blockedDomains.map((domain) => (
                                <Badge
                                  key={domain}
                                  variant="outline"
                                  className="h-6 text-[10px] font-mono bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                >
                                  {domain}
                                  <button
                                    onClick={() => handleRemoveBlockedDomain(domain)}
                                    className="ml-1.5 hover:text-neutral-900 dark:hover:text-neutral-100"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default memo(WebSearchConfigComponent);

