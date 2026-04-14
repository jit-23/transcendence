import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./components/i18n.tsx"
import { AuthProvider } from "./AuthContext"
import { ThemeProvider } from "./ThemeContext"

ReactDOM.createRoot(document.getElementById("root")!).render(
        <ThemeProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>
)