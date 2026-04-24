import { useContext, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useTheme } from './ThemeContext';
import { Avatar, AvatarPicker } from './Avatar';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { getPasswordChecks, getPasswordPolicyError } from './utils/passwordPolicy';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/i18n';

export function ProfilePage() {
    const {t} = useTranslation();
    const { user, refreshUser }  = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate               = useNavigate();

    const [showPicker, setShowPicker]           = useState(false);
    const [username, setUsername]               = useState(user?.name  ?? '');
    const [email, setEmail]                     = useState(user?.email ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]         = useState('');
    const [confirmNew, setConfirmNew]           = useState('');
    const [loading, setLoading]                 = useState(false);
    const [success, setSuccess]                 = useState<string | null>(null);
    const [error, setError]                     = useState<string | null>(null);

    const hasIdentityChanges = username !== (user?.name ?? '') || email !== (user?.email ?? '');
    const hasPasswordChange = newPassword.length > 0 || confirmNew.length > 0;
    const hasChanges = hasIdentityChanges || hasPasswordChange;
    const passwordMismatch = !!newPassword && newPassword !== confirmNew;
    const passwordChecks = getPasswordChecks(newPassword);
    const passwordPolicyError = newPassword ? getPasswordPolicyError(newPassword) : null;
    const usernameHasSpaces = /\s/.test(username.trim());
    const canSubmit = hasChanges && !passwordMismatch && !passwordPolicyError && !usernameHasSpaces && !!currentPassword.trim() && !loading;

    const saveAvatar = async (avatar: string) => {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await fetch("https://localhost:8081/users/me/avatar", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatar }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save avatar");

        await refreshUser();
        setShowPicker(false);
        setSuccess("Avatar updated!");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSuccess(null); setError(null);

        if (!hasChanges) {
            setError('No changes to save');
            return;
        }

        if (newPassword && newPassword !== confirmNew) {
            setError("New passwords don't match");
            return;
        }

        if (newPassword) {
            const policyError = getPasswordPolicyError(newPassword);
            if (policyError) {
                setError(policyError);
                return;
            }
        }

        if (/\s/.test(username.trim())) {
            setError('Username cannot contain spaces');
            return;
        }

        const body: Record<string, string> = { currentPassword };
        if (username !== user?.name)  body.username    = username;
        if (email    !== user?.email) body.email       = email;
        if (newPassword)              body.newPassword = newPassword;

        if (Object.keys(body).length === 1) {
            setError("Change at least one field");
            return;
        }

        setLoading(true);
        try {
            const token = sessionStorage.getItem("token");
            if (!token) {
                setError("Not authenticated. Please login again.");
                return;
            }

            const res  = await fetch('https://localhost:8081/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Update failed'); return; }
            await refreshUser();
            setSuccess('Profile updated successfully!');
            setCurrentPassword(''); setNewPassword(''); setConfirmNew('');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
                        whiteboard
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                            {t("dashboard_prof")}
                        </Button>
                        {/* <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                            {theme === 'dark' ? '☀' : '☾'}
                        </Button> */}
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            <main className="space-y-5">
                <div>
                    <h1 className="font-display text-3xl">{t("PF_settings")}</h1>
                    <p className="mt-1 text-sm text-muted">{t("PF_manage")}</p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t("PF_quick")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 sm:grid-cols-3">
                            <Button type="button" onClick={() => setShowPicker(true)}>
                                {t("PF_avatar")}
                            </Button>
                            <Button variant="outline" type="button" onClick={() => navigate('/profile/blocked')}>
                                {t("PF_blocked")}
                            </Button>
                            <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
                                {t("PF_dash")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        {!showPicker ? (
                            <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface2 p-3">
                                <Avatar avatar={user?.avatar} name={user?.name ?? '?'} size={60} />
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.08em] text-muted">{t("PF_curr_avatar")}</p>
                                    <p className="text-sm font-semibold text-ink">{user?.name}</p>
                                    <p className="text-xs text-muted">{user?.email}</p>
                                    <Button
                                        className="mt-2"
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => setShowPicker(true)}
                                    >
                                        {t("PF_avatar")}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <AvatarPicker
                                current={user?.avatar}
                                name={user?.name ?? '?'}
                                onSave={saveAvatar}
                                onCancel={() => setShowPicker(false)}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t("PF_account")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {success && <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{success}</div>}
                        {error   && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">{t("PF_identity")}</p>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label>{t("PF_username")}</Label>
                                        <Input
                                            type="text"
                                            value={username}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value.replace(/\s+/g, ''))}
                                        />
                                        <p className="text-xs text-muted">{t("SU_spaces_not")}</p>
                                        {usernameHasSpaces && <p className="text-xs text-red-400">{t("SU_user_cannot")}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Email</Label>
                                        <Input type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">{t("SU_password")}</p>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label>{t("PF_new_pass")}</Label>
                                        <Input
                                            type="password"
                                            placeholder={t("SU_pass_place")}
                                            value={newPassword}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                        />
                                        <div className="space-y-1 text-xs text-muted">
                                            <p>{t("PF_pass_rules")}</p>
                                            <ul className="grid gap-1 sm:grid-cols-2">
                                                <li className={passwordChecks.minLength ? 'text-emerald-400' : ''}>• {t("SU_8chars")}</li>
                                                <li className={passwordChecks.uppercase ? 'text-emerald-400' : ''}>• {t("SU_1up")}</li>
                                                <li className={passwordChecks.lowercase ? 'text-emerald-400' : ''}>• {t("SU_1low")}</li>
                                                <li className={passwordChecks.number ? 'text-emerald-400' : ''}>• {t("SU_1num")}</li>
                                                <li className={passwordChecks.symbol ? 'text-emerald-400' : ''}>• {t("SU_1sym")}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{t("confirm_new_pass")}</Label>
                                        <Input
                                            type="password"
                                            placeholder={t("PF_repeat_new")}
                                            value={confirmNew}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmNew(e.target.value)}
                                        />
                                        {passwordMismatch && <p className="text-xs text-red-400">{t("PF_pass_mismatch")}</p>}
                                        {passwordPolicyError && <p className="text-xs text-red-400">{passwordPolicyError}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">{t("PF_verification")}</p>
                                <div className="space-y-1.5">
                                    <Label>
                                        {t("PF_curr_pass")} <span className="text-red-400">{t("PF_pass_req")}</span>
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder={t("PF_req_save")}
                                        value={currentPassword}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" disabled={!canSubmit}>
                                    {loading ? t("PF_saving_change") : t("PF_save_change")}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                                    {t("PF_cancel")}
                                </Button>
                            </div>
                            {!hasChanges && <p className="text-xs text-muted">{t("PF_make")}</p>}
                            {hasChanges && !currentPassword.trim() && <p className="text-xs text-muted">{t("PF_curr_pass_save")}</p>}
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default ProfilePage;