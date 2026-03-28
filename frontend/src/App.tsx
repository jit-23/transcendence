import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { LoginForm } from "./userLogin.tsx";
import { Dashboard } from "./dashboard";
import { SignupForm } from './userSignup.tsx'
import PrivateRoute from "./PrivateRoute";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

import '../css/App.css'

function PublicRoute({ children }) {
    const { user, authReady } = useContext(AuthContext);
    if (!authReady) return null; // still loading
    if (user) return <Navigate to="/dashboard" />;
    return children;
}

function NotFound() {
    return (
        <div>
            <h1>404</h1>
            <p>Page not found</p>
            <Link to="/">Go home</Link>
        </div>
    )
}

function Home() {
    return (
        <div>
            <h1>Home</h1>
            <nav>
                <Link to="/login">Login</Link>
                <br />
                <Link to="/signup">Register</Link>
            </nav>
        </div>
    )
}

function App() {
    return (
        <div id="center">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={
                        <PublicRoute>
                            <LoginForm />
                        </PublicRoute>
                    } />

                    <Route path="/signup" element={
                        <PublicRoute>
                            <SignupForm />
                        </PublicRoute>
                    } />

                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;