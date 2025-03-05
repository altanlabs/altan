import { __awaiter } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { useAuth } from "../AuthProvider";
import Logout from "./Logout";
const ALWAYS_HIDDEN_FIELDS = [
    'id', 'verified', 'created_time', 'last_modified_time', 'last_modified_by', 'password', 'avatar'
];
const DEFAULT_EDITABLE_FIELDS = [
    'name',
    'surname',
];
export default function UserProfile({ appearance = { theme: "light" }, routing = "path", path = "/user-profile", showCustomFields = true, editableFields = DEFAULT_EDITABLE_FIELDS, hiddenFields = [], customPages = [], fallback, }) {
    var _a;
    const { user, updateProfile, isLoading, error } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const fileInputRef = useRef(null);
    if (!user)
        return fallback || null;
    const themeClasses = {
        light: {
            background: "bg-gray-50",
            card: "bg-white",
            text: "text-gray-900",
            textSecondary: "text-gray-700",
            textMuted: "text-gray-500",
            border: "border-gray-300",
            primary: "bg-primary-600 hover:bg-primary-700",
            buttonText: "text-white",
        },
        dark: {
            background: "bg-gray-900",
            card: "bg-gray-800",
            text: "text-white",
            textSecondary: "text-gray-300",
            textMuted: "text-gray-400",
            border: "border-gray-700",
            primary: "bg-primary-500 hover:bg-primary-600",
            buttonText: "text-white",
        },
    };
    const theme = themeClasses[appearance.theme || "light"];
    const allHiddenFields = [...ALWAYS_HIDDEN_FIELDS, ...hiddenFields];
    const getDisplayFields = () => {
        return Object.entries(user).filter(([key]) => {
            if (allHiddenFields.includes(key))
                return false;
            if (key === 'avatar')
                return false;
            if (!showCustomFields && !DEFAULT_EDITABLE_FIELDS.includes(key))
                return false;
            return true;
        }).map(([key, value]) => {
            // Format the value based on its type
            let displayValue = value;
            if (Array.isArray(value)) {
                displayValue = value.join(', ');
            }
            else if (value === null || value === undefined) {
                displayValue = '';
            }
            else if (typeof value === 'object') {
                displayValue = JSON.stringify(value);
            }
            return [key, displayValue];
        });
    };
    const handleAvatarChange = (e) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        try {
            const reader = new FileReader();
            reader.onloadend = () => __awaiter(this, void 0, void 0, function* () {
                const base64Content = reader.result;
                yield updateProfile({
                    avatar: [{
                            file_name: 'avatar.jpg',
                            mime_type: file.type || 'image/jpeg',
                            file_content: base64Content.split(',')[1]
                        }]
                });
            });
            reader.readAsDataURL(file);
        }
        catch (err) {
            console.error('Failed to update avatar:', err);
        }
    });
    const handleEdit = () => {
        setFormData(user);
        setIsEditing(true);
    };
    const handleCancel = () => {
        setFormData({});
        setIsEditing(false);
    };
    const handleSave = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield updateProfile(formData);
            setIsEditing(false);
        }
        catch (err) {
            // Error handling is managed by AuthProvider
        }
    });
    return (_jsx("div", { className: `max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 ${theme.background}`, children: _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: `${theme.card} shadow rounded-lg p-6`, children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsx("h1", { className: `text-2xl font-bold ${theme.text}`, children: "Profile Settings" }), _jsx(Logout, { appearance: appearance })] }), _jsxs("div", { className: "flex items-center space-x-6", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-24 h-24 rounded-full overflow-hidden bg-gray-200", children: Array.isArray(user.avatar) && ((_a = user.avatar[0]) === null || _a === void 0 ? void 0 : _a.url) ? (_jsx("img", { src: user.avatar[0].url, alt: "Profile", className: "w-full h-full object-cover" })) : (_jsx("div", { className: `w-full h-full flex items-center justify-center ${theme.textMuted}`, children: _jsx("svg", { className: "w-12 h-12", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z" }) }) })) }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleAvatarChange, accept: "image/*", className: "hidden" }), _jsx("button", { onClick: () => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: `absolute bottom-0 right-0 p-1.5 rounded-full ${theme.primary} ${theme.buttonText}`, children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) }) })] }), _jsxs("div", { children: [_jsx("h2", { className: `text-2xl font-bold ${theme.text}`, children: user.name || user.email }), Array.isArray(user.avatar) && user.avatar.length > 0 && (_jsx("button", { onClick: () => updateProfile({ avatar: [] }), className: `text-sm ${theme.textMuted} hover:${theme.text}`, children: "Remove avatar" }))] })] })] }), _jsx("div", { className: `${theme.card} shadow rounded-lg`, children: _jsxs("div", { className: "px-4 py-5 sm:p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h3", { className: `text-lg font-medium ${theme.text}`, children: "Profile Information" }), _jsx("button", { onClick: isEditing ? handleSave : handleEdit, disabled: isEditing && isLoading, className: `px-4 py-2 rounded-md ${theme.primary} ${theme.buttonText} disabled:opacity-50`, children: isEditing ? (isLoading ? "Saving..." : "Save Changes") : "Edit Profile" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: getDisplayFields().map(([key, value]) => (_jsxs("div", { className: "space-y-1", children: [_jsx("label", { className: `block text-sm font-medium ${theme.textMuted}`, children: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }), isEditing && editableFields.includes(key) ? (_jsx("input", { type: "text", value: formData[key] || "", onChange: (e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { [key]: e.target.value }))), className: `block w-full rounded-md ${theme.border} shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${theme.card} ${theme.text} p-2` })) : (_jsx("div", { className: `text-sm ${theme.text} p-2 rounded-md ${theme.card === 'bg-white' ? 'bg-gray-50' : 'bg-gray-700'}`, children: value || "Not set" }))] }, key))) })] }) }), error && (_jsx("div", { className: "rounded-md bg-red-50 dark:bg-red-900 p-4", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm font-medium text-red-800 dark:text-red-200", children: error.message }) })] }) }))] }) }));
}
//# sourceMappingURL=UserProfile.js.map