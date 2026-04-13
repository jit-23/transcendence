import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { FriendsCard } from "./components/dashboard/FriendsCard";
import { TwoFactorCard } from "./components/dashboard/TwoFactorCard";
import { Avatar } from "./Avatar";

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
        <div className="dashboard-shell">
            {/* ── Topbar ── */}
            <header className="topbar">
                <div className="logo">
                    <div className="logo-mark">W</div>
                    whiteboard
                </div>
                <div className="topbar-right">
                    <div className="user-chip">
                        <Avatar avatar={user?.avatar} name={user?.name ?? '?'} size={24} />
                        {user?.name}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
                        Profile
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={openAddFriendModal}>
                        Add friend
                    </button>
                    <div className="topbar-notification" ref={requestsPanelRef}>
                        <button
                            className="notification-bell-btn"
                            onClick={() => setShowRequestsPanel(prev => !prev)}
                            title="Friend requests"
                            aria-label="Friend requests"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 22a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 22Zm7-5.2V11a7 7 0 1 0-14 0v5.8L3.6 18a1 1 0 0 0 .7 1.8h15.4a1 1 0 0 0 .7-1.8L19 16.8Z" />
                            </svg>
                            {requests.length > 0 && <span className="notification-badge">{requests.length}</span>}
                        </button>

                        {showRequestsPanel && (
                            <div className="notification-panel">
                                <div className="notification-panel-header">
                                    <h3>Friend Requests</h3>
                                    <button className="btn btn-ghost btn-sm" onClick={fetchRequests} disabled={requestsLoading}>
                                        {requestsLoading ? "..." : "Refresh"}
                                    </button>
                                </div>

                                {requestsError && <div className="msg msg-error" style={{ marginBottom: 10 }}>{requestsError}</div>}

                                {!requestsLoading && requests.length === 0 && (
                                    <p className="notification-empty">No pending requests.</p>
                                )}

                                {requests.length > 0 && (
                                    <div className="notification-list">
                                        {requests.map((request) => (
                                            <div key={request.id} className="notification-item">
                                                <div>
                                                    <p style={{ marginBottom: 4, fontWeight: 600 }}>{request.sender.name}</p>
                                                    <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{request.sender.email}</p>
                                                </div>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button className="btn btn-primary btn-sm" onClick={() => decideRequest(request.id, "accept")}>Accept</button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => decideRequest(request.id, "reject")}>Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={logout}>
                        Sign out
                    </button>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? '☀' : '☾'}
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>Welcome back, {user?.name}</h1>
                    <p>Manage your account and security settings.</p>
                </div>

                <div className="dashboard-layout">
                    <section className="dashboard-main-column">

                        <div className="section-card fade-up fade-up-2">
                            <div className="section-card-header" style={{ marginBottom: 0 }}>
                                <h3>Talk to friends</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/conversations')}>
                                    Open
                                </button>
                            </div>
                        </div>

                        <div className="section-card fade-up fade-up-2">
                            <div className="section-card-header" style={{ marginBottom: 0 }}>
                                <h3>Plan Your Projects</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/Canvases')}>
                                    Open
                                </button>
                            </div>
                        </div>

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

                    <aside className="dashboard-friends-column">
                        <FriendsCard
                            friends={friends}
                            loading={friendsLoading}
                            error={friendsError}
                            unfriendingId={unfriendingId}
                            onRefresh={fetchFriends}
                            onChat={(friend) => navigate(`/chat?friendId=${friend.id}&name=${encodeURIComponent(friend.name)}`)}
                            onUnfriend={handleUnfriend}
                        />
                    </aside>
                </div>
            </main>

            {showAddFriendModal && (
                <div className="dashboard-modal-backdrop" onClick={closeAddFriendModal}>
                    <div className="dashboard-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="dashboard-modal-header">
                            <h3>Add Friend</h3>
                            <button className="btn btn-ghost btn-sm" onClick={closeAddFriendModal}>
                                Close
                            </button>
                        </div>

                        <form className="dashboard-modal-search" onSubmit={handleSearchUsers}>
                            <input
                                type="text"
                                placeholder="Search by username or email"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                autoFocus
                            />
                            <button className="btn btn-primary btn-sm" type="submit" disabled={searchLoading}>
                                {searchLoading ? "Searching..." : "Search"}
                            </button>
                        </form>

                        {searchError && <div className="msg msg-error">{searchError}</div>}

                        {searched && !searchLoading && searchResults.length === 0 && (
                            <p className="dashboard-modal-empty">No users found.</p>
                        )}

                        {searchResults.length > 0 && (
                            <div className="dashboard-modal-results">
                                {searchResults.map((result) => (
                                    <div key={result.id} className="dashboard-modal-result-item">
                                        <div>
                                            <p style={{ fontWeight: 600, marginBottom: 4 }}>{result.name}</p>
                                            <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{result.email}</p>
                                        </div>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleSendRequest(result.id)}
                                            disabled={pendingRequests.has(result.id)}
                                        >
                                            {pendingRequests.has(result.id) ? "Requested" : "Invite"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;