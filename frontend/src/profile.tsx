import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Avatar, AvatarPicker } from './Avatar';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "./components/i18n.tsx";
import ThemeSwitch from "./ThemeContext";


export function ProfilePage() {
    const { user, refreshUser }  = useContext(AuthContext);
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
    const {t} = useTranslation()

    const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

    const saveAvatar = async (avatar: string) => {
        const res  = await fetch('http://localhost:8081/users/me/avatar', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ avatar }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save avatar');
        await refreshUser();
        setShowPicker(false);
        setSuccess('Avatar updated!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null); setError(null);

        if (newPassword && newPassword !== confirmNew) {
            setError("New passwords don't match");
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
            const res  = await fetch('http://localhost:8081/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
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
        <div className="dashboard-shell">
            {/* Topbar */}
            <header className="topbar">
                <div className="logo">
                    <div className="logo-mark">W</div>
                    whiteboard
                </div>
                <div className="topbar-right">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
                        {t("dashboard_prof")}
                    </button>
                    <ThemeSwitch />
                    <LanguageSwitcher onClick={changeLanguage} />
                </div>
            </header>

            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>{t("edit_profile")}</h1>
                    <p>{t("update_prof")}</p>
                </div>

                {/* Avatar row */}
                <div className="section-card fade-up fade-up-1">
                    {!showPicker ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Avatar avatar={user?.avatar} name={user?.name ?? '?'} size={60} />
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    letterSpacing: '-0.02em',
                                    marginBottom: 2,
                                }}>
                                    {user?.name}
                                </p>
                                <p style={{ color: 'var(--ink3)', fontSize: '0.78rem', marginBottom: 10 }}>
                                    {user?.email}
                                </p>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setShowPicker(true)}
                                >
                                    Change avatar
                                </button>
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
                </div>

                {/* Edit form */}
                <div className="section-card fade-up fade-up-2">
                    <div className="section-card-header">
                        <h3>{t("account_details")}</h3>
                    </div>

                    {success && <div className="msg msg-success" style={{ marginBottom: 18 }}>{success}</div>}
                    {error   && <div className="msg msg-error"   style={{ marginBottom: 18 }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="form-stack">
                        <div className="form-group">
                            <label>{t("username_prof")}</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>

                        <div className="divider" />

                        <div className="form-group">
                            <label>{t("new_pass_prof")}</label>
                            <input
                                type="password"
                                placeholder={t("leave_blank_prof")}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t("confirm_new_pass_prof")}</label>
                            <input
                                type="password"
                                placeholder={t("repeat_new_prof")}
                                value={confirmNew}
                                onChange={e => setConfirmNew(e.target.value)}
                            />
                        </div>

                        <div className="divider" />

                        <div className="form-group">
                            <label>
                                {t("curr_pass_prof")}{' '}
                                <span style={{ color: 'var(--danger)', fontSize: '0.72rem' }}>required</span>
                            </label>
                            <input
                                type="password"
                                placeholder={t("req_save_prof")}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? t("saving_change_prof") : t("save_change_prof")}
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                                {t("cancel_prof")}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;