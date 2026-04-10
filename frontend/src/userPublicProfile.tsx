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
};

export function UserPublicProfilePage() {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

            try {
                const res = await fetch(`http://localhost:8081/users/${profileId}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Failed to load profile');
                    setProfile(null);
                } else {
                    setProfile(data);
                }
            } catch {
                setError('Network error while loading profile');
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [id, navigate, user?.id]);

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
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default UserPublicProfilePage;
