import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { Avatar, DEFAULT_AVATARS } from './Avatar';

// ── Two-step signup: step 1 = credentials, step 2 = pick avatar ───────────────
type Step = 'credentials' | 'avatar';

export function SignupForm() {
    const [step, setStep]         = useState<Step>('credentials');

    // Step 1
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');

    // Step 2
    const [selected, setSelected] = useState<string>('default:1');
    const [preview, setPreview]   = useState<string | null>(null);
    const fileRef                 = useRef<HTMLInputElement>(null);

    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const { theme, toggleTheme }  = useTheme();
    const navigate                = useNavigate();

    // ── Step 1 → 2: validate fields then show avatar picker ──────────────────
    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!username.trim()) return setError('Username is required');
        if (!email.trim())    return setError('Email is required');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        setStep('avatar');
    };

    // ── File upload handler ───────────────────────────────────────────────────
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Only JPG, PNG or WebP allowed'); return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be under 2MB'); return;
        }
        setError(null);
        const reader = new FileReader();
        reader.onload = ev => {
            const b64 = ev.target?.result as string;
            setPreview(b64);
            setSelected(b64);
        };
        reader.readAsDataURL(file);
    };

    // ── Final submit: send everything including avatar ────────────────────────
    const handleSubmit = async () => {
        setLoading(true); setError(null);
        try {
            const res  = await fetch('http://localhost:8081/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, avatar: selected }),
            });
            const data = await res.json();
            if (res.ok) {
                navigate('/login');
            } else {
                // If server rejects, go back to credentials step with error
                setStep('credentials');
                setError(data.error || 'Signup failed');
            }
        } catch {
            setError('Network error. Please try again.');
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

                <div className="card" style={{ maxWidth: step === 'avatar' ? 420 : 380 }}>
                    <div className="auth-header">
                        <div className="logo">
                            <div className="logo-mark">W</div>
                            whiteboard
                        </div>
                        <p className="auth-subtitle">
                            {step === 'credentials'
                                ? 'Create your workspace account'
                                : 'Choose your avatar'}
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
                        {(['credentials', 'avatar'] as Step[]).map((s, i) => (
                            <div key={s} style={{
                                width: 24, height: 4, borderRadius: 2,
                                background: step === s || (i === 0 && step === 'avatar')
                                    ? 'var(--ink)'
                                    : 'var(--border2)',
                                transition: 'background 0.2s ease',
                            }} />
                        ))}
                    </div>

                    {error && (
                        <div className="msg msg-error" style={{ marginBottom: 16 }}>{error}</div>
                    )}

                    {/* ── STEP 1: Credentials ── */}
                    {step === 'credentials' && (
                        <form onSubmit={handleNext} className="form-stack">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="yourname"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="at least 6 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-full"
                                style={{ marginTop: 6 }}
                            >
                                Next →
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
                                Sign up with Google
                            </a>
                        </form>
                    )}

                    {/* ── STEP 2: Avatar picker ── */}
                    {step === 'avatar' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                            {/* Live preview */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <Avatar avatar={selected} name={username} size={64} />
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>
                                        {username}
                                    </p>
                                    <p style={{ fontSize: '0.74rem', color: 'var(--ink3)' }}>
                                        This is how others will see you.
                                    </p>
                                </div>
                            </div>

                            {/* Default options */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 10 }}>
                                    Default Avatars
                                </label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {Object.keys(DEFAULT_AVATARS).map(key => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => { setSelected(key); setPreview(null); setError(null); }}
                                            style={{
                                                padding: 3,
                                                borderRadius: '50%',
                                                border: selected === key
                                                    ? '2px solid var(--ink)'
                                                    : '2px solid transparent',
                                                background: 'none',
                                                cursor: 'pointer',
                                                transition: 'border-color 0.15s ease',
                                            }}
                                        >
                                            <img
                                                src={DEFAULT_AVATARS[key]}
                                                alt={key}
                                                width={48} height={48}
                                                style={{ borderRadius: '50%', display: 'block' }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Upload own */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 10 }}>
                                    Upload Your Own
                                </label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFile}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => fileRef.current?.click()}
                                    style={{ fontSize: '0.78rem' }}
                                >
                                    Choose image (JPG / PNG, max 2MB)
                                </button>
                                {preview && (
                                    <p style={{ marginTop: 6, fontSize: '0.74rem', color: 'var(--success)' }}>
                                        ✓ Image loaded
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Creating account...' : 'Create account →'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => { setStep('credentials'); setError(null); }}
                                    disabled={loading}
                                >
                                    ← Back
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupForm;