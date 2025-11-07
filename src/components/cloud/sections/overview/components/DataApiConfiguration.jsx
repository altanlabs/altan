import { m } from 'framer-motion';
import { Key, Globe, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../../../ui/button.tsx';
import { Input } from '../../../../ui/input';

export const DataApiConfiguration = ({ metrics }) => {
  console.log('metrics', metrics);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const cloudUrl = metrics?.cloud_url || '';
  const anonKey = metrics?.anon_key || '';
  const serviceRoleKey = metrics?.service_role_key || '';

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  const maskKey = (key) => {
    if (!key) return '';
    if (key.length <= 20) return '•'.repeat(key.length);
    return `${key.slice(0, 10)}${'•'.repeat(key.length - 20)}${key.slice(-10)}`;
  };

  const ApiField = ({ label, value, icon: Icon, showValue, onToggleShow, fieldKey }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className="text-gray-500 dark:text-gray-400"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 relative">
          <Input
            type="text"
            value={showValue !== undefined ? (showValue ? value : maskKey(value)) : value}
            readOnly
            className="font-mono"
          />
        </div>
        <div className="flex gap-1">
          {onToggleShow && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleShow}
              title={showValue ? 'Hide' : 'Show'}
              className="h-8 w-8"
            >
              {showValue ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleCopy(value, fieldKey)}
            title={copiedField === fieldKey ? 'Copied!' : 'Copy'}
            className="h-8 w-8"
          >
            <Copy
              size={18}
              className={copiedField === fieldKey ? 'text-green-500' : ''}
            />
          </Button>
        </div>
      </div>
    </div>
  );

  if (!metrics?.cloud_url) {
    return null;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 to-background/20 backdrop-blur-sm p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <Key
              size={20}
              className="text-white"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data API</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              API credentials and endpoints
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <ApiField
            label="Cloud URL"
            value={cloudUrl}
            icon={Globe}
            fieldKey="url"
          />
          <ApiField
            label="Anon Key"
            value={anonKey}
            icon={Key}
            showValue={showAnonKey}
            onToggleShow={() => setShowAnonKey(!showAnonKey)}
            fieldKey="anon"
          />
          <ApiField
            label="Service Role Key"
            value={serviceRoleKey}
            icon={Key}
            showValue={showServiceKey}
            onToggleShow={() => setShowServiceKey(!showServiceKey)}
            fieldKey="service"
          />
          <ApiField
            label="Cloud Id"
            value={metrics?.cloud_id}
            icon={Key}
            fieldKey="cloud_id"
          />
        </div>
      </div>
    </m.div>
  );
};
