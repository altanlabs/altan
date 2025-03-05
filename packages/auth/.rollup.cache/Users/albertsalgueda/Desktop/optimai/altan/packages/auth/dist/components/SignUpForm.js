import { __awaiter } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../AuthProvider";
export function SignUpForm({ className = "", onLoginClick }) {
    const { register, error, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState(null);
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setValidationError(null);
        if (password !== confirmPassword) {
            setValidationError("Passwords don't match");
            return;
        }
        yield register({
            email, password,
            displayName: ""
        });
    });
    return (_jsxs("form", { onSubmit: handleSubmit, className: `space-y-6 ${className}`, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium leading-6 text-gray-900", children: "Email address" }), _jsx("div", { className: "mt-2", children: _jsx("input", { id: "email", name: "email", type: "email", autoComplete: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6", placeholder: "name@company.com" }) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium leading-6 text-gray-900", children: "Password" }), _jsx("div", { className: "mt-2", children: _jsx("input", { id: "password", name: "password", type: "password", autoComplete: "new-password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium leading-6 text-gray-900", children: "Confirm Password" }), _jsx("div", { className: "mt-2", children: _jsx("input", { id: "confirmPassword", name: "confirmPassword", type: "password", autoComplete: "new-password", required: true, value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }) })] }), (error || validationError) && (_jsx("div", { className: "rounded-md bg-red-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm font-medium text-red-800", children: validationError || (error === null || error === void 0 ? void 0 : error.message) }) })] }) })), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading, className: "flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? (_jsxs("div", { className: "flex items-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Creating account..."] })) : ("Create account") }) })] }));
}
//# sourceMappingURL=SignUpForm.js.map