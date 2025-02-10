export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName?: string;  // Changed from display_name to match frontend convention
}

export interface FieldMapping {
  email?: string;          // Default: "email"
  password?: string;       // Default: "password"
  emailVerified?: string;  // Default: "emailverified"
  displayName?: string;    // Default: "displayname"
  photoUrl?: string;       // Default: "photourl"
}

export interface AuthContextValue {
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