import { __awaiter, __rest } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../AuthProvider";
import '../styles.css';
import Google from '../assets/Google';
export default function SignUp(_a) {
    var _b, _c;
    var { appearance = { theme: 'light' }, companyName, signInUrl = '/sign-in', routing = 'path', withSignIn = true } = _a, props = __rest(_a, ["appearance", "companyName", "signInUrl", "routing", "withSignIn"]);
    const { continueWithGoogle, register, isLoading, isAuthenticated, error } = useAuth();
    const [email, setEmail] = useState(((_b = props.initialValues) === null || _b === void 0 ? void 0 : _b.emailAddress) || "");
    const [password, setPassword] = useState(((_c = props.initialValues) === null || _c === void 0 ? void 0 : _c.password) || "");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState(null);
    // Theme styles object
    const theme = {
        light: {
            background: "bg-white",
            card: "bg-white",
            text: "text-gray-900",
            textMuted: "text-gray-600",
            input: "bg-white text-gray-900 border-gray-300",
            button: "bg-black hover:bg-gray-900 text-white",
            googleButton: "bg-white hover:bg-gray-50 text-gray-700 border-gray-300",
            error: {
                background: "bg-red-50",
                text: "text-red-800",
                icon: "text-red-400"
            }
        },
        dark: {
            background: "bg-gray-900",
            card: "bg-gray-800",
            text: "text-white",
            textMuted: "text-gray-300",
            input: "bg-gray-800 text-white border-gray-600",
            button: "bg-white hover:bg-gray-100 text-black",
            googleButton: "bg-gray-800 hover:bg-gray-700 text-white border-gray-600",
            error: {
                background: "bg-red-900/20",
                text: "text-red-200",
                icon: "text-red-400"
            }
        }
    }[appearance.theme || 'light'];
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setValidationError(null);
        if (password !== confirmPassword) {
            setValidationError("Passwords don't match");
            return;
        }
        try {
            yield register({
                email,
                password,
                displayName: ""
            });
        }
        catch (err) {
            // Error is already handled by AuthProvider
            // No need to do anything here as the error will be displayed through the error state
        }
    });
    if (isAuthenticated)
        return null;
    const handleSignInClick = (e) => {
        e.preventDefault();
        if (routing === 'hash') {
            window.location.hash = signInUrl;
        }
        else {
            window.location.href = signInUrl;
        }
    };
    return (_jsxs("div", { className: "max-w-md w-full mx-auto space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: `text-center text-3xl font-bold ${theme.text}`, children: companyName ? `Create your ${companyName} account` : "Create account" }), _jsx("p", { className: `mt-2 text-center text-sm ${theme.textMuted}`, children: "Get started by creating your account" })] }), _jsx("button", { onClick: () => continueWithGoogle(), className: `w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${theme.googleButton}`, children: _jsxs("span", { className: "flex items-center", children: [_jsx(Google, {}), _jsx("span", { className: "ml-2", children: "Continue with Google" })] }) }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: `w-full border-t ${appearance.theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}` }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: `px-2 ${theme.card} ${theme.textMuted}`, children: "or" }) })] }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: `block text-sm font-medium ${theme.text}`, children: "Email address" }), _jsx("input", { id: "email", type: "email", required: true, className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`, value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: `block text-sm font-medium ${theme.text}`, children: "Password" }), _jsx("input", { id: "password", type: "password", required: true, className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`, value: password, onChange: (e) => setPassword(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: `block text-sm font-medium ${theme.text}`, children: "Confirm Password" }), _jsx("input", { id: "confirmPassword", type: "password", required: true, className: `mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${theme.input}`, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value) })] }), (error || validationError) && (_jsx("div", { className: `rounded-md ${theme.error.background} p-4`, children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: `h-5 w-5 ${theme.error.icon}`, viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: `text-sm font-medium ${theme.error.text}`, children: validationError || (error === null || error === void 0 ? void 0 : error.message) }) })] }) })), _jsx("button", { type: "submit", className: `w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${theme.button}`, disabled: isLoading, children: isLoading ? "Creating account..." : "Create account" })] }), _jsxs("div", { className: `mt-8 border-t ${appearance.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-6`, children: [withSignIn && (_jsxs("div", { className: "text-center mb-4", children: [_jsx("span", { className: theme.textMuted, children: "Already have an account? " }), _jsx("a", { href: signInUrl, onClick: handleSignInClick, className: "text-blue-600 hover:text-blue-400", children: "Sign in" })] })), _jsxs("div", { className: `flex items-center justify-center space-x-2 text-xs ${theme.textMuted}`, children: [_jsx("span", { children: "Secured by" }), _jsx("img", { src: appearance.theme === "dark"
                                    ? "https://altan.ai/logos/horizontalWhite.png"
                                    : "https://altan.ai/logos/horizontalBlack.png", alt: "Altan", className: "h-3" })] })] })] }));
}
//# sourceMappingURL=SignUp.js.map