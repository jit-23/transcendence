import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res  = await fetch(`${apiUrl}/users/login`, {
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
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res  = await fetch(`${apiUrl}/users/login2FA`, {
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