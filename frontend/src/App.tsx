import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { LoginForm }   from "./userLogin.tsx";
import { Dashboard }   from "./dashboard";
import { SignupForm }  from './userSignup.tsx';
import { ProfilePage } from './profile.tsx';
import PrivateRoute    from "./PrivateRoute";
import { useContext }  from "react";
import { AuthContext } from "./AuthContext";
import { useTheme }    from "./ThemeContext";
import { SearchFriends } from "./searchFriends.tsx";
import { ChatPage } from "./chat.tsx";
import Canvas from "./Canvas.tsx";
import { GroupChatsPage } from "./groupChats.tsx";
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
                <p style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '5rem',
                    fontWeight: 800,
                    color: 'var(--border2)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                }}>404</p>
                <p style={{ color: 'var(--ink3)', margin: '12px 0 24px', fontSize: '0.85rem' }}>
                    This page doesn't exist.
                </p>
                <Link to="/" className="btn btn-ghost">← Go home</Link>
            </div>
        </div>
    );
}

function Home() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div id="center">
            {/* Theme toggle top-right */}
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                title="Toggle theme"
                style={{ position: 'fixed', top: 20, right: 24 }}
            >
                {theme === 'dark' ? '☀' : '☾'}
            </button>

            <div style={{ textAlign: 'center', maxWidth: 440 }}>
                <div className="logo" style={{ justifyContent: 'center', marginBottom: 32, fontSize: '1.1rem' }}>
                    <div className="logo-mark" style={{ width: 34, height: 34, fontSize: '0.8rem' }}>W</div>
                    whiteboard
                </div>

                <h1 style={{ fontSize: '2.8rem', marginBottom: 16, lineHeight: 1.1 }}>
                    Think together,<br />
                    <span style={{ color: 'var(--ink2)' }}>in real time.</span>
                </h1>

                <p style={{
                    color: 'var(--ink3)',
                    fontSize: '0.875rem',
                    lineHeight: 1.8,
                    marginBottom: 36,
                }}>
                    A shared canvas for your team — draw, plan,<br />
                    and collaborate without the noise.
                </p>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <Link to="/signup" className="btn btn-primary">Get started →</Link>
                    <Link to="/login"  className="btn btn-ghost">Sign in</Link>
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

                <Route path="/search" element={
                    <PrivateRoute><SearchFriends /></PrivateRoute>
                } />

                <Route path="/chat" element={
                    <PrivateRoute><ChatPage /></PrivateRoute>
                } />

                <Route path="/groups" element={
                    <PrivateRoute><GroupChatsPage /></PrivateRoute>
                } />

                <Route path="/canvas" element={
                    <PrivateRoute><Canvas /></PrivateRoute>
                } />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;