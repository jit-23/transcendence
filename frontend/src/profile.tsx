import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export function ProfilePage() {
    const { user, refreshUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername]         = useState(user?.name  ?? '');
    const [email, setEmail]               = useState(user?.email ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]   = useState('');
    const [confirmNew, setConfirmNew]     = useState('');

    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState<string | null>(null);
    const [error, setError]       = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);

        if (newPassword && newPassword !== confirmNew) {
            setError("New passwords don't match");
            return;
        }

        const body: Record<string, string> = { currentPassword };
        if (username !== user?.name)   body.username    = username;
        if (email    !== user?.email)  body.email       = email;
        if (newPassword)               body.newPassword = newPassword;

        if (Object.keys(body).length === 1) {
            setError("Nothing to update — change at least one field");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:8081/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Update failed');
                return;
            }

            await refreshUser();
            setSuccess('Profile updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNew('');

        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <form onSubmit={handleSubmit}>
                <h2>Edit Profile</h2>

                {success && (
                    <p style={{ color: '#4caf50', margin: 0, textAlign: 'center' }}>{success}</p>
                )}
                {error && (
                    <p style={{ color: '#f44336', margin: 0, textAlign: 'center' }}>{error}</p>
                )}

                <label>Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>New Password</label>
                <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <label>Confirm New Password</label>
                <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmNew}
                    onChange={(e) => setConfirmNew(e.target.value)}
                />

                <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '4px 0' }} />

                <label>Current Password <span style={{ color: '#f44336' }}>*</span></label>
                <input
                    type="password"
                    placeholder="Required to save changes"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    style={{ background: '#222' }}
                >
                    ← Back to Dashboard
                </button>
            </form>
        </div>
    );
}

export default ProfilePage;