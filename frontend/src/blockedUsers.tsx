import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { Avatar } from './Avatar';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import TopBar from './components/ui/topbar';

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
            const res = await fetch('https://localhost:8081/users/blocks', {
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
            const res = await fetch(`https://localhost:8081/users/${userId}/unblock`, {
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
	<div className="mx-auto min-h-screen w-full">
	   	     <TopBar	/>
       	 <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

       	     <main className="space-y-5">
       	         <div>
       	             <h1 className="font-display text-3xl">Blocked Users</h1>
       	             <p className="mt-1 text-sm text-muted">Manage users you have blocked.</p>
       	         </div>

       	         <Card>
       	             <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
       	                 <CardTitle className="text-base">Blocked list</CardTitle>
       	                 <Button variant="outline" size="sm" onClick={loadBlockedUsers} disabled={loading}>
       	                     {loading ? 'Refreshing...' : 'Refresh'}
       	                 </Button>
       	             </CardHeader>
       	             <CardContent className="space-y-3">
       	                 {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}

       	                 {loading && <p className="text-sm text-muted">Loading blocked users...</p>}

       	                 {!loading && blockedUsers.length === 0 && (
       	                     <div className="rounded-md border border-border bg-surface2 px-4 py-5 text-center">
       	                         <p className="text-sm font-medium text-ink">You have no blocked users.</p>
       	                         <p className="mt-1 text-xs text-muted">When you block someone, they will appear here.</p>
       	                     </div>
       	                 )}

       	                 {!loading && blockedUsers.length > 0 && (
       	                     <div className="space-y-2">
       	                         {blockedUsers.map((blockedUser) => (
       	                             <div
       	                                 key={blockedUser.id}
       	                                 className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface2 p-2.5"
       	                             >
       	                                 <div className="flex items-center gap-3">
       	                                 <Avatar avatar={blockedUser.avatar} name={blockedUser.name} size={44} />
       	                                     <div>
       	                                         <p className="text-sm font-semibold text-ink">{blockedUser.name}</p>
       	                                         <p className="text-xs text-muted">{blockedUser.email}</p>
       	                                     </div>
       	                                 </div>
       	                                 <div className="flex items-center gap-2">
       	                                     <Button
       	                                         variant="outline"
       	                                         size="sm"
       	                                     onClick={() => navigate(`/users/${blockedUser.id}`)}
       	                                     >
       	                                         View profile
       	                                     </Button>
       	                                     <Button
       	                                         variant="outline"
       	                                         size="sm"
       	                                     onClick={() => handleUnblock(blockedUser.id)}
       	                                     disabled={actionLoadingId === blockedUser.id}
       	                                     >
       	                                         {actionLoadingId === blockedUser.id ? 'Unblocking...' : 'Unblock'}
       	                                     </Button>
       	                                 </div>
       	                             </div>
       	                         ))}
       	                     </div>
       	                 )}
       	             </CardContent>
       	         </Card>
       	     </main>
       	 </div>
	</div>
    );
}

export default BlockedUsersPage;
