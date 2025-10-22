import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

const _socials = [
  {
    name: 'LinkedIn',
    icon: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
    path: 'https://www.linkedin.com/company/altanlabs',
  },
  {
    name: 'X (Twitter)',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    path: 'https://x.com/altanlabs',
  },
  {
    name: 'Instagram',
    icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z',
    path: 'https://www.instagram.com/altanlabs/',
  },
  {
    name: 'Discord',
    icon: 'M22 24l-5.25-5 .63 2H4.5A2.5 2.5 0 0 1 2 18.5v-15A2.5 2.5 0 0 1 4.5 1h15A2.5 2.5 0 0 1 22 3.5V24M12 6.8c-2.68 0-4.56 1.15-4.56 1.15 1.03-.92 2.83-1.45 2.83-1.45l-.17-.17c-1.69.03-3.22 1.2-3.22 1.2-1.72 3.59-1.61 6.69-1.61 6.69 1.4 1.81 3.48 1.68 3.48 1.68l.71-.9c-1.25-.27-2.04-1.38-2.04-1.38S9.3 14.9 12 14.9s4.58-1.28 4.58-1.28-.79 1.11-2.04 1.38l.71.9s2.08.13 3.48-1.68c0 0 .11-3.1-1.61-6.69 0 0-1.53-1.17-3.22-1.2l-.17.17s1.8.53 2.83 1.45c0 0-1.88-1.15-4.56-1.15m-2.07 3.79c.65 0 1.18.57 1.17 1.27 0 .69-.52 1.27-1.17 1.27-.64 0-1.16-.58-1.16-1.27 0-.7.51-1.27 1.16-1.27m4.17 0c.65 0 1.17.57 1.17 1.27 0 .69-.52 1.27-1.17 1.27-.64 0-1.16-.58-1.16-1.27 0-.7.51-1.27 1.16-1.27z',
    path: 'https://discord.com/invite/2zPbKuukgx',
  },
];

const footerLinks = [
  { name: 'Pricing', href: '/pricing', internal: true },
  { name: 'Docs', href: 'https://docs.altan.ai', internal: false },
  { name: 'Support', href: '/support', internal: true },
  { name: 'Status', href: 'https://uptime.altan.ai/', internal: false },
  { name: 'Blog', href: 'https://blog.altan.ai', internal: false },
];

const legalLinks = [
  { name: 'Terms', href: '/terms', internal: true },
  { name: 'Privacy', href: '/privacy', internal: true },
];

const V2CompactFooter = () => {
  const history = useHistory();

  const handleLinkClick = (link) => {
    if (link.internal) {
      history.push(link.href);
    } else {
      window.open(link.href, '_blank', 'noopener noreferrer');
    }
  };

  const handleSocialClick = (path) => {
    window.open(path, '_blank', 'noopener noreferrer');
  };

  return (
    <footer className="w-full bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="relative grid grid-cols-3 items-center gap-4">
          {/* Left: Social Icons & Copyright */}
          <div className="flex items-center gap-4 justify-start">
            <div className="flex items-center gap-2">
              {_socials.map((social) => (
                <button
                  key={social.name}
                  onClick={() => handleSocialClick(social.path)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                  aria-label={social.name}
                >
                  <svg 
                    className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d={social.icon} />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()}
            </p>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {footerLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Right: Legal Links */}
          <div className="flex items-center gap-4 justify-end">
            {legalLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(V2CompactFooter);

