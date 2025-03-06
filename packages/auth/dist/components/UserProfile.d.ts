import React from "react";
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
export default function UserProfile({ appearance, routing, path, showCustomFields, editableFields, hiddenFields, customPages, fallback, }: UserProfileProps): string | number | bigint | true | import("react/jsx-runtime").JSX.Element | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null;
//# sourceMappingURL=UserProfile.d.ts.map