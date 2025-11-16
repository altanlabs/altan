/* eslint-disable react/prop-types */
import { Copy, Check, Settings, Info } from 'lucide-react';
import { memo, useState, useMemo, useCallback } from 'react';

import { useAuthContext } from '../../auth/useAuthContext';
import { useToast } from '../../hooks/use-toast';
import { selectMe } from '../../redux/slices/room/selectors/memberSelectors';
import { selectRoom } from '../../redux/slices/room/selectors/roomSelectors';
import { updateRoom } from '../../redux/slices/room/thunks/roomThunks';
import { dispatch, useSelector } from '../../redux/store';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

// ============================================================================
// Types
// ============================================================================

interface Room {
  id: string;
  name?: string;
  description?: string;
  account_id?: string | null;
  policy?: {
    privacy?: 'private' | 'account' | 'public';
    default_role?: 'owner' | 'admin' | 'member' | 'listener' | 'viewer';
    max_members?: number;
    agent_interaction?: 'mention_only' | 'agents_only' | 'always';
    memory_enabled?: boolean;
    cagi_enabled?: boolean;
    voice_enabled?: boolean;
    agent_timeout?: number;
    requirements?: {
      data: string[];
    };
  };
}

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  description: string;
  'policy.privacy': 'private' | 'account' | 'public';
  'policy.default_role': 'owner' | 'admin' | 'member' | 'listener' | 'viewer';
  'policy.max_members': number;
  'policy.agent_interaction': 'mention_only' | 'agents_only' | 'always';
  'policy.memory_enabled': boolean;
  'policy.cagi_enabled': boolean;
  'policy.voice_enabled': boolean;
  'policy.agent_timeout': number;
  'policy.requirements': string[];
}

interface CopyableIdProps {
  label: string;
  value: string;
}

// ============================================================================
// Configuration
// ============================================================================

const PRIVACY_OPTIONS = [
  { label: 'Private', value: 'private' },
  { label: 'Account', value: 'account' },
  { label: 'Public', value: 'public' },
];

const ROLE_OPTIONS = [
  { label: 'Owner', value: 'owner' },
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
  { label: 'Listener', value: 'listener' },
  { label: 'Viewer', value: 'viewer' },
];

const AGENT_OPTIONS = [
  { label: 'Mention Only', value: 'mention_only' },
  { label: 'When Alone', value: 'agents_only' },
  { label: 'Always', value: 'always' },
];

// ============================================================================
// Reusable Components
// ============================================================================

const CopyableId = memo<CopyableIdProps>(({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
    });
  };

  const truncate = (id: string): string => {
    if (id.length <= 16) return id;
    return `${id.slice(0, 8)}...${id.slice(-6)}`;
  };

  return (
    <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</p>
        <code className="text-xs font-mono text-neutral-900 dark:text-neutral-100">
          {truncate(value)}
        </code>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 h-6 w-6 p-0"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
});

CopyableId.displayName = 'CopyableId';

// ============================================================================
// Business Logic Hook
// ============================================================================

const useSettingsForm = (room: Room | null, onClose: () => void): {
  formState: FormState;
  loading: boolean;
  handleChange: (key: keyof FormState, value: string | number | boolean | string[]) => void;
  handleSave: () => Promise<void>;
} => {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    name: room?.name || '',
    description: room?.description || '',
    'policy.privacy': room?.policy?.privacy || 'public',
    'policy.default_role': room?.policy?.default_role || 'member',
    'policy.max_members': room?.policy?.max_members ?? -1,
    'policy.agent_interaction': room?.policy?.agent_interaction || 'mention_only',
    'policy.memory_enabled': room?.policy?.memory_enabled ?? true,
    'policy.cagi_enabled': room?.policy?.cagi_enabled ?? false,
    'policy.voice_enabled': room?.policy?.voice_enabled ?? false,
    'policy.agent_timeout': room?.policy?.agent_timeout ?? 1,
    'policy.requirements': room?.policy?.requirements?.data || [],
  });

  const handleChange = useCallback((key: keyof FormState, value: string | number | boolean | string[]): void => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    setLoading(true);

    const payload = {
      name: formState.name,
      description: formState.description,
      policy: {
        privacy: formState['policy.privacy'],
        default_role: formState['policy.default_role'],
        agent_interaction: formState['policy.agent_interaction'],
        memory_enabled: formState['policy.memory_enabled'],
        cagi_enabled: formState['policy.cagi_enabled'],
        max_members: formState['policy.max_members'],
        voice_enabled: formState['policy.voice_enabled'],
        agent_timeout: formState['policy.agent_timeout'],
        requirements: { data: formState['policy.requirements'] },
      },
    };

    try {
      await dispatch(updateRoom(payload));
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Update failed', err);
    } finally {
      setLoading(false);
    }
  }, [formState, onClose]);

  return {
    formState,
    loading,
    handleChange,
    handleSave,
  };
};

