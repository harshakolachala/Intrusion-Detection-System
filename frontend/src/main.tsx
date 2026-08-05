import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeModeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeModeProvider>
    </BrowserRouter>
  </StrictMode>,
);
