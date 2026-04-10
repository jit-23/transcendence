import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useTheme } from './ThemeContext';

export function     LoginForm() {
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [code, setCode]           = useState('');
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [needs2FA, setNeeds2FA]   = useState(false);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const { login }                 = useContext(AuthContext);
    const { theme, toggleTheme }    = useTheme();
    const navigate                  = useNavigate();
    const location                  = useLocation();

    useEffect(() => {
        const state = location.state as { needs2FA?: boolean; tempToken?: string } | null;
        if (state?.needs2FA && state.tempToken) {
            setNeeds2FA(true);
            setTempToken(state.tempToken);
            setError(null);
            navigate('/login', { replace: true });
        }
    }, [location.state, navigate]);

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
                {/* Theme toggle floats above card */}
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
                        <div className="msg msg-error" style={{ marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    {!needs2FA ? (
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
                                style={{ marginTop: 6 }}
                            >
                                {loading ? 'Signing in...' : 'Sign in →'}
                            </button>

                            {/* ── Divider ── */}
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                gap: 10, margin: '4px 0',
                                color: 'var(--ink3)', fontSize: '0.75rem',
                            }}>
                                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                or
                                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            </div>

                            {/* ── Google button ── */}
                            <a
                                href="http://localhost:8081/users/auth/google"
                                className="btn btn-ghost btn-full"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#4285F4" d="M45.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.1c-.5 2.7-2.1 5-4.4 6.5v5.4h7.1c4.2-3.8 6.6-9.5 6.6-16.4z"/>
                                    <path fill="#34A853" d="M24 46c6 0 11-2 14.7-5.4l-7.1-5.4c-2 1.3-4.5 2.1-7.6 2.1-5.8 0-10.8-3.9-12.5-9.2H4.1v5.6C7.8 41.8 15.4 46 24 46z"/>
                                    <path fill="#FBBC05" d="M11.5 28.1c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.6H4.1C2.8 17 2 20.4 2 24s.8 7 2.1 9.7l7.4-5.6z"/>
                                    <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C35 4 29.9 2 24 2 15.4 2 7.8 6.2 4.1 14.3l7.4 5.6C13.2 14.7 18.2 10.8 24 10.8z"/>
                                </svg>
                                Continue with Google
                            </a>

                            <a
                                href="http://localhost:8081/users/auth/42"
                                className="btn btn-ghost btn-full"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                }}
                            >
                                <span style={{
                                    display: 'inline-flex',
                                    width: 18,
                                    height: 18,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--border2)',
                                    borderRadius: 4,
                                    fontSize: '0.65rem',
                                    letterSpacing: '-0.02em',
                                }}>
                                    42
                                </span>
                                Continue with 42
                            </a>
                        </form>
                    ) : (
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