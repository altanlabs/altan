import { IconButton, Tooltip } from '@mui/material';
import { m } from 'framer-motion';
import { Key, Globe, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export const DataApiConfiguration = ({ metrics }) => {
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
      // Silent error handling
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
        <Icon size={16} className="text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 relative">
          <input
            type="text"
            value={showValue !== undefined ? (showValue ? value : maskKey(value)) : value}
            readOnly
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-mono"
          />
        </div>
        <div className="flex gap-1">
          {onToggleShow && (
            <Tooltip title={showValue ? 'Hide' : 'Show'}>
              <IconButton
                size="small"
                onClick={onToggleShow}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showValue ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={copiedField === fieldKey ? 'Copied!' : 'Copy'}>
            <IconButton
              size="small"
              onClick={() => handleCopy(value, fieldKey)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <Copy size={18} className={copiedField === fieldKey ? 'text-green-500' : ''} />
            </IconButton>
          </Tooltip>
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
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Key size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data API
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              API credentials and endpoints
            </p>
          </div>
        </div>

        {/* API Fields */}
        <div className="space-y-4">
          <ApiField
            label="Project URL"
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
        </div>

      </div>
    </m.div>
  );
};
