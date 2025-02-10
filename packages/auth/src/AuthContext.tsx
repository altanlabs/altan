import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FieldMapping } from "./types";

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoUrl?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  display_name?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  tableId: string;
  storageKey?: string;
  onAuthStateChange?: (user: AuthUser | null) => void;
  authenticationOptions?: {
    persistSession?: boolean;
    redirectUrl?: string;
  };
  fieldMapping?: FieldMapping;
}

const defaultMapping: Required<FieldMapping> = {
  email: 'email',
  password: 'password',
  emailVerified: 'email_verified',
  displayName: 'display_name',
  photoUrl: 'photo_url'
};

const AUTH_BASE_URL = 'https://api.altan.ai/tables';

export function AuthProvider({
  children,
  storageKey = "auth_user",
  onAuthStateChange,
  authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
  },
  fieldMapping = {},
  tableId,
}: AuthProviderProps & { tableId: string }) {
  const mapping = { ...defaultMapping, ...fieldMapping };

  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    if (authenticationOptions.persistSession) {
      const storedUser = localStorage.getItem(storageKey);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, [storageKey, authenticationOptions.persistSession]);

  // Notify on auth state changes
  useEffect(() => {
    onAuthStateChange?.(user);
  }, [user, onAuthStateChange]);

  const login = useCallback(
    async ({ email, password }: LoginCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        // Use the auth endpoint directly
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 expects 'username'
        formData.append('password', password);

        const response = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/login`, {
          method: 'POST',
          credentials: 'include', // Important for cookies
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        // Get user info
        const userResponse = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/me`, {
          credentials: 'include',
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const authUser = await userResponse.json();
        
        if (authenticationOptions.persistSession) {
          localStorage.setItem(storageKey, JSON.stringify(authUser));
        }

        setUser(authUser);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Login failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [tableId, storageKey, authenticationOptions.persistSession]
  );

  const register = useCallback(
    async ({ email, password, display_name }: RegisterCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/register`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            display_name,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Registration failed');
        }

        // Login after successful registration
        await login({ email, password });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Registration failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [tableId, login]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      if (authenticationOptions.persistSession) {
        localStorage.removeItem(storageKey);
      }
      setUser(null);
    }
  }, [tableId, storageKey, authenticationOptions.persistSession]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const authUser = await response.json();
          setUser(authUser);
          if (authenticationOptions.persistSession) {
            localStorage.setItem(storageKey, JSON.stringify(authUser));
          }
        } else {
          setUser(null);
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem(storageKey);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [tableId, storageKey, authenticationOptions.persistSession]);

  const resetPassword = useCallback(async (email: string) => {
    // Implement password reset logic here
    throw new Error("Not implemented");
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<AuthUser>) => {
      if (!user) {
        throw new Error("No user logged in");
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${AUTH_BASE_URL}/table/${tableId}/auth/update`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            display_name: updates.displayName,
            photo_url: updates.photoUrl,
            email: updates.email,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Profile update failed');
        }

        const updatedUser = await response.json();

        // Convert snake_case to camelCase for frontend
        const authUser: AuthUser = {
          id: updatedUser.id,
          email: updatedUser.email,
          emailVerified: updatedUser.email_verified,
          displayName: updatedUser.display_name,
          photoUrl: updatedUser.photo_url,
        };

        setUser(authUser);

        if (authenticationOptions.persistSession) {
          localStorage.setItem(storageKey, JSON.stringify(authUser));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Profile update failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, tableId, storageKey, authenticationOptions.persistSession]
  );

  const value: AuthContextValue = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
