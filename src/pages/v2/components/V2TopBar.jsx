import React, { memo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Tooltip, IconButton } from '@mui/material';
import { useSettingsContext } from '../../../components/settings';
import AccountPopover from '../../../layouts/dashboard/header/AccountPopover';
import WorkspaceIndicator from './WorkspaceIndicator';
import Iconify from '../../../components/iconify';
import { useAuthContext } from '../../../auth/useAuthContext';
import useResponsive from '../../../hooks/useResponsive';

const V2TopBar = ({ onSearch }) => {
  const history = useHistory();
  const { resolvedThemeMode } = useSettingsContext();
  const { isAuthenticated } = useAuthContext();
  const isDesktop = useResponsive('up', 'lg');
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Always use white logo for onboarding (black background)
  const logoSrc = !isAuthenticated
    ? (isDesktop ? '/logos/v2/bold/logoWhite.svg' : '/logos/v2/logoWhite.svg')
    : resolvedThemeMode === 'dark' 
      ? (isDesktop ? '/logos/v2/bold/logoWhite.svg' : '/logos/v2/logoWhite.svg')
      : (isDesktop ? '/logos/v2/bold/logoBlack.svg' : '/logos/v2/logoBlack.svg');

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-2 flex items-center justify-between">
      {/* Logo and Workspace Switcher */}
      <div className="flex items-center gap-3 flex-1">
        <button 
          className="cursor-pointer group flex items-center justify-center h-10 transition-transform hover:scale-105"
          onClick={() => history.push('/')}
        >
          <img 
            src={logoSrc}
            alt="Altan"
            className="h-8 w-auto"
          />
        </button>
        
        {/* Workspace Indicator - Show current workspace */}
        {isAuthenticated && (
          <WorkspaceIndicator />
        )}
      </div>

      {/* Center - Search Bar */}
      {isAuthenticated && (
        <div className="hidden md:flex flex-1 justify-center max-w-md mt-1">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pl-10 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('');
                  if (onSearch) onSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Right Side - Actions & Account */}
      <div className="flex items-center justify-end gap-2 flex-1">
        {isAuthenticated ? (
          <>
            <Tooltip title="Get free credits">
              <IconButton
                size="small"
                onClick={() => history.push('/referrals')}
                sx={{ color: 'text.secondary' }}
              >
                <Iconify icon="mdi:gift-outline" width={18} height={18} />
              </IconButton>
            </Tooltip>

            <Button
              size="small"
              color="primary"
              variant="contained"
              startIcon={<Iconify icon="material-symbols:crown" />}
              onClick={() => history.push('/pricing')}
            >
              Upgrade
            </Button>

            <AccountPopover />
          </>
        ) : (
          <button
            onClick={() => history.push('/auth/login')}
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all"
          >
           Get started Free
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(V2TopBar);

