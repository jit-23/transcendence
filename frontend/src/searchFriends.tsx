import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";

interface SearchResult {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export function SearchFriends() {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
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
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <header className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-panel">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
                        whiteboard
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2 px-3 py-1.5 text-sm text-ink">
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-[0.65rem] font-semibold">
                                {initials}
                            </div>
                            {user?.name}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                            Dashboard
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                            Profile
                        </Button>
                        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                            {theme === 'dark' ? '☀' : '☾'}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="space-y-5">
                <div>
                    <h1 className="font-display text-3xl">Search for Friends</h1>
                    <p className="mt-1 text-sm text-muted">Find users by username or email.</p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Search</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search by username or email..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1"
                                autoFocus
                            />
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </form>

                        {error && (
                            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {searched && results.length === 0 && !loading && (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-sm text-muted">
                            {error ? 'No results found' : 'No users match your search'}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {results.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Results ({results.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                            {results.map(result => (
                                <div
                                    key={result.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface2 p-3"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-ink">
                                            {result.name}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {result.email}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/users/${result.id}`)}
                                        >
                                            Profile
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSendRequest(result.id)}
                                            disabled={pendingRequests.has(result.id)}
                                        >
                                            {pendingRequests.has(result.id) ? '✓ Requested' : '+ Add'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
