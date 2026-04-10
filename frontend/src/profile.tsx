import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useTheme } from './ThemeContext';
import { Avatar, AvatarPicker } from './Avatar';

export function ProfilePage() {
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

    const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

    const saveAvatar = async (avatar: string) => {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await fetch("http://localhost:8081/users/me/avatar", {
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
    // const saveAvatar = async (avatar: string) => {
    //     const res = await fetch("http://localhost:8081/users/me/avatar", {
    //         method: "PUT",
    //         headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${token}`,
    //         },
    //         body: JSON.stringify({ avatar }),
    //     });
    //
    //     const data = await res.json();
    //     if (!res.ok) throw new Error(data.error || "Failed to save avatar");
    //
    //     await refreshUser();
    //     setShowPicker(false);
    //     setSuccess("Avatar updated!");
    // };

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
            const token = sessionStorage.getItem("token");
            if (!token) {
                setError("Not authenticated. Please login again.");
                return;
            }

            const res  = await fetch('http://localhost:8081/users/me', {
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
        <div className="dashboard-shell">
            {/* Topbar */}
            <header className="topbar">
                <div className="logo">
                    <div className="logo-mark">W</div>
                    whiteboard
                </div>
                <div className="topbar-right">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
                        ← Dashboard
                    </button>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? '☀' : '☾'}
                    </button>
                </div>
            </header>

            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>Edit Profile</h1>
                    <p>Update your account information and avatar.</p>
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
                        <h3>Account Details</h3>
                    </div>

                    {success && <div className="msg msg-success" style={{ marginBottom: 18 }}>{success}</div>}
                    {error   && <div className="msg msg-error"   style={{ marginBottom: 18 }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="form-stack">
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>

                        <div className="divider" />

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Repeat new password"
                                value={confirmNew}
                                onChange={e => setConfirmNew(e.target.value)}
                            />
                        </div>

                        <div className="divider" />

                        <div className="form-group">
                            <label>
                                Current Password{' '}
                                <span style={{ color: 'var(--danger)', fontSize: '0.72rem' }}>required</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Required to save any changes"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;