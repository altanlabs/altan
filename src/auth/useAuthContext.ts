import { useContext } from 'react';

import { AuthContext } from './JwtContext';
import type { AuthContextType } from './types';

// ----------------------------------------------------------------------

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext context must be use inside AuthProvider');
  }

  return context;
};

