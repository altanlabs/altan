import React from 'react';
import { useAuthActions } from '../AuthProvider';

export interface LogoutProps {
  appearance?: {
    theme?: 'light' | 'dark';
  };
  onLogout?: () => void;
  className?: string;
}

export default function Logout({
  appearance = { theme: 'light' },
  onLogout,
  className = '',
}: LogoutProps) {
  const { logout } = useAuthActions();

  const theme = {
    light: {
      button: 'text-red-600 hover:text-red-800',
    },
    dark: {
      button: 'text-red-400 hover:text-red-200',
    }
  }[appearance.theme || 'light'];

  const handleLogout = async () => {
    try {
      await logout();
      onLogout?.();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 ${theme.button} ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span>Logout</span>
    </button>
  );
} 