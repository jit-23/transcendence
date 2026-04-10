import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useTheme } from './ThemeContext';
import { Avatar } from './Avatar';

type PublicProfile = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    createdAt: string;
    isBlocked: boolean;
    blockedByUser: boolean;
};

export function UserPublicProfilePage() {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFriend, setIsFriend] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        const profileId = Number(id);
        if (!profileId) {
            setLoading(false);
            setError('Invalid profile id');
            return;
        }

        if (user?.id === profileId) {
            navigate('/profile', { replace: true });
            return;
        }

        const token = sessionStorage.getItem('token');
        if (!token) {
            setLoading(false);
            setError('Not authenticated');
            return;
        }

        const loadProfile = async () => {
            setLoading(true);
            setError(null);
            setActionError(null);

            try {
                const [profileRes, friendsRes] = await Promise.all([
                    fetch(`http://localhost:8081/users/${profileId}/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch('http://localhost:8081/users/friends', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                const profileData = await profileRes.json();
                if (!profileRes.ok) {
                    setError(profileData.error || 'Failed to load profile');
                    setProfile(null);
                } else {
                    setProfile(profileData);
                    setRequestPending(false);
                }

                const friendsData = await friendsRes.json();
                if (friendsRes.ok && Array.isArray(friendsData)) {
                    const targetIsFriend = friendsData.some((friend: { id: number }) => friend.id === profileId);
                    setIsFriend(targetIsFriend);
                } else {
                    setIsFriend(false);
                }

            } catch {
                setError('Network error while loading profile');
                setProfile(null);
                setIsFriend(false);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [id, navigate, user?.id]);

    const handleAddFriend = async () => {
        if (!profile) return;
        const token = sessionStorage.getItem('token');
        if (!token) {
            setActionError('Not authenticated');
            return;
        }

        setActionLoading(true);
        setActionError(null);

        try {
            const res = await fetch('http://localhost:8081/users/friend-request/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiverId: profile.id }),
            });

            const data = await res.json();

            if (!res.ok) {
                const message = data.error || 'Failed to send friend request';
                if (message.toLowerCase().includes('already friends')) {
                    setIsFriend(true);
                    setRequestPending(false);
                    return;
                }
                if (message.toLowerCase().includes('pending')) {
                    setRequestPending(true);
                    return;
                }
                setActionError(message);
                return;
            }

            setRequestPending(true);
        } catch {
            setActionError('Network error while sending request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnfriend = async () => {
        if (!profile) return;
        const token = sessionStorage.getItem('token');
        if (!token) {
            setActionError('Not authenticated');
            return;
        }

        setActionLoading(true);
        setActionError(null);

        try {
            const res = await fetch(`http://localhost:8081/users/friends/${profile.id}/unfriend`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            if (!res.ok) {
                setActionError(data.error || 'Failed to remove friend');
                return;
            }

            setIsFriend(false);
            setRequestPending(false);
        } catch {
            setActionError('Network error while removing friend');
        } finally {
            setActionLoading(false);
        }
    };

    const handleMessage = () => {
        if (!profile) return;
        navigate(`/chat?friendId=${profile.id}&name=${encodeURIComponent(profile.name)}`);
    };

    const handleBlock = async () => {
        if (!profile) return;
        const token = sessionStorage.getItem('token');
        if (!token) {
            setActionError('Not authenticated');
            return;
        }

        setActionLoading(true);
        setActionError(null);

        try {
            const res = await fetch(`http://localhost:8081/users/${profile.id}/block`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            if (!res.ok) {
                setActionError(data.error || 'Failed to block user');
                return;
            }

            setProfile((prev: PublicProfile | null) => prev ? { ...prev, isBlocked: true } : prev);
            setIsFriend(false);
            setRequestPending(false);
        } catch {
            setActionError('Network error while blocking user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblock = async () => {
        if (!profile) return;
        const token = sessionStorage.getItem('token');
        if (!token) {
            setActionError('Not authenticated');
            return;
        }

        setActionLoading(true);
        setActionError(null);

        try {
            const res = await fetch(`http://localhost:8081/users/${profile.id}/unblock`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            if (!res.ok) {
                setActionError(data.error || 'Failed to unblock user');
                return;
            }

            setProfile((prev: PublicProfile | null) => prev ? { ...prev, isBlocked: false } : prev);
            // Reset friendship state after unblock
            setIsFriend(false);
            setRequestPending(false);
        } catch {
            setActionError('Network error while unblocking user');
        } finally {
            setActionLoading(false);
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
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                        ← Back
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
                    <h1>User Profile</h1>
                    <p>View profile information</p>
                </div>

                <div className="section-card fade-up fade-up-1">
                    {loading && <p style={{ color: 'var(--ink3)' }}>Loading profile...</p>}

                    {!loading && error && (
                        <div className="msg msg-error">{error}</div>
                    )}

                    {!loading && !error && actionError && (
                        <div className="msg msg-error" style={{ marginBottom: 12 }}>{actionError}</div>
                    )}

                    {!loading && !error && profile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Avatar avatar={profile.avatar} name={profile.name} size={72} />
                            <div>
                                <p style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '1.15rem',
                                    letterSpacing: '-0.02em',
                                    marginBottom: 6,
                                }}>
                                    {profile.name}
                                </p>
                                <p style={{ color: 'var(--ink3)', fontSize: '0.85rem', marginBottom: 6 }}>
                                    {profile.email}
                                </p>
                                <p style={{ color: 'var(--ink3)', fontSize: '0.75rem' }}>
                                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                                </p>

                                {profile.blockedByUser && (
                                    <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 10 }}>
                                        You are blocked by this user.
                                    </p>
                                )}

                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    {profile.isBlocked ? (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={handleUnblock}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Unblocking...' : 'Unblock'}
                                        </button>
                                    ) : profile.blockedByUser ? null : isFriend ? (
                                        <>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={handleMessage}
                                                disabled={actionLoading}
                                            >
                                                Message
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={handleUnfriend}
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Removing...' : 'Remove friend'}
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={handleBlock}
                                                disabled={actionLoading}
                                            >
                                                Block
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={handleAddFriend}
                                                disabled={actionLoading || requestPending}
                                            >
                                                {requestPending ? '✓ Requested' : (actionLoading ? 'Sending...' : 'Add friend')}
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={handleBlock}
                                                disabled={actionLoading}
                                            >
                                                Block
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default UserPublicProfilePage;
