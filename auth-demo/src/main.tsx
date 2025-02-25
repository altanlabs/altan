import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import DatabaseTest from "./DatabaseTest";
import DirectTest from "./DirectTest";
import { AuthProvider } from "@altanlabs/auth";
import "./index.css";

// Choose which component to render
const COMPONENT_TO_RENDER = "database"; // "app", "database", or "direct"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {COMPONENT_TO_RENDER === "app" && (
      <AuthProvider tableId="888c63b7-cd81-4091-8699-44120347d68f">
        <App />
      </AuthProvider>
    )}
    {COMPONENT_TO_RENDER === "database" && <DatabaseTest />}
    {COMPONENT_TO_RENDER === "direct" && <DirectTest />}
  </React.StrictMode>
);
