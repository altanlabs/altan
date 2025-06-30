import { useTheme } from '@mui/material/styles';
import { AnimatePresence, m } from 'framer-motion';
import { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuthContext } from '../../../auth/useAuthContext';
import Iconify from '../../../components/iconify';

const FloatingNavigation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();

  // Navigation items configuration
  const navigationItems = [
    {
      path: '/',
      label: 'Projects',
      icon: (
        <Iconify
          icon="material-symbols:home"
          className="w-[18px] h-[18px]"
        />
      ),
    },
    {
      path: '/agents',
      label: 'Agents',
      icon: (
        <Iconify
          icon="fluent:bot-sparkle-20-filled"
          className="w-[18px] h-[18px]"
        />
      ),
    },
    {
      path: '/flows',
      label: 'Flows',
      icon: (
        <Iconify
          icon="fluent:flash-flow-24-filled"
          className="w-[18px] h-[18px]"
        />
      ),
    },
    // Conditionally show Usage or Pricing based on authentication
    isAuthenticated ? {
      path: '/usage',
      label: 'Usage',
      icon: (
        <Iconify
          icon="material-symbols:monitoring"
          className="w-[18px] h-[18px]"
        />
      ),
    } : {
      path: '/pricing',
      label: 'Pricing',
      icon: (
        <Iconify
          icon="material-symbols:payments"
          className="w-[18px] h-[18px]"
        />
      ),
    },
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

    // Default case: check if current path starts with the nav path + '/'
    // but exclude root path to avoid it matching everything
    if (path !== '/' && currentPath.startsWith(path + '/')) {
      return true;
    }

    return false;
  };

  // Get button styles based on active state and theme
  const getButtonStyles = (path, index) => {
    const isActive = isActivePath(path);
    const isLast = index === navigationItems.length - 1;

    let baseStyles =
      'group relative flex items-center justify-center h-10 w-12 leading-none transition-colors duration-100 ease-out my-1.5';

    // Add margins
    if (isLast) {
      baseStyles += ' ml-1.5 mr-1.5';
    } else {
      baseStyles += ' ml-1.5';
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
  };

  // Get container background based on theme
  const getContainerStyles = () => {
    if (theme.palette.mode === 'dark') {
      return 'bg-[#1c1c1c]';
    } else {
      return 'bg-gray-100';
    }
  };

  return (
    <div className="fixed top-2 left-0 right-0 z-50 mx-auto flex w-fit justify-center">
      <menu
        className={`${getContainerStyles()} flex origin-center transform justify-center rounded-2xl backdrop-blur-2xl transition-all duration-500 ease-out select-none`}
      >
        {navigationItems.map((item, index) => {
          const isActive = isActivePath(item.path);

          return (
            <li key={item.path}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                className={getButtonStyles(item.path, index)}
              >
                {item.icon}

                {/* Tooltip */}
                <span
                  role="tooltip"
                  className={`pointer-events-none absolute top-12 left-1/2 z-10 block origin-top -translate-x-1/2 scale-90 rounded-lg px-1.5 py-1 text-xs leading-none font-medium opacity-0 transition-all duration-75 ease-out group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap ${
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
    </div>
  );
};

export default memo(FloatingNavigation);
