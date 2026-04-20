import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { LoginForm } from "./userLogin.tsx";
import { Dashboard } from "./dashboard";
import { SignupForm } from "./userSignup.tsx";
import { ProfilePage } from './profile.tsx';
import PrivateRoute from "./PrivateRoute";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { SearchFriends } from "./searchFriends.tsx";
import { ChatPage } from "./chat.tsx";
import Canvas from "./Canvas.tsx";
import { GroupChatsPage } from "./groupChats.tsx";
import { ConversationsPage } from "./conversations.tsx";
import { CanvasesPage } from "./Canvases.tsx";
import { OAuthCallback } from "./OAuthCallback.tsx";
import { UserPublicProfilePage } from "./userPublicProfile.tsx";
import { BlockedUsersPage } from "./blockedUsers.tsx";
import { PrivacyPolicyPage } from "./privacyPolicy.tsx";
import { TermsOfServicePage } from "./termsOfService.tsx";
import { Button } from "./components/ui/button";
import '../css/App.css';

function PublicRoute({ children }) {
    const { user, authReady } = useContext(AuthContext);
    if (!authReady)
        return null;
    if (user)
        return <Navigate to="/dashboard" />;
    return children;
}

function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center px-6 py-10">
            <div className="text-center">
                <p className="font-display text-7xl font-extrabold text-border2 leading-none">404</p>
                <p className="mt-3 mb-6 text-sm text-muted">This page doesn't exist.</p>
                <Button asChild variant="outline">
                    <Link to="/dashboard">← Go to dashboard</Link>
                </Button>
            </div>
        </div>
    );
}

function SiteFooter() {
    return (
        <footer className="site-footer">
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
        </footer>
    );
}

function Home() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen items-center justify-center px-6 py-10">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title="Toggle theme"
                className="fixed right-6 top-6"
            >
                {theme === 'dark' ? '☀' : '☾'}
            </Button>

            <div className="text-center w-full max-w-md">
                <div className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-semibold text-ink">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
                    whiteboard
                </div>

                <h1 className="mb-4 font-display text-4xl font-bold leading-tight">
                    Think together,<br />
                    <span className="text-ink2">in real time.</span>
                </h1>

                <p className="mb-9 text-sm leading-relaxed text-muted">
                    A shared canvas for your team — draw, plan,<br />
                    and collaborate without the noise.
                </p>

                <div className="flex justify-center gap-3">
                    <Button asChild>
                        <Link to="/signup">Get started →</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link to="/login">Sign in</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignupForm /></PublicRoute>} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/profile/blocked" element={<PrivateRoute><BlockedUsersPage /></PrivateRoute>} />
                <Route path="/users/:id" element={<PrivateRoute><UserPublicProfilePage /></PrivateRoute>} />
                <Route path="/search" element={<PrivateRoute><SearchFriends /></PrivateRoute>} />
                <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/conversations" element={<PrivateRoute><ConversationsPage /></PrivateRoute>} />
                <Route path="/Canvases" element={<PrivateRoute><CanvasesPage /></PrivateRoute>} />
                <Route path="/groups" element={<PrivateRoute><GroupChatsPage /></PrivateRoute>} />
                <Route path="/canvas" element={<PrivateRoute><Canvas /></PrivateRoute>} />
                <Route path="/oauth/callback" element={<OAuthCallback />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <SiteFooter />
        </BrowserRouter>
    );
}

export default App;
