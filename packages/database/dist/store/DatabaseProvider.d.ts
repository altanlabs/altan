import React, { ReactNode } from "react";
import type { DatabaseConfig } from "../config";
interface DatabaseProviderProps {
    config: DatabaseConfig;
    children: ReactNode;
    enableDevTools?: boolean;
    customMiddleware?: Array<any>;
}
declare const DatabaseProvider: React.NamedExoticComponent<DatabaseProviderProps>;
export { DatabaseProvider };
//# sourceMappingURL=DatabaseProvider.d.ts.map