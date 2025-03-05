import { AuthUser } from "../types";
export interface AuthFormProps {
    onSubmit: (data: any) => Promise<void>;
    isLoading?: boolean;
    error?: Error | null;
    className?: string;
    children?: React.ReactNode;
}
export interface LoginFormProps extends AuthFormProps {
    onForgotPassword?: () => void;
    onSignUpClick?: () => void;
}
export interface SignUpFormProps extends AuthFormProps {
    onLoginClick?: () => void;
}
export interface ProfileFormProps extends AuthFormProps {
    user: AuthUser;
    onPhotoChange?: (file: File) => void;
}
export interface LogoutProps {
    appearance?: {
        theme?: 'light' | 'dark';
    };
    onLogout?: () => void;
    className?: string;
}
export interface AuthInputProps {
    className?: string;
    error?: string;
    label?: string;
}
//# sourceMappingURL=types.d.ts.map