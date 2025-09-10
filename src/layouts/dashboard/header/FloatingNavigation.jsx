import { useTheme } from '@mui/material/styles';
import { AnimatePresence, m } from 'framer-motion';
import { memo, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext';
import Iconify from '../../../components/iconify';
import useResponsive from '../../../hooks/useResponsive';

const FloatingNavigation = () => {
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const isDesktop = useResponsive('up', 'md');
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [recentSections, setRecentSections] = useState([]);

  // Load recent sections from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentNavigationSections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentSections(parsed);
      } catch {
        // Failed to parse recent sections from localStorage
      }
    }
  }, []);

  // Track route changes and add to recent sections
  useEffect(() => {
    // Define all available sections that can be added to recent
    const availableSections = {
      '/media': { label: 'Media', icon: 'material-symbols:perm-media-outline' },
      '/integration': { label: 'Integration', icon: 'material-symbols:integration-instructions-outline' },
      '/bases': { label: 'Databases', icon: 'material-symbols:database-outline' },
      '/settings': { label: 'Settings', icon: 'material-symbols:settings-outline' },
      '/usage': { label: 'Usage', icon: 'material-symbols:monitoring' },
    };

    // Get default navigation paths to exclude from recent sections
    const defaultNavPaths = ['/agents', '/flows', '/pricing', '/usage'];

    const currentPath = location.pathname;

    // Only track paths that are in availableSections and not in default nav
    if (availableSections[currentPath] && !defaultNavPaths.includes(currentPath)) {
      const sectionInfo = {
        path: currentPath,
        label: availableSections[currentPath].label,
        icon: availableSections[currentPath].icon,
        timestamp: Date.now(),
      };

      setRecentSections(prev => {
        // Remove if already exists
        const filtered = prev.filter(item => item.path !== currentPath);
        // Add to beginning
        const updated = [sectionInfo, ...filtered];
        // Keep only 3 most recent
        const limited = updated.slice(0, 3);

        // Save to localStorage
        localStorage.setItem('recentNavigationSections', JSON.stringify(limited));

        return limited;
      });
    }
  }, [location.pathname]);

  // Submenu configuration for home button
  const submenuItems = {
    build: [
      { path: '/', label: 'Projects', icon: 'material-symbols:folder-outline' },
      { path: '/agents', label: 'Agents', icon: 'fluent:bot-sparkle-20-filled' },
      { path: '/flows', label: 'Flows', icon: 'fluent:flash-flow-24-filled' },
      { path: '/bases', label: 'Databases', icon: 'material-symbols:database-outline' },
    ],
    utils: [
      { path: '/media', label: 'Media', icon: 'material-symbols:perm-media-outline' },
      { path: '/integration', label: 'Integration', icon: 'material-symbols:integration-instructions-outline' },
    ],
    workspace: isAuthenticated ? [
      { path: '/usage', label: 'Usage', icon: 'material-symbols:monitoring' },
      { path: '/account/settings?tab=team', label: 'Team', icon: 'fluent-mdl2:team-favorite' },
      { path: '/account/settings', label: 'Settings', icon: 'material-symbols:settings-outline' },
    ] : [],
  };

  // Navigation items configuration
  const baseNavigationItems = [
    // {
    //   path: '/chat',
    //   label: 'Chat',
    //   icon: (
    //     <Iconify
    //       icon="material-symbols:chat"
    //       className="w-[12px] h-[12px]"
    //     />
    //   ),
    // },
    {
      path: '/',
      label: 'Home',
      icon: (
        <Iconify
          icon="material-symbols:home"
          className="w-[12px] h-[12px]"
        />
      ),
      hasSubmenu: true,
    },
    {
      path: '/agents',
      label: 'Agents',
      icon: (
        <Iconify
          icon="fluent:bot-sparkle-20-filled"
          className="w-[12px] h-[12px]"
        />
      ),
    },
    {
      path: '/flows',
      label: 'Flows',
      icon: (
        <Iconify
          icon="fluent:flash-flow-24-filled"
          className="w-[12px] h-[12px]"
        />
      ),
    },
    // Conditionally show Usage or Pricing based on authentication
    isAuthenticated
      ? {
          path: '/usage',
          label: 'Usage',
          icon: (
            <Iconify
              icon="material-symbols:monitoring"
              className="w-[12px] h-[12px]"
            />
          ),
        }
      : {
          path: '/pricing',
          label: 'Pricing',
          icon: (
            <Iconify
              icon="material-symbols:payments"
              className="w-[12px] h-[12px]"
            />
          ),
        },
  ];

  // Combine base navigation with recent sections
  const navigationItems = [
    ...baseNavigationItems,
    // Add divider if there are recent sections
    ...(recentSections.length > 0 ? [{ isDivider: true }] : []),
    // Add recent sections
    ...recentSections.map(section => ({
      path: section.path,
      label: section.label,
      icon: (
        <Iconify
          icon={section.icon}
          className="w-[12px] h-[12px]"
        />
      ),
      isRecent: true,
    })),
  ];

  // Check if current path matches navigation item
  const isActivePath = (path) => {
    const currentPath = location.pathname;

    // Exact match
    if (currentPath === path) {
      return true;
    }

    // Special cases for singular/plural routes
    if (path === '/agents' && (currentPath.startsWith('/agent/') || currentPath === '/agent')) {
      return true;
    }

    if (path === '/flows' && (currentPath.startsWith('/flow/') || currentPath === '/flow')) {
      return true;
    }

    if (path === '/bases' && (currentPath.startsWith('/base/') || currentPath === '/base')) {
      return true;
    }

    // Default case: check if current path starts with the nav path + '/'
    // but exclude root path to avoid it matching everything
    if (path !== '/' && currentPath.startsWith(path + '/')) {
      return true;
    }

    return false;
  };

  // Get button styles based on active state, theme, and device type
  const getButtonStyles = (path, index) => {
    const isActive = isActivePath(path);
    const isLast = index === navigationItems.length - 1;

    if (isDesktop) {
      // Desktop styles (original floating design)
      let baseStyles =
        'group relative flex items-center justify-center h-8 w-10 leading-none transition-colors duration-100 ease-out my-1';

      // Add margins
      if (isLast) {
        baseStyles += ' ml-1 mr-1';
      } else {
        baseStyles += ' ml-1';
      }

      // Add text color based on theme and active state
      if (isActive) {
        // Active state: dark icon on white background for both themes
        baseStyles += ' text-black';
      } else {
        // Inactive state: follow theme
        if (theme.palette.mode === 'dark') {
          baseStyles += ' text-white';
        } else {
          baseStyles += ' text-black';
        }
      }

      return baseStyles;
    } else {
      // Mobile styles (tab design)
      let baseStyles =
        'group relative flex flex-col items-center justify-center h-14 flex-1 transition-colors duration-100 ease-out';

      // Add text color based on theme and active state
      if (isActive) {
        // Active state
        if (theme.palette.mode === 'dark') {
          baseStyles += ' text-white';
        } else {
          baseStyles += ' text-black';
        }
      } else {
        // Inactive state
        if (theme.palette.mode === 'dark') {
          baseStyles += ' text-gray-400';
        } else {
          baseStyles += ' text-gray-600';
        }
      }

      return baseStyles;
    }
  };

  // Get container background based on theme
  const getContainerStyles = () => {
    if (isDesktop) {
      // Desktop floating design
      if (theme.palette.mode === 'dark') {
        return 'bg-[#1c1c1c]';
      } else {
        return 'bg-gray-100';
      }
    } else {
      // Mobile tab design
      if (theme.palette.mode === 'dark') {
        return 'bg-[#1c1c1c] border-t border-gray-700';
      } else {
        return 'bg-white border-t border-gray-200';
      }
    }
  };

  // Submenu component
  const renderSubmenu = () => {
    if (!showSubmenu || !isDesktop) return null;

    return (
      <AnimatePresence>
        <m.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mt-2"
        >
          <div
            className={`rounded-2xl backdrop-blur-2xl p-6 shadow-lg border min-w-[500px] ${
              theme.palette.mode === 'dark'
                ? 'bg-[#1c1c1c]/90 border-gray-700/50'
                : 'bg-white/90 border-gray-200/50'
            }`}
          >
            <div className="flex gap-12">
              {/* Build Section */}
              <div className="min-w-[160px]">
                <h3
                  className={`text-xs font-semibold mb-3 ${
                    theme.palette.mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Build
                </h3>
                <div className="space-y-2">
                  {submenuItems.build.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        history.push(item.path);
                        setShowSubmenu(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? theme.palette.mode === 'dark'
                            ? 'bg-white/10 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : theme.palette.mode === 'dark'
                            ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Iconify icon={item.icon} className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Utils Section */}
              <div className="min-w-[160px]">
                <h3
                  className={`text-xs font-semibold mb-3 ${
                    theme.palette.mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Utils
                </h3>
                <div className="space-y-2">
                  {submenuItems.utils.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        history.push(item.path);
                        setShowSubmenu(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm rounded-lg transition-colors ${
                        isActivePath(item.path)
                          ? theme.palette.mode === 'dark'
                            ? 'bg-white/10 text-white'
                            : 'bg-gray-100 text-gray-900'
                          : theme.palette.mode === 'dark'
                            ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Iconify icon={item.icon} className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Section - Only show if authenticated */}
              {isAuthenticated && submenuItems.workspace.length > 0 && (
                <div className="min-w-[160px]">
                  <h3
                    className={`text-xs font-semibold mb-3 ${
                      theme.palette.mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Workspace
                  </h3>
                  <div className="space-y-2">
                    {submenuItems.workspace.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          history.push(item.path);
                          setShowSubmenu(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm rounded-lg transition-colors ${
                          isActivePath(item.path)
                            ? theme.palette.mode === 'dark'
                              ? 'bg-white/10 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : theme.palette.mode === 'dark'
                              ? 'text-gray-300 hover:bg-white/5 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Iconify icon={item.icon} className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </m.div>
      </AnimatePresence>
    );
  };

  // Don't render on mobile - only show on desktop
  if (!isDesktop) {
    return null;
  }

  return (
    <div className="fixed top-2 left-0 right-0 z-10 mx-auto flex w-fit justify-center pointer-events-none">
      <div
        className="pointer-events-auto"
        onMouseEnter={() => {
          // Keep submenu open when hovering over entire area
        }}
        onMouseLeave={() => setShowSubmenu(false)}
      >
        <menu
          className={`${getContainerStyles()} flex origin-center transform justify-center rounded-2xl backdrop-blur-2xl transition-all duration-500 ease-out select-none`}
        >
          {navigationItems.map((item, index) => {
            // Handle divider
            if (item.isDivider) {
              return (
                <li key="divider" className="flex items-center justify-center mx-1">
                  <div
                    className={`w-px h-4 ${
                      theme.palette.mode === 'dark' ? 'bg-gray-700/60' : 'bg-gray-400/60'
                    }`}
                  />
                </li>
              );
            }

            const isActive = isActivePath(item.path);

            return (
              <li key={item.path}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    history.push(item.path);
                    if (item.hasSubmenu) {
                      setShowSubmenu(false);
                    }
                  }}
                  onMouseEnter={() => {
                    if (item.hasSubmenu) {
                      setShowSubmenu(true);
                    }
                  }}
                  className={getButtonStyles(item.path, index)}
                >
                  {/* Icon */}
                  <div>{item.icon}</div>

                  {/* Tooltip - only show on desktop */}
                  <span
                    role="tooltip"
                    className={`pointer-events-none absolute top-12 left-1/2 z-10 block origin-top -translate-x-1/2 scale-90 rounded-lg text-xs leading-none font-medium opacity-0 transition-all duration-75 ease-out group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap ${
                      theme.palette.mode === 'dark'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active state background */}
                  <AnimatePresence>
                    {isActive && (
                      <m.div
                        key="activeNavTab"
                        layoutId="activeNavTab"
                        className={`absolute inset-0 z-[-1] rounded-xl ${
                          theme.palette.mode === 'dark'
                            ? 'bg-white shadow-none'
                            : 'bg-white shadow-[0_1px_4px_0px_rgba(0,0,0,0.075)]'
                        }`}
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </a>
              </li>
            );
          })}
        </menu>
        {renderSubmenu()}
      </div>
    </div>
  );
};

export default memo(FloatingNavigation);
