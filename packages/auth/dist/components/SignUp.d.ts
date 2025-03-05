import '../styles.css';
interface SignUpProps {
    appearance?: {
        theme?: 'light' | 'dark';
    };
    companyName?: string;
    routing?: 'hash' | 'path';
    path?: string;
    signInUrl?: string;
    forceRedirectUrl?: string;
    fallbackRedirectUrl?: string;
    signInForceRedirectUrl?: string;
    signInFallbackRedirectUrl?: string;
    initialValues?: {
        emailAddress?: string;
        password?: string;
    };
    withSignIn?: boolean;
}
export default function SignUp({ appearance, companyName, signInUrl, routing, withSignIn, ...props }: SignUpProps): import("react/jsx-runtime").JSX.Element | null;
export type { SignUpProps };
//# sourceMappingURL=SignUp.d.ts.map