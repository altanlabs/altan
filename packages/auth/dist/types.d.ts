export interface MediaObject {
    id?: string;
    file_name: string;
    mime_type: string;
    size?: number;
    url?: string;
    file_content?: string;
}
export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    surname?: string;
    avatar?: MediaObject[];
    verified: boolean;
    [key: string]: any;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterCredentials extends LoginCredentials {
    name?: string;
    surname?: string;
    [key: string]: any;
}
export interface FieldMapping {
    email?: string;
    password?: string;
    emailVerified?: string;
    displayName?: string;
    photoUrl?: string;
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
}
export interface SignInInitialValues {
    emailAddress?: string;
    password?: string;
}
export interface AuthAppearance {
    theme?: 'light' | 'dark';
}
//# sourceMappingURL=types.d.ts.map