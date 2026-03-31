import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";

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

    const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

    const authHeader = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

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

    useEffect(() => {
        fetchRequests();
        fetchFriends();
    }, []);

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
                        <div className="user-avatar">{initials}</div>
                        {user?.name}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
                        Profile
                    </button>
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

                {/* Account card */}
                <div className="section-card fade-up fade-up-1">
                    <div className="section-card-header">
                        <h3>Account</h3>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
                            Edit →
                        </button>
                    </div>
                    <div className="data-row">
                        <span className="data-label">Username</span>
                        <span className="data-value">{user?.name}</span>
                    </div>
                    <div className="data-row">
                        <span className="data-label">Email</span>
                        <span className="data-value">{user?.email}</span>
                    </div>
                </div>
				{/* Navigation shortcuts */}
				<div className="section-card fade-up fade-up-2">
                    <div className="section-card-header">
                        <h3>Quick Actions</h3>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/search')}>
                                Search Friends
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/canvas')}>
                                Canvas
                            </button>
                        </div>
                    </div>
                </div>
                <div className="section-card fade-up fade-up-2">
                    <div className="section-card-header">
                        <h3>Friend Requests</h3>
                        <button className="btn btn-ghost btn-sm" onClick={fetchRequests} disabled={requestsLoading}>
                            {requestsLoading ? "Loading..." : "Refresh"}
                        </button>
                    </div>

                    {requestsError && (
                        <div className="msg msg-error" style={{ marginBottom: 14 }}>{requestsError}</div>
                    )}

                    {!requestsLoading && requests.length === 0 && (
                        <p style={{ color: 'var(--ink3)', fontSize: '0.8rem' }}>
                            No pending requests.
                        </p>
                    )}

                    {requests.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    style={{
                                        padding: "10px 12px",
                                        border: "1px solid var(--border)",
                                        borderRadius: 8,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <div>
                                        <p style={{ marginBottom: 4, fontWeight: 600 }}>{request.sender.name}</p>
                                        <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{request.sender.email}</p>
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => decideRequest(request.id, "accept")}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => decideRequest(request.id, "reject")}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="section-card fade-up fade-up-2">
                    <div className="section-card-header">
                        <h3>My Friends</h3>
                        <button className="btn btn-ghost btn-sm" onClick={fetchFriends} disabled={friendsLoading}>
                            {friendsLoading ? "Loading..." : "Refresh"}
                        </button>
                    </div>

                    {friendsError && (
                        <div className="msg msg-error" style={{ marginBottom: 14 }}>{friendsError}</div>
                    )}

                    {!friendsLoading && friends.length === 0 && (
                        <p style={{ color: 'var(--ink3)', fontSize: '0.8rem' }}>
                            You do not have friends yet.
                        </p>
                    )}

                    {friends.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {friends.map((friend) => (
                                <div
                                    key={friend.id}
                                    style={{
                                        padding: "10px 12px",
                                        border: "1px solid var(--border)",
                                        borderRadius: 8,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 12,
                                    }}
                                >
                                    <div>
                                        <p style={{ marginBottom: 4, fontWeight: 600 }}>{friend.name}</p>
                                        <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{friend.email}</p>
                                    </div>

                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => navigate(`/chat?to=${encodeURIComponent(friend.name)}`)}
                                        >
                                            Chat
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleUnfriend(friend.id)}
                                            disabled={unfriendingId === friend.id}
                                        >
                                            {unfriendingId === friend.id ? "Removing..." : "Unfriend"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* 2FA card */}
                <div className="section-card fade-up fade-up-2">
                    <div className="section-card-header">
                        <h3>Two-Factor Authentication</h3>
                        <span className={`badge ${twoFAEnabled ? 'badge-on' : 'badge-off'}`}>
                            <span className="badge-dot" />
                            {twoFAEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>

                    {error && (
                        <div className="msg msg-error" style={{ marginBottom: 14 }}>{error}</div>
                    )}

                    {/* Idle — not enabled */}
                    {!twoFAEnabled && enableStep === "idle" && (
                        <>
                            <p style={{ color: 'var(--ink3)', fontSize: '0.8rem', marginBottom: 16, lineHeight: 1.6 }}>
                                Protect your account with a time-based one-time password from an authenticator app.
                            </p>
                            <button className="btn btn-ghost" onClick={handleGenerate} disabled={loading}>
                                {loading ? 'Loading...' : 'Enable 2FA'}
                            </button>
                        </>
                    )}

                    {/* Scanning — show QR */}
                    {enableStep === "scanning" && qr && (
                        <>
                            <div className="qr-warning">
                                <span>⚠</span>
                                <span>Scan this with Google Authenticator or Authy. <strong style={{ color: 'var(--ink)' }}>You won't see it again.</strong></span>
                            </div>
                            <div className="qr-box">
                                <img src={qr} alt="2FA QR Code" width={160} height={160} />
                            </div>
                            <p style={{ color: 'var(--ink3)', fontSize: '0.76rem', marginBottom: 10, marginTop: 4 }}>
                                Enter the 6-digit code from your app to confirm:
                            </p>
                            <div className="code-row">
                                <input
                                    type="text" inputMode="numeric" maxLength={6}
                                    placeholder="000000"
                                    value={confirmCode}
                                    onChange={e => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                                    className="code-input"
                                    autoFocus
                                />
                                <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Confirm'}
                                </button>
                                <button className="btn btn-ghost" disabled={loading}
                                        onClick={() => { setEnableStep("idle"); setQr(null); setConfirmCode(""); setError(null); }}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}

                    {/* Enabled — show disable option */}
                    {twoFAEnabled && !showDisable && (
                        <>
                            <p style={{ color: 'var(--ink3)', fontSize: '0.8rem', marginBottom: 16, lineHeight: 1.6 }}>
                                Your account is protected. An authenticator code is required at every login.
                            </p>
                            <button className="btn btn-danger"
                                    onClick={() => { setShowDisable(true); setError(null); }}>
                                Disable 2FA
                            </button>
                        </>
                    )}

                    {/* Disabling — require code */}
                    {twoFAEnabled && showDisable && (
                        <>
                            <p style={{ color: 'var(--ink3)', fontSize: '0.76rem', marginBottom: 10 }}>
                                Enter your current authenticator code to confirm:
                            </p>
                            <div className="code-row">
                                <input
                                    type="text" inputMode="numeric" maxLength={6}
                                    placeholder="000000"
                                    value={disableCode}
                                    onChange={e => setDisableCode(e.target.value.replace(/\D/g, ''))}
                                    className="code-input"
                                    autoFocus
                                />
                                <button className="btn btn-danger" onClick={handleDisable} disabled={loading}>
                                    {loading ? 'Disabling...' : 'Confirm'}
                                </button>
                                <button className="btn btn-ghost" disabled={loading}
                                        onClick={() => { setShowDisable(false); setDisableCode(""); setError(null); }}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;