import React, { memo } from 'react';
import { m } from 'framer-motion';
import { useHistory, useLocation } from 'react-router-dom';

const LeftSidebarWidgets = () => {
  const history = useHistory();
  const location = useLocation();

  const shortcuts = [
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      action: () => history.push('/v2'),
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      action: () => history.push('/v2/rooms'),
      isActive: location.pathname === '/v2/rooms',
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      action: () => history.push('/agents'),
    },
    {
      id: 'flows',
      label: 'Flows',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      action: () => history.push('/flows'),
    },
    {
      id: 'database',
      label: 'Database',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      action: () => history.push('/database'),
    },
  ];

  return (
    <div className="fixed left-6 top-24 bottom-32 flex flex-col gap-3 z-30 w-16">
      <div className="flex flex-col gap-3">
        {shortcuts.map((shortcut, index) => (
          <m.button
            key={shortcut.id}
            onClick={shortcut.action}
            className={`w-16 h-16 backdrop-blur-md border rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center group ${
              shortcut.isActive
                ? 'bg-blue-500/20 dark:bg-blue-400/20 border-blue-500/40 dark:border-blue-400/40'
                : 'bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={shortcut.label}
          >
            <div className={`transition-colors ${
              shortcut.isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
            }`}>
              {shortcut.icon}
            </div>
          </m.button>
        ))}
      </div>
    </div>
  );
};

export default memo(LeftSidebarWidgets);

