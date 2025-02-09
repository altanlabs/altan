import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDatabase } from "@altanlabs/database";
import { hashPassword, comparePasswords } from "./crypto";

export interface AuthUser {
  id: string;
  email: string;
  email_verified: boolean;
  display_name?: string;
  photo_url?: string;
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
  storageKey?: string;
  onAuthStateChange?: (user: AuthUser | null) => void;
  authenticationOptions?: {
    persistSession?: boolean;
    redirectUrl?: string;
  };
}

export function AuthProvider({
  children,
  storageKey = "auth_user",
  onAuthStateChange,
  authenticationOptions = {
    persistSession: true,
    redirectUrl: "/login",
  },
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the database hook to interact with the users table
  const {
    records: users,
    addRecord,
    modifyRecord,
    refresh,
  } = useDatabase("users", {
    limit: 1, // We typically only need to fetch one user at a time
  });

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

        // Find user by email
        await refresh({
          filters: [{ field: "email", operator: "eq", value: email }],
          limit: 1,
        });

        const foundUser = users[0];
        if (!foundUser) {
          throw new Error("User not found");
        }

        // Verify password
        const isValid = await comparePasswords(
          password,
          foundUser.fields.password as string
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Create user object without sensitive data
        const authUser: AuthUser = {
          id: foundUser.id,
          email: foundUser.fields.email as string,
          email_verified: Boolean(foundUser.fields.email_verified),
          display_name: foundUser.fields.display_name as string | undefined,
          photo_url: foundUser.fields.photo_url as string | undefined,
        };

        // Store user if persistence is enabled
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
    [users, refresh, storageKey, authenticationOptions.persistSession]
  );

  const register = useCallback(
    async ({ email, password, display_name }: RegisterCredentials) => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user already exists
        await refresh({
          filters: [{ field: "email", operator: "eq", value: email }],
          limit: 1,
        });

        if (users.length > 0) {
          throw new Error("User already exists");
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = await addRecord({
          email,
          password: hashedPassword,
          display_name: display_name,
          email_verified: false,
        });

        // Log in the new user
        await login({ email, password });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Registration failed"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [users, refresh, addRecord, login]
  );

  const logout = useCallback(async () => {
    if (authenticationOptions.persistSession) {
      localStorage.removeItem(storageKey);
    }
    setUser(null);
  }, [storageKey, authenticationOptions.persistSession]);

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

        await modifyRecord(user.id, updates);

        // Update local user state
        setUser((prev) => (prev ? { ...prev, ...updates } : null));

        // Update stored user if persistence is enabled
        if (authenticationOptions.persistSession) {
          const storedUser = localStorage.getItem(storageKey);
          if (storedUser) {
            localStorage.setItem(
              storageKey,
              JSON.stringify({ ...JSON.parse(storedUser), ...updates })
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Profile update failed")
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user, modifyRecord, storageKey, authenticationOptions.persistSession]
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
