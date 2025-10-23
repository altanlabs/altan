import React, { memo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useHistory } from 'react-router-dom';

const RadialLauncher = ({ isOpen, onClose }) => {
  const history = useHistory();

  const modules = [
    {
      id: 'agents',
      label: 'Agents',
      icon: '🧠',
      color: 'from-purple-500 to-purple-600',
      action: () => {
        history.push('/agents');
        onClose();
      },
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: '🧩',
      color: 'from-blue-500 to-blue-600',
      action: () => {
        history.push('/v2');
        onClose();
      },
    },
    {
      id: 'flows',
      label: 'Flows',
      icon: '🔁',
      color: 'from-yellow-500 to-yellow-600',
      action: () => {
        history.push('/flows');
        onClose();
      },
    },
    {
      id: 'database',
      label: 'Data',
      icon: '🗄️',
      color: 'from-blue-400 to-blue-500',
      action: () => {
        history.push('/database');
        onClose();
      },
    },
    {
      id: 'interfaces',
      label: 'Forms',
      icon: '🧾',
      color: 'from-green-500 to-green-600',
      action: () => {
        history.push('/interfaces');
        onClose();
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      color: 'from-gray-500 to-gray-600',
      action: () => {
        history.push('/account/settings');
        onClose();
      },
    },
  ];

  // Calculate radial positions
  const radius = 120;
  const angleStep = (2 * Math.PI) / modules.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Radial Menu */}
          <div className="fixed top-20 left-12 z-[1000]">
            {modules.map((module, index) => {
              const angle = angleStep * index - Math.PI / 2; // Start from top
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <m.button
                  key={module.id}
                  className={`absolute w-20 h-20 rounded-2xl bg-gradient-to-br ${module.color} shadow-2xl flex flex-col items-center justify-center text-white backdrop-blur-md border border-white/20 hover:scale-110 transition-transform`}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x, y }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                  onClick={module.action}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-3xl mb-1">{module.icon}</span>
                  <span className="text-xs font-medium">{module.label}</span>
                </m.button>
              );
            })}

            {/* Center close button */}
            <m.button
              className="absolute w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 -translate-x-8 -translate-y-8"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </m.button>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default memo(RadialLauncher);

