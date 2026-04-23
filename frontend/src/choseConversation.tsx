import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./Avatar";
import { AppTopbar } from "./components/AppTopbar";

type Friend = {
	id: number;
	name: string;
	email: string;
	avatar?: string | null;
	online?: boolean;
};

export function ChoseConversation() {
	const navigate = useNavigate();
	const [friends, setFriends] = useState<Friend[]>([]);
	const [query, setQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [openingFriendId, setOpeningFriendId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	const authHeader = () => ({
		Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		"Content-Type": "application/json",
	});

	const loadFriends = async () => {
		setLoading(true);
		setError(null);

		try {
			const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
			const res = await fetch(`${apiUrl}/users/friends`, { headers: authHeader() });
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to load friends");
			}

			setFriends(Array.isArray(data) ? data : []);
		} catch (err: any) {
			setError(err.message || "Failed to load friends");
			setFriends([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void loadFriends();
	}, []);

	const filteredFriends = useMemo(() => {
		const cleanQuery = query.trim().toLowerCase();
		if (!cleanQuery) return friends;

		return friends.filter((friend) => {
			const name = friend.name?.toLowerCase() ?? "";
			const email = friend.email?.toLowerCase() ?? "";
			return name.startsWith(cleanQuery) || email.startsWith(cleanQuery);
		});
	}, [friends, query]);

	const openDirectConversation = async (friend: Friend) => {
		setOpeningFriendId(friend.id);
		setError(null);

		try {
			const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
			const res = await fetch(`${apiUrl}/conversations/direct`, {
				method: "POST",
				headers: authHeader(),
				body: JSON.stringify({ friendId: friend.id }),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to open conversation");
			}

			navigate(`/chat?conversationId=${data.id}&name=${encodeURIComponent(friend.name)}`);
		} catch (err: any) {
			setError(err.message || "Failed to open conversation");
		} finally {
			setOpeningFriendId(null);
		}
	};

	return (
		<div className="dashboard-shell">
			<AppTopbar />

			<main className="dashboard-body">
				<div className="page-title fade-up">
					<h1>Start Conversation</h1>
					<p>Search your friends and open an existing chat or create one instantly.</p>
				</div>

				<div className="section-card fade-up fade-up-1">
					<div className="section-card-header" style={{ marginBottom: 10 }}>
						<h3>Friends</h3>
						<button className="btn btn-ghost btn-sm" onClick={loadFriends} disabled={loading || openingFriendId !== null}>
							{loading ? "Loading..." : "Refresh"}
						</button>
					</div>

					<input
						className="code-input"
						type="text"
						placeholder="Search by friend name or email"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						autoFocus
						style={{ marginBottom: 12 }}
					/>

					{error && <div className="msg msg-error" style={{ marginBottom: 12 }}>{error}</div>}

					{!loading && friends.length === 0 && (
						<p style={{ color: "var(--ink3)", fontSize: "0.9rem" }}>You do not have friends yet.</p>
					)}

					{!loading && friends.length > 0 && filteredFriends.length === 0 && (
						<p style={{ color: "var(--ink3)", fontSize: "0.9rem" }}>No friends match your search.</p>
					)}

					{filteredFriends.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							{filteredFriends.map((friend) => (
								<div
									key={friend.id}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 10,
										border: "1px solid var(--border)",
										borderRadius: 10,
										padding: "10px 12px",
										background: "var(--surface2)",
									}}
								>
									<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
										<Avatar avatar={friend.avatar} name={friend.name} size={32} />
										<div>
											<p style={{ fontWeight: 600, lineHeight: 1.1 }}>{friend.name}</p>
											<p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{friend.email}</p>
										</div>
									</div>

									<button
										className="btn btn-primary btn-sm"
										onClick={() => openDirectConversation(friend)}
										disabled={openingFriendId !== null}
									>
										{openingFriendId === friend.id ? "Opening..." : "Chat"}
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);

}