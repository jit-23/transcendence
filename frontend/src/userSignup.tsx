import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { Avatar, DEFAULT_AVATARS } from './Avatar';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { getPasswordChecks, getPasswordPolicyError } from './utils/passwordPolicy';

// ── Two-step signup: step 1 = credentials, step 2 = pick avatar ───────────────
type Step = 'credentials' | 'avatar';

export function SignupForm() {
    const apiUrl = import.meta.env.VITE_API_URL;

    const [step, setStep]         = useState<Step>('credentials');

    // Step 1
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Step 2
    const [selected, setSelected] = useState<string>('default:1');
    const [preview, setPreview]   = useState<string | null>(null);
    const fileRef                 = useRef<HTMLInputElement>(null);

    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const [oauthLoading, setOauthLoading] = useState<'google' | '42' | null>(null);

    const { theme, toggleTheme }  = useTheme();
    const navigate                = useNavigate();
    const passwordChecks = getPasswordChecks(password);
    const passwordPolicyError = password ? getPasswordPolicyError(password) : null;
    const passwordRequirements = [
        { label: '8+ characters', met: passwordChecks.minLength },
        { label: '1 uppercase letter', met: passwordChecks.uppercase },
        { label: '1 lowercase letter', met: passwordChecks.lowercase },
        { label: '1 number', met: passwordChecks.number },
        { label: '1 symbol', met: passwordChecks.symbol },
    ];
    const passwordRequirementsMet = passwordRequirements.filter((requirement) => requirement.met).length;

    // ── Step 1 → 2: validate fields then show avatar picker ──────────────────
    const handleNext = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        const normalizedUsername = username.trim();
        if (!normalizedUsername) return setError('Username is required');
        if (/\s/.test(normalizedUsername)) return setError('Username cannot contain spaces');
        if (!email.trim())    return setError('Email is required');
        const policyError = getPasswordPolicyError(password);
        if (policyError) return setError(policyError);
        setStep('avatar');
    };

    // ── File upload handler ───────────────────────────────────────────────────
    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
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
            const res  = await fetch(`${apiUrl}/users/signup`, {
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

    const handleOAuthRedirect = (provider: 'google' | '42') => {
		console.log("1");
		if (loading || oauthLoading) return;
        setError(null);
        setOauthLoading(provider);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
            <div className="absolute right-6 top-6">
                <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? '☀' : '☾'}
                </Button>
            </div>

            <Card className={`w-full ${step === 'avatar' ? 'max-w-lg' : 'max-w-md'}`}>
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-center gap-2 font-display text-lg font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
                        whiteboard
                    </div>
                    <div className="text-center">
                        <CardTitle>{step === 'credentials' ? 'Create your workspace account' : 'Choose your avatar'}</CardTitle>
                        <CardDescription className="mt-1">Fast setup with email or OAuth sign-up.</CardDescription>
                    </div>
                    <div className="mx-auto flex w-fit gap-2">
                        {(['credentials', 'avatar'] as Step[]).map((s, i) => (
                            <div
                                key={s}
                                className={`h-1.5 w-8 rounded-full transition-colors ${(step === s || (i === 0 && step === 'avatar')) ? 'bg-ink' : 'bg-border'}`}
                            />
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>}

                    {step === 'credentials' && (
                        <form onSubmit={handleNext} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Username</Label>
                                <Input
                                    type="text"
                                    placeholder="yourname"
                                    value={username}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value.replace(/\s+/g, ''))}
                                    required
                                    autoFocus
                                />
                                <p className="text-xs text-muted">Spaces aren’t allowed in usernames.</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Password</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="8+ chars, upper, lower, number, symbol"
                                        value={password}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Button>
                                </div>
                                <div className="space-y-1 text-xs text-muted">
                                    <div className="flex items-center justify-between gap-2">
                                        <p>Password checklist</p>
                                        <p>{passwordRequirementsMet}/5 met</p>
                                    </div>
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {passwordRequirements.map((requirement) => (
                                            <li
                                                key={requirement.label}
                                                className={`flex items-center gap-2 rounded-md border px-2 py-1.5 transition ${requirement.met ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-border bg-surface2 text-muted'}`}
                                            >
                                                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${requirement.met ? 'bg-emerald-500 text-bg' : 'bg-border text-ink'}`}>
                                                    {requirement.met ? '✓' : '•'}
                                                </span>
                                                <span>{requirement.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {passwordPolicyError && <p className="text-xs text-red-400">{passwordPolicyError}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading || !!oauthLoading}>Next →</Button>

                            <div className="flex items-center gap-3 text-xs text-muted">
                                <span className="h-px flex-1 bg-border" />
                                or
                                <span className="h-px flex-1 bg-border" />
                            </div>

                            <a
                                href={`${apiUrl}/users/auth/google`}
                                aria-disabled={loading || !!oauthLoading}
                                onClick={(e) => {
                                    if (loading || oauthLoading) {
                                        e.preventDefault();
                                        return;
                                    }
                                    handleOAuthRedirect('google');
                                }}
                                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface2 px-4 text-sm font-medium text-ink transition hover:bg-surface ${loading || oauthLoading ? 'pointer-events-none opacity-60' : ''}`}
                            >
                                <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#4285F4" d="M45.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.1c-.5 2.7-2.1 5-4.4 6.5v5.4h7.1c4.2-3.8 6.6-9.5 6.6-16.4z"/>
                                    <path fill="#34A853" d="M24 46c6 0 11-2 14.7-5.4l-7.1-5.4c-2 1.3-4.5 2.1-7.6 2.1-5.8 0-10.8-3.9-12.5-9.2H4.1v5.6C7.8 41.8 15.4 46 24 46z"/>
                                    <path fill="#FBBC05" d="M11.5 28.1c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.6H4.1C2.8 17 2 20.4 2 24s.8 7 2.1 9.7l7.4-5.6z"/>
                                    <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C35 4 29.9 2 24 2 15.4 2 7.8 6.2 4.1 14.3l7.4 5.6C13.2 14.7 18.2 10.8 24 10.8z"/>
                                </svg>
                                {oauthLoading === 'google' ? 'Redirecting to Google...' : 'Sign up with Google'}
                            </a>

                            <a
                                href={`${apiUrl}/users/auth/42`}
                                aria-disabled={loading || !!oauthLoading}
                                onClick={(e) => {
                                    if (loading || oauthLoading) {
                                        e.preventDefault();
                                        return;
                                    }
                                    handleOAuthRedirect('42');
                                }}
                                className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface2 px-4 text-sm font-semibold text-ink transition hover:bg-surface ${loading || oauthLoading ? 'pointer-events-none opacity-60' : ''}`}
                            >
                                <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-border text-[0.65rem]">42</span>
                                {oauthLoading === '42' ? 'Redirecting to 42...' : 'Sign up with 42'}
                            </a>
                            <p className="text-center text-xs text-muted">OAuth opens a secure provider page and returns you automatically.</p>
                        </form>
                    )}

                    {step === 'avatar' && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 rounded-md border border-border bg-surface2 p-3">
                                <Avatar avatar={selected} name={username} size={64} />
                                <div>
                                    <p className="text-sm font-semibold text-ink">{username}</p>
                                    <p className="text-xs text-muted">This is how others will see you.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Default Avatars</Label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(DEFAULT_AVATARS).map(key => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => { setSelected(key); setPreview(null); setError(null); }}
                                            className={`rounded-full border-2 p-1 transition ${selected === key ? 'border-ink' : 'border-transparent hover:border-border'}`}
                                        >
                                            <img src={DEFAULT_AVATARS[key]} alt={key} width={48} height={48} className="block rounded-full" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Upload Your Own</Label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFile}
                                    className="hidden"
                                />
                                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                                    Choose image (JPG / PNG, max 2MB)
                                </Button>
                                {preview && <p className="text-xs text-emerald-500">✓ Image loaded</p>}
                            </div>

                            <div className="flex gap-2">
                                <Button type="button" className="flex-1" onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create account →'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setStep('credentials'); setError(null); }} disabled={loading}>
                                    ← Back
                                </Button>
                            </div>
                        </div>
                    )}

                    <p className="pt-2 text-center text-sm text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="text-ink underline underline-offset-4">Sign in</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default SignupForm;