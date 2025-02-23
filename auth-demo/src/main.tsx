import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "@altanlabs/auth";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider tableId="888c63b7-cd81-4091-8699-44120347d68f">
      <App />
    </AuthProvider>
  </React.StrictMode>
);
