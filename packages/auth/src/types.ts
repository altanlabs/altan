import { AxiosInstance } from "axios";

// Media object interface for attachments
export interface MediaObject {
  id?: string;
  file_name: string;
  mime_type: string;
  size?: number;
  url?: string;
  file_content?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  surname?: string;
  avatar?: MediaObject[]; // Array of media objects
  verified: boolean;
  [key: string]: any; // For additional fields
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
  surname?: string;
  [key: string]: any; // For additional registration fields
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
  continueWithGoogle: () => Promise<void>;
  api: AxiosInstance;
}

export interface SignInInitialValues {
  emailAddress?: string;
  password?: string;
}

export interface AuthAppearance {
  theme?: 'light' | 'dark';
  // Add more appearance options as needed
}