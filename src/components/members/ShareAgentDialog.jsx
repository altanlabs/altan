import { useTheme } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import { cn } from '../../lib/utils';
import Iconify from '../iconify';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

export default function ShareAgentDialog({ open, onClose, agent }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const theme = useTheme();

  // Build the shareable link - the agent DM room chat interface
  const shareLink = `${window.location.origin}/agent/${agent.id}/share`;

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        // Silently fail
      });
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: 'ic:baseline-whatsapp',
      color: '#25D366',
      onClick: () => {
        const text = encodeURIComponent(`Check out this AI agent: ${agent.name}\n${shareLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      },
    },
    {
      name: 'Twitter',
      icon: 'ri:twitter-x-fill',
      color: '#000000',
      onClick: () => {
        const text = encodeURIComponent(`Check out this AI agent: ${agent.name}`);
        window.open(
          `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareLink)}`,
          '_blank',
        );
      },
    },
    {
      name: 'Facebook',
      icon: 'ic:baseline-facebook',
      color: '#1877F2',
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
          '_blank',
        );
      },
    },
    {
      name: 'LinkedIn',
      icon: 'mdi:linkedin',
      color: '#0A66C2',
      onClick: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
          '_blank',
        );
      },
    },
    {
      name: 'Telegram',
      icon: 'ic:baseline-telegram',
      color: '#0088cc',
      onClick: () => {
        const text = encodeURIComponent(`Check out this AI agent: ${agent.name}`);
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${text}`,
          '_blank',
        );
      },
    },
    {
      name: 'Email',
      icon: 'ic:baseline-email',
      color: '#EA4335',
      onClick: () => {
        const subject = encodeURIComponent(`Check out this AI agent: ${agent.name}`);
        const body = encodeURIComponent(
          `I found this amazing AI agent and thought you might be interested:\n\n${shareLink}`,
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
              }}
            >
              <Iconify
                icon="eva:share-outline"
                className="w-5 h-5"
                style={{ color: theme.palette.primary.main }}
              />
            </div>
            <div>
              <DialogTitle>Share &quot;{agent.name}&quot;</DialogTitle>
              <DialogDescription>Share this agent with others via link or social media</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Link Box */}
        <div className="space-y-3">
          <div
            className={cn(
              'flex items-center gap-2 p-2.5 rounded-lg transition-all duration-200',
              copySuccess && 'ring-2 ring-green-500',
            )}
            style={{
              background:
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 bg-transparent text-xs outline-none select-all"
              style={{ color: theme.palette.text.primary }}
            />
            <AnimatePresence mode="wait">
              {copySuccess ? (
                <m.div
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10"
                >
                  <Iconify
                    icon="eva:checkmark-circle-2-fill"
                    className="w-3.5 h-3.5 text-green-500"
                  />
                  <span className="text-xs font-medium text-green-500">Copied</span>
                </m.div>
              ) : (
                <m.button
                  key="copy"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:opacity-80"
                  style={{
                    background:
                      theme.palette.mode === 'dark'
                        ? 'rgba(139, 92, 246, 0.15)'
                        : 'rgba(139, 92, 246, 0.1)',
                    color: theme.palette.primary.main,
                  }}
                  title="Copy link"
                >
                  <Iconify
                    icon="eva:copy-outline"
                    className="w-3.5 h-3.5"
                  />
                  <span className="text-xs font-medium">Copy</span>
                </m.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-6 gap-2">
          {shareOptions.map((option, index) => (
            <m.button
              key={option.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={option.onClick}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.03)',
                border: `1px solid ${theme.palette.divider}`,
              }}
              title={`Share via ${option.name}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `${option.color}15`,
                }}
              >
                <Iconify
                  icon={option.icon}
                  className="w-4 h-4"
                  style={{ color: option.color }}
                />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: theme.palette.text.secondary }}
              >
                {option.name}
              </span>
            </m.button>
          ))}
        </div>

        {/* Footer Note */}
        <div
          className="text-center text-[11px] py-2 px-3 rounded-md"
          style={{
            color: theme.palette.text.secondary,
            background:
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <Iconify
            icon="eva:info-outline"
            className="w-3.5 h-3.5 inline mr-1 opacity-60"
          />
          Anyone with this link can chat with your agent
        </div>
      </DialogContent>
    </Dialog>
  );
}
