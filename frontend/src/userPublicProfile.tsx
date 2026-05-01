import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Avatar } from './Avatar';
import { TopBar } from './components/ui/topbar';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFriend, setIsFriend] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:8081';

    useEffect(() => {
        const profileId = Number(id);
        if (!profileId) {
            setLoading(false);
            setError(t('UPF_invalid_id'));
            return;
        }

        if (user?.id === profileId) {
            navigate('/profile', { replace: true });
            return;
        }

        const token = sessionStorage.getItem('token');
        if (!token) {
            setLoading(false);
            setError(t('UPF_not_auth'));
            return;
        }

        const loadProfile = async () => {
            setLoading(true);
            setError(null);
            setActionError(null);

            try {
                const [profileRes, friendsRes] = await Promise.all([
                    fetch(`${apiUrl}/users/${profileId}/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${apiUrl}/users/friends`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const profileData = await profileRes.json();
                if (!profileRes.ok) {
                    setError(profileData.error || t('UPF_failed_load'));
                    setProfile(null);
                } else {
                    setProfile(profileData);
                    setRequestPending(false);
                }

                const friendsData = await friendsRes.json();
                if (friendsRes.ok && Array.isArray(friendsData)) {
                    setIsFriend(friendsData.some((friend: { id: number }) => friend.id === profileId));
                } else {
                    setIsFriend(false);
                }
            } catch {
                setError(t('UPF_network_load'));
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
        if (!token) { setActionError(t('UPF_not_auth')); return; }

        setActionLoading(true);
        setActionError(null);

        try {
            const res = await fetch(`${apiUrl}/users/friend-request/send`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: profile.id }),
            });
            const data = await res.json();

            if (!res.ok) {
                const message = data.error || t('UPF_failed_send_req');
                if (message.toLowerCase().includes('already friends')) { setIsFriend(true); setRequestPending(false); return; }
                if (message.toLowerCase().includes('pending')) { setRequestPending(true); return; }
                setActionError(message);
                return;
            }

            setRequestPending(true);
        } catch {
            setActionError(t('UPF_network_send_req'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnfriend = async () => {
        if (!profile) return;
        const token = sessionStorage.getItem('token');
        if (!token) { setActionError(t('UPF_not_auth')); return; }

        setActionLoading(true);
        setActionError(null);

        try {
            const res = await fetch(`${apiUrl}/users/friends/${profile.id}/unfriend`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (!res.ok) { setActionError(data.error || t('UPF_failed_remove')); return; }
            setIsFriend(false);
            setRequestPending(false);
        } catch {
            setActionError(t('UPF_network_remove'));
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
        if (!token) { setActionError(t('UPF_not_auth')); return; }

        setActionLoading(true);
        setActionError(null);

        try {
            const res = await fetch(`${apiUrl}/users/${profile.id}/block`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (!res.ok) { setActionError(data.error || t('UPF_failed_block')); return; }
            setProfile((prev) => prev ? { ...prev, isBlocked: true } : prev);
            setIsFriend(false);
            setRequestPending(false);
        } catch {
            setActionError(t('UPF_network_block'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblock = async () => {
        if (!profile) return;
        const token = sessionStorage.getItem('token');
        if (!token) { setActionError(t('UPF_not_auth')); return; }

        setActionLoading(true);
        setActionError(null);

        try {
            const res = await fetch(`${apiUrl}/users/${profile.id}/unblock`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (!res.ok) { setActionError(data.error || t('UPF_failed_unblock')); return; }
            setProfile((prev) => prev ? { ...prev, isBlocked: false } : prev);
            setIsFriend(false);
            setRequestPending(false);
        } catch {
            setActionError(t('UPF_network_unblock'));
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="dashboard-shell">
            <TopBar />
            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>{t('UPF_prof')}</h1>
                    <p>{t('UPF_view')}</p>
                </div>

                <Card className="fade-up fade-up-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('UPF_public')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading && <p className="text-sm text-muted">{t('UPF_loading')}</p>}

                        {!loading && error && (
                            <div className="msg msg-error">{error}</div>
                        )}

                        {!loading && !error && actionError && (
                            <div className="msg msg-error">{actionError}</div>
                        )}

                        {!loading && !error && profile && (
                            <div className="flex flex-wrap items-start gap-4 rounded-md border border-border bg-surface2 p-4">
                                <Avatar avatar={profile.avatar} name={profile.name} size={72} />
                                <div className="min-w-[220px] flex-1">
                                    <p className="font-display text-xl font-semibold leading-tight text-ink">{profile.name}</p>
                                    <p className="mt-1 text-xs text-muted">{t('UPF_joined')} {new Date(profile.createdAt).toLocaleDateString()}</p>

                                    {profile.blockedByUser && (
                                        <p className="mt-3 text-sm text-red-400">{t('UPF_blocked')}</p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {profile.isBlocked ? (
                                            <Button variant="outline" size="sm" onClick={handleUnblock} disabled={actionLoading}>
                                                {actionLoading ? t('UPF_unblocking') : t('UPF_unblock')}
                                            </Button>
                                        ) : profile.blockedByUser ? null : isFriend ? (
                                            <>
                                                <Button size="sm" onClick={handleMessage} disabled={actionLoading}>
                                                    {t('UPF_message')}
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={handleUnfriend} disabled={actionLoading}>
                                                    {actionLoading ? t('UPF_removing') : t('UPF_remove')}
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={handleBlock} disabled={actionLoading}>
                                                    {t('UPF_block')}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="sm" onClick={handleAddFriend} disabled={actionLoading || requestPending}>
                                                    {requestPending ? t('UPF_request') : actionLoading ? t('UPF_sending') : t('UPF_add')}
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={handleBlock} disabled={actionLoading}>
                                                    {t('UPF_block2')}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default UserPublicProfilePage;