// ============================================================================
// Main Component
// ============================================================================

const SettingsDialog = memo<SettingsDialogProps>(({ open, onClose }) => {
  const room = useSelector(selectRoom);
  const me = useSelector(selectMe);
  const { user } = useAuthContext();

  const isViewer = useMemo(
    () => me?.role ? (['viewer', 'listener'] as string[]).includes(me.role as string) : false,
    [me],
  );

  const { formState, loading, handleChange, handleSave } = useSettingsForm(room, onClose);

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0 max-h-[85vh] flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-900">
              <Settings className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                Room Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure room details and policies
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {!isViewer ? (
            <div className="space-y-4">
              {/* Room Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                  Details
                </h3>
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Name
                    </Label>
                    <Input
                      value={formState.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Room name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Description
                    </Label>
                    <Textarea
                      value={formState.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="min-h-[60px] text-sm resize-none"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              {/* Policies */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                  Policies
                </h3>
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Privacy
                    </Label>
                    <Select
                      value={formState['policy.privacy']}
                      onValueChange={(value) => handleChange('policy.privacy', value as FormState['policy.privacy'])}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10002]">
                        {PRIVACY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Default Role
                    </Label>
                    <Select
                      value={formState['policy.default_role']}
                      onValueChange={(value) => handleChange('policy.default_role', value as FormState['policy.default_role'])}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10002]">
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Agent Interaction
                    </Label>
                    <Select
                      value={formState['policy.agent_interaction']}
                      onValueChange={(value) => handleChange('policy.agent_interaction', value as FormState['policy.agent_interaction'])}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[10002]">
                        {AGENT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-sm">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Agent Timeout (seconds)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={formState['policy.agent_timeout']}
                      onChange={(e) => handleChange('policy.agent_timeout', parseFloat(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                  Features
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100 cursor-pointer">
                        Memory
                      </Label>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <Info className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px] text-xs z-[10003]">
                            Enable agent memory to retain context across conversations
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      checked={formState['policy.memory_enabled']}
                      onCheckedChange={(checked) => handleChange('policy.memory_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100 cursor-pointer">
                        CAGI
                      </Label>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <Info className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px] text-xs z-[10003]">
                            Enable CAGI (Collective AGI) for multi-agent collaboration
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      checked={formState['policy.cagi_enabled']}
                      onCheckedChange={(checked) => handleChange('policy.cagi_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100 cursor-pointer">
                        Voice
                      </Label>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <Info className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px] text-xs z-[10003]">
                            Enable voice interactions and speech-to-text capabilities
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Switch
                      checked={formState['policy.voice_enabled']}
                      onCheckedChange={(checked) => handleChange('policy.voice_enabled', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Super User - Account ID */}
              {user?.xsup && room?.account_id && (
                <>
                  <Separator className="bg-neutral-200 dark:bg-neutral-800" />
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                      Technical
                    </h3>
                    <CopyableId label="Account ID" value={room.account_id || ''} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                You don&apos;t have permission to modify room settings
              </p>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        {!isViewer && (
          <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 shrink-0">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="h-8 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={loading}
                className="h-8 text-sm min-w-[90px]"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

SettingsDialog.displayName = 'SettingsDialog';

export default SettingsDialog;
