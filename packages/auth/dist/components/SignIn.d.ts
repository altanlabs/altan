import '../styles.css';
interface SignInProps {
    appearance?: {
        theme?: 'light' | 'dark';
    };
    companyName?: string;
    routing?: 'hash' | 'path';
    path?: string;
    signUpUrl?: string;
    forceRedirectUrl?: string;
    fallbackRedirectUrl?: string;
    signUpForceRedirectUrl?: string;
    signUpFallbackRedirectUrl?: string;
    initialValues?: {
        emailAddress?: string;
        password?: string;
    };
    transferable?: boolean;
    waitlistUrl?: string;
    withSignUp?: boolean;
}
export default function SignIn({ appearance, companyName, signUpUrl, routing, withSignUp, ...props }: SignInProps): import("react/jsx-runtime").JSX.Element | null;
export type { SignInProps };
//# sourceMappingURL=SignIn.d.ts.map