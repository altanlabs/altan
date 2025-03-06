import React from "react";
import type { DatabaseConfig } from "../config";
interface ErrorPopupProps {
    message: string;
    onClose: () => void;
    config: DatabaseConfig;
}
declare const ErrorPopup: ({ message, onClose, config }: ErrorPopupProps) => React.JSX.Element;
export default ErrorPopup;
//# sourceMappingURL=ErrorPopup.d.ts.map