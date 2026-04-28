import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { FriendsCard } from "./components/dashboard/FriendsCard";
import { TwoFactorCard } from "./components/dashboard/TwoFactorCard";
import { Friend } from "./components/dashboard/types";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { TopBar } from "./components/ui/topbar";

type EnableStep = "idle" | "scanning";

type SearchResult = {
    id: number;
    name: string;
    email: string;
};

export function Dashboard() {
    const { user }          = useContext(AuthContext);
    const navigate                  = useNavigate();

    const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled ?? false);
    const [enableStep, setEnableStep]     = useState<EnableStep>("idle");
    const [qr, setQr]                     = useState<string | null>(null);
    const [confirmCode, setConfirmCode]   = useState("");
    const [showDisable, setShowDisable]   = useState(false);
    const [disableCode, setDisableCode]   = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState<string | null>(null);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState<string | null>(null);
    const [unfriendingId, setUnfriendingId] = useState<number | null>(null);
    
	
    
	const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<Set<number>>(new Set());
    const [canvases, setCanvases] = useState<any[]>([]);
    const [canvasesLoading, setCanvasesLoading] = useState(false);
    const [canvasesError, setCanvasesError] = useState<string | null>(null);

    const presenceSocketRef = useRef<Socket | null>(null);

    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

    const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 10000) => {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

        try {
            return await fetch(input, { ...init, signal: controller.signal });
        } finally {
            window.clearTimeout(timeout);
        }
    };

    const handleGenerate = async () => {
        setLoading(true); setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res  = await fetch(`${apiUrl}/users/2fa/generate`, { method: "POST", headers: authHeader() });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setQr(data.qr); setEnableStep("scanning");
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    const handleConfirm = async () => {
        if (!confirmCode) return setError("Enter the 6-digit code");
        setLoading(true); setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res  = await fetch(`${apiUrl}/users/2fa/confirm`, {
                method: "POST", headers: authHeader(), body: JSON.stringify({ code: confirmCode }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setTwoFAEnabled(true); setEnableStep("idle"); setQr(null); setConfirmCode("");
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    const handleDisable = async () => {
        if (!disableCode) return setError("Enter your current 2FA code");
        setLoading(true); setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res  = await fetch(`${apiUrl}/users/2fa/disable`, {
                method: "POST", headers: authHeader(), body: JSON.stringify({ code: disableCode }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setTwoFAEnabled(false); setShowDisable(false); setDisableCode("");
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    const fetchRequests = async () => {
        setRequestsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/users/friend-request/received`, {
                headers: authHeader(),
            });
            await res.json();
        } catch {
        } finally {
            setRequestsLoading(false);
        }
    };

    const decideRequest = async (requestId: number, action: "accept" | "reject") => {
        setRequestsError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/users/friend-request/${requestId}/${action}`, {
                method: "POST",
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                setRequestsError(data.error || "Failed to update request");
                return;
            }
            setRequests(prev => prev.filter(request => request.id !== requestId));
            if (action === "accept") {
                fetchFriends();
            }
        } catch {
            setRequestsError("Network error while updating request");
        }
    };

    const fetchFriends = async (silent = false) => {
        if (!silent) {
            setFriendsLoading(true);
            setFriendsError(null);
        }
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/users/friends`, {
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                if (!silent) {
                    setFriendsError(data.error || "Failed to load friends");
                    setFriends([]);
                }
            } else {
                setFriends(data);
            }
        } catch {
            if (!silent) {
                setFriendsError("Network error while loading friends");
                setFriends([]);
            }
        } finally {
            if (!silent) {
                setFriendsLoading(false);
            }
        }
    };

    const handleUnfriend = async (friendId: number) => {
        setFriendsError(null);
        setUnfriendingId(friendId);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/users/friends/${friendId}/unfriend`, {
                method: "POST",
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                setFriendsError(data.error || "Failed to remove friend");
                return;
            }

            setFriends(prev => prev.filter(friend => friend.id !== friendId));
        } catch {
            setFriendsError("Network error while removing friend");
        } finally {
            setUnfriendingId(null);
        }
    };


    const openAddFriendModal = () => {
        setShowAddFriendModal(true);
        setSearchQuery("");
        setSearchResults([]);
        setSearchError(null);
        setSearched(false);
    };

    const closeAddFriendModal = () => {
        setShowAddFriendModal(false);
        setSearchLoading(false);
    };

    const handleSearchUsers = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!searchQuery.trim()) {
            setSearchError("Enter a username or email to search");
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        setSearched(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/users/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: authHeader(),
            });
            const data = await res.json();

            if (!res.ok) {
                setSearchError(data.error || "Search failed");
                setSearchResults([]);
                return;
            }

            const filtered = data.filter((result: SearchResult) => result.id !== user?.id);
            setSearchResults(filtered);
        } catch {
            setSearchError("Network error during search");
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSendRequest = async (receiverId: number) => {
        setPendingRequests(prev => new Set(prev).add(receiverId));
        setSearchError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/users/friend-request/send`, {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ receiverId }),
            });
            const data = await res.json();

            if (!res.ok) {
                const msg = (data && data.error) || "Failed to send request";
                // If backend reports user is already a friend, refresh the friends list
                if (res.status === 400 && /friend/i.test(msg)) {
                    fetchFriends();
                }

                setSearchError(msg);
                setPendingRequests(prev => {
                    const updated = new Set(prev);
                    updated.delete(receiverId);
                    return updated;
                });
            }
        } catch {
            setSearchError("Network error");
            setPendingRequests(prev => {
                const updated = new Set(prev);
                updated.delete(receiverId);
                return updated;
            });
        }
    };
    useEffect(() => {
        fetchRequests();
        fetchFriends();
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            void fetchFriends();
        }, 15000);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!user?.name) {
            if (presenceSocketRef.current) {
                presenceSocketRef.current.disconnect();
                presenceSocketRef.current = null;
            }
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
        const socket = io(apiUrl, {
            auth: { username: user.name },
            withCredentials: true,
        });

        presenceSocketRef.current = socket;

        socket.on("friend-presence", ({ userId, online }) => {
            const normalizedUserId = Number(userId);
            if (!Number.isInteger(normalizedUserId)) return;

            setFriends((prev) =>
                prev.map((friend) =>
                    friend.id === normalizedUserId ? { ...friend, online: Boolean(online) } : friend,
                ),
            );
        });

        return () => {
            socket.disconnect();
            if (presenceSocketRef.current === socket) {
                presenceSocketRef.current = null;
            }
        };
    }, [user?.name]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            void fetchFriends(true);
        }, 5000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        if (!showAddFriendModal) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeAddFriendModal();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [showAddFriendModal]);

    useEffect(() => {
        return;
    }, []);

    return (
    	<div className="min-h-screen w-full">
            <TopBar />
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <main className="space-y-6">
                <div>
                    <h1 className="font-display text-3xl">Welcome back, {user?.name}</h1>
                    <p className="mt-1 text-sm text-muted">Quick actions, social updates, and account security in one place.</p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Quick actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-3 text-xs text-muted">Start by adding a friend or jump into your active spaces.</p>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            <Button onClick={openAddFriendModal}>Search for People</Button>
                            <Button variant="outline" onClick={() => navigate('/conversations')}>Open conversations</Button>
                            <Button variant="outline" onClick={() => navigate('/Canvases')}>Open canvases</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                    <section>
                        <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Security</p>
                        <TwoFactorCard
                            twoFAEnabled={twoFAEnabled}
                            enableStep={enableStep}
                            qr={qr}
                            confirmCode={confirmCode}
                            disableCode={disableCode}
                            showDisable={showDisable}
                            loading={loading}
                            error={error}
                            setConfirmCode={setConfirmCode}
                            setDisableCode={setDisableCode}
                            setEnableStep={setEnableStep}
                            setQr={setQr}
                            setShowDisable={setShowDisable}
                            setError={setError}
                            onGenerate={handleGenerate}
                            onConfirm={handleConfirm}
                            onDisable={handleDisable}
                        />
                    </section>

                    <aside>
                        <p className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Social</p>
                        <FriendsCard
                            friends={friends}
                            loading={friendsLoading}
                            error={friendsError}
                            unfriendingId={unfriendingId}
                            onRefresh={() => void fetchFriends()}
                            onViewProfile={(friendId) => navigate(`/users/${friendId}`)}
                            onChat={(friend) => navigate(`/chat?friendId=${friend.id}&name=${encodeURIComponent(friend.name)}`)}
                            onUnfriend={handleUnfriend}
                        />
                    </aside>
                </div>
            </main>

            {showAddFriendModal && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4" onClick={closeAddFriendModal}>
                    <Card className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-base">Search for People</CardTitle>
                            <Button variant="ghost" size="sm" onClick={closeAddFriendModal}>Close</Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <form className="flex gap-2" onSubmit={handleSearchUsers}>
                                <input
                                    type="text"
                                    placeholder="Search by username or email"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    autoFocus
                                    className="flex h-9 w-full rounded-md border border-border bg-surface2 px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                                />
                                <Button size="sm" type="submit" disabled={searchLoading}>{searchLoading ? 'Searching...' : 'Search'}</Button>
                            </form>
                            {requestsLoading && <p className="text-sm text-muted">Loading pending requests...</p>}
                            <p className="text-xs text-muted">Invite someone by username or email. They’ll receive a friend request.</p>

                            {searchError && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">{searchError}</div>}

                            {searched && !searchLoading && searchResults.length === 0 && <p className="text-sm text-muted">No users found.</p>}

                            {searchResults.length > 0 && (
                                <div className="space-y-2">
                                    {searchResults.map((result) => (
                                        <div key={result.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface2 p-2.5">
                                            <div>
                                                <p className="text-sm font-semibold text-ink">{result.name}</p>
                                                <p className="text-xs text-muted">{result.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/users/${result.id}`)}>Profile</Button>
                                                {friends.some(f => f.id === result.id) ? (
                                                    <Button size="sm" variant="ghost" disabled>(Friend)</Button>
                                                ) : (
                                                    <Button size="sm" onClick={() => handleSendRequest(result.id)} disabled={pendingRequests.has(result.id)}>
                                                        {pendingRequests.has(result.id) ? 'Requested' : 'Invite'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        	</div>
		</div>
    );
}

export default Dashboard;