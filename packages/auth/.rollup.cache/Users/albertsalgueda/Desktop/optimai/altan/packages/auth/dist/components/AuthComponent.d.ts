export type AuthView = "login" | "signup";
interface AuthComponentProps {
    defaultView?: AuthView;
    className?: string;
    onForgotPassword?: () => void;
}
export declare function AuthComponent({ defaultView, className, onForgotPassword }: AuthComponentProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AuthComponent.d.ts.map