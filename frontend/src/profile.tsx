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
import { TopBar } from './components/ui/topbar';
import { getPasswordChecks, getPasswordPolicyError } from './utils/passwordPolicy';

export function ProfilePage() {
    const { user, refreshUser }  = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate               = useNavigate();

    const [showPicker, setShowPicker]           = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
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

    const closePasswordModal = () => {
        setShowPasswordModal(false);
    };

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
        <div className="min-h-screen w-full">
            <TopBar />
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

                <main className="space-y-5">
                <div>
                    <h1 className="font-display text-3xl">Profile Settings</h1>
                    <p className="mt-1 text-sm text-muted">Manage your account details, avatar, and security preferences.</p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Quick actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button className="w-full" type="button" onClick={() => setShowPicker(true)}>
                                Change avatar
                            </Button>
                            <Button className="w-full" variant="outline" type="button" onClick={() => navigate('/profile/blocked')}>
                                Blocked users
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
                                    <p className="text-[11px] uppercase tracking-[0.08em] text-muted">Current avatar</p>
                                    <p className="text-sm font-semibold text-ink">{user?.name}</p>
                                    <p className="text-xs text-muted">{user?.email}</p>
                                    <Button
                                        className="mt-2"
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => setShowPicker(true)}
                                    >
                                        Change avatar
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
                        <CardTitle className="text-base">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {success && <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">{success}</div>}
                        {error   && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Identity</p>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label>Username</Label>
                                        <Input
                                            type="text"
                                            value={username}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value.replace(/\s+/g, ''))}
                                        />
                                        <p className="text-xs text-muted">Spaces aren’t allowed in usernames.</p>
                                        {usernameHasSpaces && <p className="text-xs text-red-400">Username cannot contain spaces.</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Email</Label>
                                        <Input type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            <div className="flex justify-start">
                                <Button type="button" variant="outline" onClick={() => setShowPasswordModal(true)}>
                                    Change password
                                </Button>
                            </div>

                            <div className="h-px bg-border" />

                            <div>
                                <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Verification</p>
                                <div className="space-y-1.5">
                                    <Label>
                                        Current Password <span className="text-red-400">required</span>
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="Required to save any changes"
                                        value={currentPassword}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" disabled={!canSubmit}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                                    Cancel
                                </Button>
                            </div>
                            {!hasChanges && <p className="text-xs text-muted">Make a change to enable saving.</p>}
                            {hasChanges && !currentPassword.trim() && <p className="text-xs text-muted">Enter your current password to save changes.</p>}
                        </form>
                    </CardContent>
                </Card>
            </main>
                </div>
            {showPasswordModal && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4" onClick={closePasswordModal}>
                    <Card className="w-full max-w-lg shadow-xl" onClick={(event) => event.stopPropagation()}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Change password</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="8+ chars, upper, lower, number, symbol"
                                    value={newPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                />
                                <div className="space-y-1 text-xs text-muted">
                                    <p>Password rules:</p>
                                    <ul className="grid gap-1 sm:grid-cols-2">
                                        <li className={passwordChecks.minLength ? 'text-emerald-400' : ''}>• 8+ characters</li>
                                        <li className={passwordChecks.uppercase ? 'text-emerald-400' : ''}>• 1 uppercase letter</li>
                                        <li className={passwordChecks.lowercase ? 'text-emerald-400' : ''}>• 1 lowercase letter</li>
                                        <li className={passwordChecks.number ? 'text-emerald-400' : ''}>• 1 number</li>
                                        <li className={passwordChecks.symbol ? 'text-emerald-400' : ''}>• 1 symbol</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Confirm New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Repeat new password"
                                    value={confirmNew}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmNew(e.target.value)}
                                />
                                {passwordMismatch && <p className="text-xs text-red-400">Passwords do not match.</p>}
                                {passwordPolicyError && <p className="text-xs text-red-400">{passwordPolicyError}</p>}
                            </div>

                            <div className="flex flex-wrap justify-end gap-2">
                                <Button type="button" variant="outline" onClick={closePasswordModal}>
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            </div>
    );
}

export default ProfilePage;