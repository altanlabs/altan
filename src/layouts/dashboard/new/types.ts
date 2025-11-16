/**
 * Type definitions for NewLayout components
 * Following SOLID principles with clear interface segregation
 */

export interface User {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
}

export interface UserData {
  name: string;
  username: string;
  avatar: string;
  initials: string;
  status: 'online' | 'offline' | 'away';
}

export interface NewLayoutProps {
  children: React.ReactNode;
  onRequestAuth?: (openDialog: (defaultToSignup?: boolean) => void) => void;
}

export interface HeaderProps {
  isAuthenticated: boolean;
  user: User | null;
  userData: UserData;
  isScrolled: boolean;
  showCompactPrompt: boolean;
  onAuthClick: () => void;
  onDemoClick: () => void;
  onUserAction: (action: string) => void;
  onThemeToggle: () => void;
  onCompactPromptClick: () => void;
  resolvedThemeMode: 'light' | 'dark';
}

export interface ScrollState {
  scrollY: number;
  isScrolled: boolean;
  showCompactPrompt: boolean;
}

export type UserAction =
  | 'profile'
  | 'settings'
  | 'appearance'
  | 'upgrade'
  | 'referrals'
  | 'logout';

