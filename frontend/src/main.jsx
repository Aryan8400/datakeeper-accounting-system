import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import App from "./App.jsx";
import "./index.css";

const currentHash = window.location.hash;
const currentPath = window.location.pathname + window.location.search;
if (!currentHash && currentPath !== "/") {
  window.location.replace(`${window.location.origin}/#${currentPath}`);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>
);
