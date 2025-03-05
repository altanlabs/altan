import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import DatabaseTest from "./DatabaseTest";
import DirectTest from "./DirectTest";
import { AuthProvider } from "@altanlabs/auth";
import "./index.css";

// Choose which component to render
const COMPONENT_TO_RENDER = "app"; // "app", "database", or "direct"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {COMPONENT_TO_RENDER === "app" && (
      <AuthProvider tableId="4fb9c1e4-ee47-4d41-a52c-c6926bd679d2">
        <App />
      </AuthProvider>
    )}
    {COMPONENT_TO_RENDER === "database" && <DatabaseTest />}
    {COMPONENT_TO_RENDER === "direct" && <DirectTest />}
  </React.StrictMode>
);
