import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { LoginForm }   from "./userLogin.tsx";
import { Dashboard }   from "./dashboard";
import { SignupForm }  from './userSignup.tsx';
import { ProfilePage } from './profile.tsx';
import PrivateRoute    from "./PrivateRoute";
import { useContext }  from "react";
import { AuthContext }  from "./AuthContext";

import '../css/App.css'

function PublicRoute({ children }) {
    const { user, authReady } = useContext(AuthContext);
    if (!authReady) return null;
    if (user) return <Navigate to="/dashboard" />;
    return children;
}

function NotFound() {
    return (
        <div id="center">
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, color: 'var(--border2)' }}>404</p>
                <p style={{ color: 'var(--ink3)', marginBottom: 20 }}>Page not found</p>
                <Link to="/" className="btn btn-ghost">← Go home</Link>
            </div>
        </div>
    );
}

function Home() {
    return (
        <div id="center">
            <div style={{ textAlign: 'center', maxWidth: 420 }}>
                <div className="logo" style={{ justifyContent: 'center', marginBottom: 20, fontSize: '1.2rem' }}>
                    <div className="logo-mark" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>W</div>
                    whiteboard
                </div>
                <h1 style={{ fontSize: '2.4rem', marginBottom: 12 }}>
                    Your collaborative<br />canvas
                </h1>
                <p style={{ color: 'var(--ink3)', marginBottom: 32, lineHeight: 1.7 }}>
                    A shared workspace for teams to think,<br />draw, and build together.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <Link to="/login"  className="btn btn-primary">Sign in →</Link>
                    <Link to="/signup" className="btn btn-ghost">Create account</Link>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={
                    <PublicRoute><LoginForm /></PublicRoute>
                } />

                <Route path="/signup" element={
                    <PublicRoute><SignupForm /></PublicRoute>
                } />

                <Route path="/dashboard" element={
                    <PrivateRoute><Dashboard /></PrivateRoute>
                } />

                <Route path="/profile" element={
                    <PrivateRoute><ProfilePage /></PrivateRoute>
                } />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;