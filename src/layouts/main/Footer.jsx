import { Link as RouterLink } from 'react-router-dom';

import Iconify from '../../components/iconify';
import Logo from '../../components/logo';
import { PATH_PAGE } from '../../routes/paths';

// ----------------------------------------------------------------------

const _socials = [
  {
    name: 'LinkedIn',
    icon: 'eva:linkedin-fill',
    path: 'https://www.linkedin.com/company/altanlabs',
  },
  {
    name: 'X (Twitter)',
    icon: 'eva:twitter-fill',
    path: 'https://x.com/altanlabs',
  },
  {
    name: 'Instagram',
    icon: 'ant-design:instagram-filled',
    path: 'https://www.instagram.com/altanlabs/',
  },
  {
    name: 'Discord',
    icon: 'ic:baseline-discord',
    path: 'https://discord.com/invite/2zPbKuukgx',
  },
  {
    name: 'WhatsApp',
    icon: 'ic:baseline-whatsapp',
    path: 'https://chat.whatsapp.com/CQMTRev8J0PJgS7c4ol5I1?mode=ac_t',
  },
];

const LINKS = [
  {
    headline: 'Company',
    children: [
      { key: 'jobs', name: 'Jobs', href: 'https://jobs.altan.ai' },
      { key: 'enterprise', name: 'Enterprise', href: 'https://enterprise.altan.ai/' },
      { key: 'hire-partner', name: 'Hire a partner', href: 'https://partners.altan.ai/' },
      { key: 'become-partner', name: 'Become a partner', href: 'https://partners.altan.ai/' },
    ],
  },
  {
    headline: 'Product',
    children: [
      { key: 'pricing', name: 'Pricing', href: '/pricing' },
      { key: 'status', name: 'Status', href: 'https://uptime.altan.ai/' },
    ],
  },
  {
    headline: 'Resources',
    children: [
      { key: 'support', name: 'Support', href: '/support' },
      { key: 'blog', name: 'Blog', href: 'https://blog.altan.ai' },
      { key: 'docs', name: 'Docs', href: 'https://docs.altan.ai' },
    ],
  },
  {
    headline: 'Legal',
    children: [
      { key: 'terms', name: 'Terms & Conditions', href: PATH_PAGE.terms },
      { key: 'privacy', name: 'Privacy Policy', href: PATH_PAGE.privacy },
    ],
  },
];

// ----------------------------------------------------------------------

export default function Footer() {
  const handleSocialClick = (path) => {
    window.open(path, '_blank', 'noopener noreferrer');
  };

  return (
    <footer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-center md:text-left">
          <div className="col-span-12 mb-6">
            <div className="mx-auto md:mx-0 w-fit">
              <Logo />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 md:pr-12 mb-8">
              Altan was founded in 2023 with the vision to create autonomous software.
            </p>

            <div className="flex gap-3 justify-center md:justify-start mb-8 md:mb-0">
              {_socials.map((social) => (
                <button
                  key={social.name}
                  onClick={() => handleSocialClick(social.path)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <Iconify icon={social.icon} className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {LINKS.map((list) => (
                <div
                  key={list.headline}
                  className="flex flex-col items-center md:items-start space-y-3"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    {list.headline}
                  </h3>

                  {list.children.map((link) => {
                    const isExternal = link.href.startsWith('http');

                    return isExternal ? (
                      <a
                        key={link.key}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <RouterLink
                        key={link.key}
                        to={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.name}
                      </RouterLink>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pb-8 text-center md:text-left">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()}. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
