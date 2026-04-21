import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import ThemeSwitch from "./ThemeContext";

interface SearchResult {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export function SearchFriends() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<Set<number>>(new Set());

    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError("Enter a username or email to search");
            return;
        }
        setLoading(true);
        setError(null);
        setSearched(true);
        try {
            const res = await fetch(
                `http://localhost:8081/users/search?query=${encodeURIComponent(searchQuery)}`,
                { headers: authHeader()}
            );
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Search failed");
                setResults([]);
            } else {
                const filtered = data.filter((result: SearchResult) => {
                    if (!user) return true;
                    if (user.id && result.id === user.id) return false;
                    if (user.email && result.email === user.email) return false;
                    if (user.name && result.name === user.name) return false;
                    return true;
                });
                setResults(filtered);
            }
        } catch (err: any) {
            setError("Network error during search");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (receiverId: number) => {
        setPendingRequests(prev => new Set(prev).add(receiverId));
        
        try {
            const res = await fetch("http://localhost:8081/users/friend-request/send", {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ receiverId }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to send request");
                setPendingRequests(prev => {
                    const updated = new Set(prev);
                    updated.delete(receiverId);
                    return updated;
                });
            } else {
                // Keep the button in pending state (won't be added back)
                setPendingRequests(prev => new Set(prev).add(receiverId));
            }
        } catch (err: any) {
            setError("Network error");
            setPendingRequests(prev => {
                const updated = new Set(prev);
                updated.delete(receiverId);
                return updated;
            });
        }
    };

    const initials = user?.name?.slice(0, 2).toUpperCase() ?? '??';

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
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
                        Dashboard
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
                        Profile
                    </button>
                    <ThemeSwitch />
                </div>
            </header>

            {/* ── Body ── */}
            <main className="dashboard-body">
                <div className="page-title fade-up">
                    <h1>Search for Friends</h1>
                    <p>Find users by username or email</p>
                </div>

                {/* Search Card */}
                <div className="section-card fade-up fade-up-1">
                    <form onSubmit={handleSearch}>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input
                                type="text"
                                placeholder="Search by username or email..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="code-input"
                                style={{ flex: 1 }}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="msg msg-error" style={{ marginTop: 14 }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {searched && results.length === 0 && !loading && (
                    <div className="section-card fade-up fade-up-2" style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--ink3)' }}>
                            {error ? 'No results found' : 'No users match your search'}
                        </p>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="section-card fade-up fade-up-2">
                        <div className="section-card-header">
                            <h3>Results ({results.length})</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {results.map(result => (
                                <div
                                    key={result.id}
                                    style={{
                                        padding: '12px 14px',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600, marginBottom: 4 }}>
                                            {result.name}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--ink3)' }}>
                                            {result.email}
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleSendRequest(result.id)}
                                        disabled={pendingRequests.has(result.id)}
                                    >
                                        {pendingRequests.has(result.id) ? '✓ Requested' : '+ Add'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
