import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
export function AuthComponent({ defaultView = "login", className = "", onForgotPassword }) {
    const [view, setView] = useState(defaultView);
    return (_jsx("div", { className: className, children: view === "login" ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-bold tracking-tight text-gray-900", children: "Sign in to your account" }), _jsxs("p", { className: "mt-2 text-center text-sm text-gray-600", children: ["Or", " ", _jsx("button", { onClick: () => setView("signup"), className: "font-medium text-primary-600 hover:text-primary-500", children: "create a new account" })] })] }), _jsx(LoginForm, { onSignUpClick: () => setView("signup"), onForgotPassword: onForgotPassword })] })) : (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-bold tracking-tight text-gray-900", children: "Create your account" }), _jsxs("p", { className: "mt-2 text-center text-sm text-gray-600", children: ["Already have an account?", " ", _jsx("button", { onClick: () => setView("login"), className: "font-medium text-primary-600 hover:text-primary-500", children: "Sign in" })] })] }), _jsx(SignUpForm, { onLoginClick: () => setView("login") })] })) }));
}
//# sourceMappingURL=AuthComponent.js.map