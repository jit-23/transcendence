import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { B } from "./components/ui/B";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/i18n";

interface SearchResult {
    id: number;
    name: string;
    email: string;
    createdAt: string;
}

export function SearchFriends() {
    const {t} = useTranslation();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<Set<number>>(new Set());
    const [friendsSet, setFriendsSet] = useState<Set<number>>(new Set());

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
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(
                `${apiUrl}/users/search?query=${encodeURIComponent(searchQuery)}`,
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
            const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
            const res = await fetch(`${apiUrl}/users/friend-request/send`, {
                method: "POST",
                headers: authHeader(),
                body: JSON.stringify({ receiverId }),
            });
            const data = await res.json();

            if (!res.ok) {
                // If backend reports user is already a friend, mark locally so invite button disappears
                const msg = (data && data.error) || "Failed to send request";
                if (res.status === 400 && /friend/i.test(msg)) {
                    setFriendsSet(prev => {
                        const updated = new Set(prev);
                        updated.add(receiverId);
                        return updated;
                    });
                }

                setError(msg);
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

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
                const res = await fetch(`${apiUrl}/users/friends`, { headers: authHeader() });
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setFriendsSet(new Set(data.map((f: any) => f.id)));
                }
            } catch {
                // ignore
            }
        };
        // only fetch when we have a logged-in user (token available)
        if (sessionStorage.getItem("token")) {
            void fetchFriends();
        }
    }, [user]);

    return (
        <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <TopBar />

            <main className="space-y-5">
                <div>
                    <h1 className="font-display text-3xl">{t("FRS_search")}</h1>
                    <p className="mt-1 text-sm text-muted">{t("FRS_find")}</p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t("FRS_search_button")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder={t("FRS_search_user")}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1"
                                autoFocus
                            />
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? t("FRS_searching") : t("FRS_search_button")}
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
                            {error ? t("FRS_no_results") : t("FRS_no_user_match")}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {results.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{t("FRS_results")} ({results.length})</CardTitle>
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
                                            {t("FRS_profile")}
                                        </Button>
                                        {friendsSet.has(result.id) ? (
                                            <Button size="sm" variant="ghost" disabled>(Friend)</Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => handleSendRequest(result.id)}
                                                disabled={pendingRequests.has(result.id)}
                                            >
                                                {pendingRequests.has(result.id) ? t("FRS_requested") : t("FRS_add")}
                                            </Button>
                                        )}
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
