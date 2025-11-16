import { Icon } from '@iconify/react';
import { memo } from 'react';

import { analytics } from '../../lib/analytics';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

// Contact options configuration
const CONTACT_OPTIONS = [
  {
    icon: 'ri:discord-fill',
    title: 'Discord Community',
    description: 'Join our Discord community',
    href: 'https://discord.com/invite/2zPbKuukgx',
    iconColor: '#5865f2',
    variant: 'outline',
  },
  {
    icon: 'mdi:book-open-page-variant',
    title: 'Docs & Guides',
    description: 'Browse our documentation and guides',
    href: 'https://docs.altan.ai',
    iconColor: '#ff9800',
    variant: 'outline',
  },
  {
    icon: 'mdi:calendar-clock',
    title: 'Book a Call',
    description: 'Schedule a free strategy call with our founder',
    href: 'https://calendar.app.google/WAMez8wYG6sHXQRD9',
    iconColor: '#2196f3',
    variant: 'outline',
  },
];

/**
 * ContactOptionsDialog - Shows contact options (Discord, Docs, Book a Call)
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onClose - Callback when dialog is closed
 * @param {string} title - Dialog title
 * @param {string} description - Dialog description
 * @param {boolean} callOnly - If true, only show the "Book a Call" option
 * @param {string} source - Analytics source for tracking where the dialog was opened from
 */
const ContactOptionsDialog = memo(
  ({
    open,
    onClose,
    title = 'Need help?',
    description = "Choose how you'd like to get support",
    callOnly = false,
    source = 'unknown',
  }) => {
    const handleOptionClick = (option) => {
      // Track which contact option was clicked
      analytics.track('contact_option_clicked', {
        option: option.title,
        source,
        href: option.href,
      });

      // Open in new tab
      window.open(option.href, '_blank', 'noopener,noreferrer');
    };

    const options = callOnly ? [CONTACT_OPTIONS[2]] : CONTACT_OPTIONS;

    return (
      <Dialog
        open={open}
        onOpenChange={onClose}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-[#b0b0b0]">{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {options.map((option) => (
              <Button
                key={option.title}
                variant={option.variant}
                onClick={() => handleOptionClick(option)}
                className={cn(
                  'w-full justify-start h-auto py-4 px-4 rounded-xl',
                  option.variant === 'default'
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'border-[#444] hover:border-[#666] hover:bg-white/5',
                )}
              >
                <div className="flex items-start gap-3 w-full">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${option.iconColor}20` }}
                  >
                    <Icon
                      icon={option.icon}
                      className="w-5 h-5"
                      style={{ color: option.iconColor }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div
                      className={cn(
                        'font-semibold text-sm mb-0.5',
                        option.variant === 'default' ? 'text-black' : 'text-white',
                      )}
                    >
                      {option.title}
                    </div>
                    <div
                      className={cn(
                        'text-xs',
                        option.variant === 'default' ? 'text-gray-600' : 'text-[#888]',
                      )}
                    >
                      {option.description}
                    </div>
                  </div>
                  <Icon
                    icon="mdi:chevron-right"
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      option.variant === 'default' ? 'text-gray-400' : 'text-[#666]',
                    )}
                  />
                </div>
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={onClose}
            className="mt-2 text-[#888] hover:text-[#b0b0b0] hover:bg-transparent"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  },
);

ContactOptionsDialog.displayName = 'ContactOptionsDialog';

export default ContactOptionsDialog;
