import { useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useTheme } from './ThemeContext';

function GoogleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}

export function LoginForm() {
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [code, setCode]           = useState('');
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [needs2FA, setNeeds2FA]   = useState(false);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);

    const { login }              = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate               = useNavigate();
    const [params]               = useSearchParams();

    // Handle redirect back from Google OAuth
    // /login?requires2FA=true&tempToken=xxx  → show 2FA step
    // /login?error=google_failed             → show error
    useEffect(() => {
        const urlError    = params.get('error');
        const url2FA      = params.get('requires2FA');
        const urlTempToken = params.get('tempToken');

        if (urlError)               setError('Google sign-in failed. Please try again.');
        if (url2FA && urlTempToken) { setNeeds2FA(true); setTempToken(urlTempToken); }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const res  = await fetch('http://localhost:8081/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.requires2FA) {
                setNeeds2FA(true);
                setTempToken(data.tempToken);
            } else if (res.ok && data.token) {
                await login(data.token);
                navigate('/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handle2FA = async () => {
        if (!tempToken) { setNeeds2FA(false); return; }
        if (!code) { setError('Enter your 6-digit code'); return; }
        setLoading(true); setError(null);
        try {
            const res  = await fetch('http://localhost:8081/users/login2FA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, tempToken }),
            });
            const data = await res.json();
            if (data.token) {
                await login(data.token);
                navigate('/dashboard');
            } else {
                setError(data.error || 'Invalid code');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="center">
            <div className="auth-wrap fade-up">
                <div className="auth-theme-btn">
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? '☀' : '☾'}
                    </button>
                </div>

                <div className="card">
                    <div className="auth-header">
                        <div className="logo">
                            <div className="logo-mark">W</div>
                            whiteboard
                        </div>
                        <p className="auth-subtitle">
                            {needs2FA ? 'Two-factor verification' : 'Sign in to your workspace'}
                        </p>
                    </div>

                    {error && (
                        <div className="msg msg-error" style={{ marginBottom: 16 }}>{error}</div>
                    )}

                    {!needs2FA ? (
                        <>
                            {/* ── Google button ── */}
                            <button
                                type="button"
                                className="btn btn-ghost btn-full"
                                onClick={() => { window.location.href = 'http://localhost:8081/auth/google'; }}
                                style={{ marginBottom: 16, gap: 10 }}
                            >
                                <GoogleIcon />
                                Continue with Google
                            </button>

                            {/* ── Divider ── */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div className="divider" style={{ flex: 1, margin: 0 }} />
                                <span style={{ color: 'var(--ink3)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                                    or sign in with email
                                </span>
                                <div className="divider" style={{ flex: 1, margin: 0 }} />
                            </div>

                            {/* ── Email / password form ── */}
                            <form onSubmit={handleLogin} className="form-stack">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-full"
                                    disabled={loading}
                                    style={{ marginTop: 4 }}
                                >
                                    {loading ? 'Signing in...' : 'Sign in →'}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* ── 2FA step ── */
                        <div className="form-stack">
                            <p style={{ color: 'var(--ink2)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                                Open your authenticator app and enter the 6-digit code.
                            </p>
                            <div className="form-group">
                                <label>Authentication Code</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="000 000"
                                    value={code}
                                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                    className="code-input"
                                    style={{ maxWidth: '100%' }}
                                />
                            </div>
                            <button
                                className="btn btn-primary btn-full"
                                onClick={handle2FA}
                                disabled={!tempToken || loading}
                            >
                                {loading ? 'Verifying...' : 'Verify →'}
                            </button>
                            <button
                                className="btn btn-ghost btn-full"
                                onClick={() => { setNeeds2FA(false); setError(null); setCode(''); }}
                            >
                                ← Back to login
                            </button>
                        </div>
                    )}

                    <div className="auth-footer">
                        Don't have an account?{' '}
                        <Link to="/signup">Create one</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}