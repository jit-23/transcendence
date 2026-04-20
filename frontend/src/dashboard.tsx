import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { FriendsCard } from "./components/dashboard/FriendsCard";
import { TwoFactorCard } from "./components/dashboard/TwoFactorCard";
import { Avatar } from "./Avatar";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

type EnableStep = "idle" | "scanning";

type ReceivedFriendRequest = {
    id: number;
    sender: {
        id: number;
        name: string;
        email: string;
    };
};

type Friend = {
    id: number;
    name: string;
    email: string;
};

type SearchResult = {
    id: number;
    name: string;
    email: string;
};

export function Dashboard() {
    const { user, logout }          = useContext(AuthContext);
    const { theme, toggleTheme }    = useTheme();
    const navigate                  = useNavigate();

    const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled ?? false);
    const [enableStep, setEnableStep]     = useState<EnableStep>("idle");
    const [qr, setQr]                     = useState<string | null>(null);
    const [confirmCode, setConfirmCode]   = useState("");
    const [showDisable, setShowDisable]   = useState(false);
    const [disableCode, setDisableCode]   = useState("");
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState<string | null>(null);
    const [requests, setRequests]         = useState<ReceivedFriendRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestsError, setRequestsError] = useState<string | null>(null);
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
    const [showRequestsPanel, setShowRequestsPanel] = useState(false);
    const [canvases, setCanvases] = useState<any[]>([]);
    const [canvasesLoading, setCanvasesLoading] = useState(false);
    const [canvasesError, setCanvasesError] = useState<string | null>(null);

    const requestsPanelRef = useRef<HTMLDivElement | null>(null);

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
            const res  = await fetch("http://localhost:8081/users/2fa/generate", { method: "POST", headers: authHeader() });
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
            const res  = await fetch("http://localhost:8081/users/2fa/confirm", {
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
            const res  = await fetch("http://localhost:8081/users/2fa/disable", {
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
        setRequestsError(null);
        try {
            const res = await fetch("http://localhost:8081/users/friend-request/received", {
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                setRequestsError(data.error || "Failed to load friend requests");
                setRequests([]);
            } else {
                setRequests(data);
            }
        } catch {
            setRequestsError("Network error while loading friend requests");
            setRequests([]);
        } finally {
            setRequestsLoading(false);
        }
    };

    const decideRequest = async (requestId: number, action: "accept" | "reject") => {
        setRequestsError(null);
        try {
            const res = await fetch(`http://localhost:8081/users/friend-request/${requestId}/${action}`, {
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

    const fetchFriends = async () => {
        setFriendsLoading(true);
        setFriendsError(null);
        try {
            const res = await fetch("http://localhost:8081/users/friends", {
                headers: authHeader(),
            });
            const data = await res.json();
            if (!res.ok) {
                setFriendsError(data.error || "Failed to load friends");
                setFriends([]);
            } else {
                setFriends(data);
            }
        } catch {
            setFriendsError("Network error while loading friends");
            setFriends([]);
        } finally {
            setFriendsLoading(false);
        }
    };

    const handleUnfriend = async (friendId: number) => {
        setFriendsError(null);
        setUnfriendingId(friendId);
        try {
            const res = await fetch(`http://localhost:8081/users/friends/${friendId}/unfriend`, {
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
            const res = await fetch(`http://localhost:8081/users/search?query=${encodeURIComponent(searchQuery)}`, {
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
            const res = await fetch("http://localhost:8081/users/friend-request/send", {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ receiverId }),
            });
            const data = await res.json();

            if (!res.ok) {
                setSearchError(data.error || "Failed to send request");
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
        if (!showRequestsPanel) return;

        const onClickOutside = (event: MouseEvent) => {
            if (requestsPanelRef.current && !requestsPanelRef.current.contains(event.target as Node)) {
                setShowRequestsPanel(false);
            }
        };

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowRequestsPanel(false);
            }
        };

        window.addEventListener("mousedown", onClickOutside);
        window.addEventListener("keydown", onEscape);

        return () => {
            window.removeEventListener("mousedown", onClickOutside);
            window.removeEventListener("keydown", onEscape);
        };
    }, [showRequestsPanel]);

    return (
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
                        whiteboard
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2 px-3 py-1.5 text-sm text-ink">
                            <Avatar avatar={user?.avatar} name={user?.name ?? '?'} size={24} />
                            {user?.name}
                        </div>

                        <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>Profile</Button>

                        <div className="relative" ref={requestsPanelRef}>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowRequestsPanel(prev => !prev)}
                                title="Friend requests"
                                aria-label="Friend requests"
                                className="relative"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                                    <path d="M12 22a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 22Zm7-5.2V11a7 7 0 1 0-14 0v5.8L3.6 18a1 1 0 0 0 .7 1.8h15.4a1 1 0 0 0 .7-1.8L19 16.8Z" />
                                </svg>
                                {requests.length > 0 && (
                                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-bg">
                                        {requests.length}
                                    </span>
                                )}
                            </Button>

                            {showRequestsPanel && (
                                <Card className="absolute right-0 z-30 mt-2 w-[320px] max-w-[90vw]">
                                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                                        <CardTitle className="text-base">Friend Requests</CardTitle>
                                        <Button variant="ghost" size="sm" onClick={fetchRequests} disabled={requestsLoading}>
                                            {requestsLoading ? '...' : 'Refresh'}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {requestsError && <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">{requestsError}</div>}

                                        {!requestsLoading && requests.length === 0 && <p className="text-sm text-muted">No pending requests.</p>}

                                        {requests.length > 0 && (
                                            <div className="space-y-2">
                                                {requests.map((request) => (
                                                    <div key={request.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface2 p-2.5">
                                                        <div>
                                                            <p className="text-sm font-semibold text-ink">{request.sender.name}</p>
                                                            <p className="text-xs text-muted">{request.sender.email}</p>
                                                        </div>
                                                        <div className="flex gap-1.5">
                                                            <Button size="sm" onClick={() => decideRequest(request.id, "accept")}>Accept</Button>
                                                            <Button size="sm" variant="outline" onClick={() => decideRequest(request.id, "reject")}>Reject</Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
                        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                            {theme === 'dark' ? '☀' : '☾'}
                        </Button>
                    </div>
                </div>
            </header>

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
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <Button onClick={openAddFriendModal}>Add friend</Button>
                            <Button variant="outline" onClick={() => navigate('/conversations')}>Open conversations</Button>
                            <Button variant="outline" onClick={() => navigate('/Canvases')}>Open canvases</Button>
                            <Button variant="outline" onClick={() => navigate('/profile/blocked')}>Blocked users</Button>
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
                            onRefresh={fetchFriends}
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
                            <CardTitle className="text-base">Add Friend</CardTitle>
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
                                                <Button size="sm" onClick={() => handleSendRequest(result.id)} disabled={pendingRequests.has(result.id)}>
                                                    {pendingRequests.has(result.id) ? 'Requested' : 'Invite'}
                                                </Button>
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
    );
}

export default Dashboard;