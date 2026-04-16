import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { Avatar } from './Avatar';

type BlockedUser = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    createdAt: string;
    blockedAt: string;
};

export function BlockedUsersPage() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadBlockedUsers = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:8081/users/blocks', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to load blocked users');
                setBlockedUsers([]);
            } else {
                setBlockedUsers(Array.isArray(data) ? data : []);
            }
        } catch {
            setError('Network error while loading blocked users');
            setBlockedUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    const handleUnblock = async (userId: number) => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setError('Not authenticated');
            return;
        }

        setActionLoadingId(userId);
        setError(null);

        try {
            const res = await fetch(`http://localhost:8081/users/${userId}/unblock`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to unblock user');
                return;
            }

            setBlockedUsers((prev: BlockedUser[]) => prev.filter((blockedUser: BlockedUser) => blockedUser.id !== userId));
        } catch {
            setError('Network error while unblocking user');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="dashboard-shell">
            <header className="topbar">
                <div className="logo">
                    <div className="logo-mark">W</div>
                    whiteboard
                </div>
                <div className="topbar-right">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
                        ← Profile
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
                        Dashboard
                    </button>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? '☀' : '☾'}
                    </button>
                </div>
            </header>

            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>Blocked Users</h1>
                    <p>Manage users you have blocked.</p>
                </div>

                <div className="section-card fade-up fade-up-1">
                    {error && <div className="msg msg-error" style={{ marginBottom: 12 }}>{error}</div>}

                    {loading && <p style={{ color: 'var(--ink3)' }}>Loading blocked users...</p>}

                    {!loading && blockedUsers.length === 0 && (
                        <p style={{ color: 'var(--ink3)' }}>You have no blocked users.</p>
                    )}

                    {!loading && blockedUsers.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {blockedUsers.map((blockedUser) => (
                                <div
                                    key={blockedUser.id}
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid var(--border)',
                                        borderRadius: 8,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 12,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Avatar avatar={blockedUser.avatar} name={blockedUser.name} size={44} />
                                        <div>
                                            <p style={{ marginBottom: 4, fontWeight: 600 }}>{blockedUser.name}</p>
                                            <p style={{ color: 'var(--ink3)', fontSize: '0.8rem' }}>{blockedUser.email}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => navigate(`/users/${blockedUser.id}`)}
                                        >
                                            View profile
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleUnblock(blockedUser.id)}
                                            disabled={actionLoadingId === blockedUser.id}
                                        >
                                            {actionLoadingId === blockedUser.id ? 'Unblocking...' : 'Unblock'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default BlockedUsersPage;
