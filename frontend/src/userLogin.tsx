import { useContext, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
// import { useTheme } from './ThemeContext';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/i18n';

export function     LoginForm() {
    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [code, setCode]           = useState('');
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [needs2FA, setNeeds2FA]   = useState(false);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState<string | null>(null);
    const [oauthLoading, setOauthLoading] = useState<'google' | '42' | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { login }                 = useContext(AuthContext);
    // const { theme, toggleTheme }    = useTheme();
    const navigate                  = useNavigate();
    const location                  = useLocation();
    const {t} = useTranslation();

    const sanitizeCode = (value: string) => value.replace(/\D/g, '').slice(0, 6);

    useEffect(() => {
        const state = location.state as { needs2FA?: boolean; tempToken?: string } | null;
        if (state?.needs2FA && state.tempToken) {
            setNeeds2FA(true);
            setTempToken(state.tempToken);
            setError(null);
            navigate('/login', { replace: true });
        }
    }, [location.state, navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const oauthError = params.get('error');

        const messageByError: Record<string, string> = {
            oauth_state: t("LI_sess_exp"),
            oauth_failed: t("LI_signin_fail"),
            oauth_misconfigured: t("LI_oauth_unav"),
        };

        if (oauthError && messageByError[oauthError]) {
            setError(messageByError[oauthError]);
        }
    }, [location.search]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
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
                setError(data.error || t("LI_login_fail"));
            }
        } catch {
            setError(t("LI_network_fail_try"));
        } finally {
            setLoading(false);
        }
    };

    const handle2FA = async () => {
        if (!tempToken) { setNeeds2FA(false); return; }
        if (!code) { setError(t("LI_enter_6")); return; }
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
                setError(data.error || t("LI_inv_code"));
            }
        } catch {
            setError(t("LI_network_fail"));
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthRedirect = (provider: 'google' | '42') => {
		console.log(`Initiating ${provider} OAuth flow...`);
		if (loading || oauthLoading) return;
        setError(null);
        setOauthLoading(provider);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
            <div className="absolute right-6 top-6">
                {/* <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? '☀' : '☾'}
                </Button> */}
                <LanguageSwitcher />
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-center gap-2 font-display text-lg font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
                        whiteboard
                    </div>
                    <div className="text-center">
                        <CardTitle>{needs2FA ? t("LI_two_auth"): t("LI_sign_in_workspace")}</CardTitle>
                        <CardDescription className="mt-1">{t("LI_secure")}</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {!needs2FA ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder={t("SU_your_email")}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>{t("SU_password")}</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        aria-label={showPassword ? t("SU_hide_pass") : t("SU_show_pass")}
                                    >
                                        {showPassword ? t("SU_hide") : t("SU_show")}
                                    </Button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading || !!oauthLoading}>
                                {loading ? t("LI_signing_in") : t("LI_sign_in_confirm")}
                            </Button>

                            <div className="flex items-center gap-3 text-xs text-muted">
                                <span className="h-px flex-1 bg-border" />
                                {t("LI_or")}
                                <span className="h-px flex-1 bg-border" />
                            </div>

                            <a
                                href={`${apiUrl}/users/auth/google`}
                                aria-disabled={loading || !!oauthLoading}
                                onClick={(e) => {
									console.log('Google OAuth button clicked');
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
                                {oauthLoading === 'google' ? t("SU_redir_google") : t("LI_continue_google")}
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
                                {oauthLoading === '42' ? t("SU_redir_42") : t("LI_continue_42")}
                            </a>
                            <p className="text-center text-xs text-muted">{t("LI_oauth_opens")}</p>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted">{t("LI_open_auth_app")}</p>
                            <div className="space-y-1.5">
                                <Label>{t("LI_auth_code")}</Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="000 000"
                                    value={code}
                                    onChange={e => setCode(sanitizeCode(e.target.value))}
                                    onPaste={(e) => {
                                        const pasted = sanitizeCode(e.clipboardData.getData('text'));
                                        if (pasted) {
                                            e.preventDefault();
                                            setCode(pasted);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && code.length === 6 && !loading) {
                                            e.preventDefault();
                                            void handle2FA();
                                        }
                                    }}
                                    autoFocus
                                />
                                <p className="text-xs text-muted">{t("LI_tip_code")}</p>
                            </div>
                            <Button className="w-full" type="button" onClick={handle2FA} disabled={!tempToken || loading}>
                                {loading ? t("LI_verifying") : t("LI_verify")}
                            </Button>
                            <Button
                                className="w-full"
                                variant="outline"
                                type="button"
                                onClick={() => { setNeeds2FA(false); setError(null); setCode(''); }}
                                disabled={loading}
                            >
                                {t("LI_back_to_login")}
                            </Button>
                        </div>
                    )}

                    <p className="pt-2 text-center text-sm text-muted">
                        {t("LI_dont_have_acc")}{' '}
                        <Link to="/signup" className="text-ink underline underline-offset-4">{t("LI_create_one")}</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}