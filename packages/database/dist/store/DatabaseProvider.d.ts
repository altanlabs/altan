import { ReactNode } from "react";
import type { DatabaseConfig } from "../config";
interface DatabaseProviderProps {
    config: DatabaseConfig;
    children: ReactNode;
    enableDevTools?: boolean;
    customMiddleware?: Array<any>;
}
export declare const DatabaseProvider: ({ config, children, customMiddleware, }: DatabaseProviderProps) => JSX.Element | null;
export {};
//# sourceMappingURL=DatabaseProvider.d.ts.map