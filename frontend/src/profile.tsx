import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export function ProfilePage() {
    const { user, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername]           = useState(user?.name  ?? '');
    const [email, setEmail]                 = useState(user?.email ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]     = useState('');
    const [confirmNew, setConfirmNew]       = useState('');
    const [loading, setLoading]             = useState(false);
    const [success, setSuccess]             = useState<string | null>(null);
    const [error, setError]                 = useState<string | null>(null);

    const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

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
            setSuccess('Profile updated!');
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
                    <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}
                            style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                        ← Dashboard
                    </button>
                </div>
            </header>

            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>Edit Profile</h1>
                    <p>Update your account information.</p>
                </div>

                {/* Avatar card */}
                <div className="section-card fade-up fade-up-1"
                     style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 56, height: 56,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        color: '#0e0e0f',
                        flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                    <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}>
                            {user?.name}
                        </p>
                        <p style={{ color: 'var(--ink3)', fontSize: '0.78rem' }}>{user?.email}</p>
                    </div>
                </div>

                {/* Edit form */}
                <div className="section-card fade-up fade-up-2">
                    <div className="section-card-header">
                        <h3>Account Details</h3>
                    </div>

                    {success && <div className="msg msg-success" style={{ marginBottom: 16 }}>{success}</div>}
                    {error   && <div className="msg msg-error"   style={{ marginBottom: 16 }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="form-stack">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="divider" style={{ margin: '4px 0' }} />

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Repeat new password"
                                value={confirmNew}
                                onChange={(e) => setConfirmNew(e.target.value)}
                            />
                        </div>

                        <div className="divider" style={{ margin: '4px 0' }} />

                        <div className="form-group">
                            <label>
                                Current Password <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Required to save any changes"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" className="btn btn-ghost"
                                    onClick={() => navigate('/dashboard')}>
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