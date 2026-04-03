import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { AccountCard } from "./components/dashboard/AccountCard";
import { QuickActionsCard } from "./components/dashboard/QuickActionsCard";
import { FriendRequestsCard } from "./components/dashboard/FriendRequestsCard";
import { FriendsCard } from "./components/dashboard/FriendsCard";
import { TwoFactorCard } from "./components/dashboard/TwoFactorCard";
import { EnableStep, Friend, ReceivedFriendRequest } from "./components/dashboard/types";
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
    const [canvasButtons, setCanvasButtons] = useState<number[]>([]);

    const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
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

    const handleAddCanvasButton = () => {
        setCanvasButtons((prev) => {
            if (prev.length >= 3) return prev;
            return [...prev, prev.length + 1];
        });
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
                        <Avatar avatar={user?.avatar} name={user?.name ?? '?'} size={24} />
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

                <AccountCard username={user?.name} email={user?.email} onEdit={() => navigate('/profile')} />

                <QuickActionsCard
                    canvasButtons={canvasButtons}
                    onSearchFriends={() => navigate('/search')}
                    onGroupChats={() => navigate('/groups')}
                    onAddCanvas={handleAddCanvasButton}
                    onOpenCanvas={(canvasNumber) => navigate(`/canvas?slot=${canvasNumber}`)}
                />

                <FriendRequestsCard
                    requests={requests}
                    loading={requestsLoading}
                    error={requestsError}
                    onRefresh={fetchRequests}
                    onDecide={decideRequest}
                />

                <FriendsCard
                    friends={friends}
                    loading={friendsLoading}
                    error={friendsError}
                    unfriendingId={unfriendingId}
                    onRefresh={fetchFriends}
                    onChat={(friendName) => navigate(`/chat?to=${encodeURIComponent(friendName)}`)}
                    onUnfriend={handleUnfriend}
                />

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
            </main>
        </div>
    );
}

export default Dashboard;