import React, { ReactNode } from "react";
import type { DatabaseConfig } from "../config";
interface DatabaseProviderProps {
    config: DatabaseConfig;
    children: ReactNode;
    enableDevTools?: boolean;
    customMiddleware?: Array<any>;
}
declare const DatabaseProvider: React.MemoExoticComponent<({ config, children, customMiddleware, }: DatabaseProviderProps) => JSX.Element | null>;
export { DatabaseProvider };
//# sourceMappingURL=DatabaseProvider.d.ts.map