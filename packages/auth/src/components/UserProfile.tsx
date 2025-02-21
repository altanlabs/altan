import React, { useState, useRef } from "react";
import { useAuth } from "../AuthProvider";
import type { MediaObject } from "../types";
import Logout from "./Logout";

export interface CustomPage {
  label: string;
  url: string;
  icon?: React.ReactNode;
}

export interface UserProfileProps {
  appearance?: {
    theme?: "light" | "dark";
  };
  routing?: "hash" | "path";
  path?: string;
  additionalOAuthScopes?: Record<string, string[]>;
  customPages?: CustomPage[];
  showCustomFields?: boolean;
  editableFields?: string[];
  hiddenFields?: string[];
  fallback?: React.ReactNode;
}

const ALWAYS_HIDDEN_FIELDS = [
  'id', 'verified', 'created_time', 'last_modified_time', 'last_modified_by', 'password'
];

const DEFAULT_EDITABLE_FIELDS = [
  'name',
  'surname',
  'email',
];

export default function UserProfile({
  appearance = { theme: "light" },
  routing = "path",
  path = "/user-profile",
  showCustomFields = true,
  editableFields = DEFAULT_EDITABLE_FIELDS,
  hiddenFields = [],
  customPages = [],
  fallback,
}: UserProfileProps) {
  const { user, updateProfile, isLoading, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return fallback || null;

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
      if (allHiddenFields.includes(key)) return false;
      if (!showCustomFields && !DEFAULT_EDITABLE_FIELDS.includes(key)) return false;
      return true;
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Content = reader.result as string;
        await updateProfile({
          avatar: [{
            file_name: 'avatar.jpg',
            mime_type: file.type || 'image/jpeg',
            file_content: base64Content.split(',')[1]
          }]
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  };

  const handleEdit = () => {
    setFormData(user);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      // Error handling is managed by AuthProvider
    }
  };

  return (
    <div className={`max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 ${theme.background}`}>
      <div className="space-y-8">
        {/* Profile Header with Avatar */}
        <div className={`${theme.card} shadow rounded-lg p-6`}>
          <div className="flex justify-between items-start mb-6">
            <h1 className={`text-2xl font-bold ${theme.text}`}>Profile Settings</h1>
            <Logout appearance={appearance} />
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {Array.isArray(user.avatar) && user.avatar[0]?.url ? (
                  <img
                    src={user.avatar[0].url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme.textMuted}`}>
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8c0 2.208-1.79 4-3.998 4-2.208 0-3.998-1.792-3.998-4s1.79-4 3.998-4c2.208 0 3.998 1.792 3.998 4z" />
                    </svg>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`absolute bottom-0 right-0 p-1.5 rounded-full ${theme.primary} ${theme.buttonText}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme.text}`}>
                {user.name || user.email}
              </h2>
              {Array.isArray(user.avatar) && user.avatar.length > 0 && (
                <button
                  onClick={() => updateProfile({ avatar: [] })}
                  className={`text-sm ${theme.textMuted} hover:${theme.text}`}
                >
                  Remove avatar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Fields */}
        <div className={`${theme.card} shadow rounded-lg`}>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-medium ${theme.text}`}>Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className={`px-4 py-2 rounded-md ${theme.primary} ${theme.buttonText}`}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-4">
                  <button
                    onClick={handleCancel}
                    className={`px-4 py-2 border ${theme.border} rounded-md ${theme.textSecondary}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md ${theme.primary} ${theme.buttonText} disabled:opacity-50`}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {getDisplayFields().map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className={`block text-sm font-medium ${theme.textMuted}`}>
                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  {isEditing && editableFields.includes(key) ? (
                    <input
                      type="text"
                      value={formData[key] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                      className={`block w-full rounded-md ${theme.border} shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${theme.card} ${theme.text}`}
                    />
                  ) : (
                    <div className={`text-sm ${theme.text}`}>
                      {value || "Not set"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
