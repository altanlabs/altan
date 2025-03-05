import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "../AuthProvider";
export function Profile({ className = "" }) {
    const { user, logout } = useAuth();
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Profile" }), _jsx("button", { onClick: logout, className: "text-sm font-medium text-primary-600 hover:text-primary-500", children: "Sign out" })] }), _jsx("div", { className: "bg-white shadow rounded-lg p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("div", { className: "mt-1 text-sm text-gray-900", children: user === null || user === void 0 ? void 0 : user.email })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "User ID" }), _jsx("div", { className: "mt-1 text-sm text-gray-900", children: user === null || user === void 0 ? void 0 : user.id })] })] }) })] }));
}
//# sourceMappingURL=Profile.js.map