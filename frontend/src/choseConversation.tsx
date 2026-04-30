import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar } from "./Avatar";
import { TopBar } from "./components/ui/topbar";

type Friend = {
	id: number;
	name: string;
	email: string;
	avatar?: string | null;
	online?: boolean;
};

export function ChoseConversation() {
	const { t } = useTranslation();
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
				throw new Error(data.error || t("CCC_failed_load"));
			}

			setFriends(Array.isArray(data) ? data : []);
		} catch (err: any) {
			setError(err.message || t("CCC_failed_load"));
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
			return name.startsWith(cleanQuery);
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
				throw new Error(data.error || t("CCC_failed_open"));
			}

			navigate(`/chat?conversationId=${data.id}&name=${encodeURIComponent(friend.name)}`);
		} catch (err: any) {
			setError(err.message || t("CCC_failed_open"));
		} finally {
			setOpeningFriendId(null);
		}
	};

	return (
		<div className="dashboard-shell">
			<TopBar />

			<main className="dashboard-body">
				<div className="page-title fade-up">
					<h1>{t("CCC_title")}</h1>
					<p>{t("CCC_desc")}</p>
				</div>

				<div className="section-card fade-up fade-up-1">
					<div className="section-card-header" style={{ marginBottom: 10 }}>
						<h3>{t("CCC_friends")}</h3>
						<button className="btn btn-ghost btn-sm" onClick={loadFriends} disabled={loading || openingFriendId !== null}>
							{loading ? t("FRC_loading") : t("GCS_refresh")}
						</button>
					</div>

					<input
						className="code-input"
						type="text"
						placeholder={t("CCC_search_placeholder")}
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						autoFocus
						style={{ marginBottom: 12 }}
					/>

					{error && <div className="msg msg-error" style={{ marginBottom: 12 }}>{error}</div>}

					{!loading && friends.length === 0 && (
						<p style={{ color: "var(--ink3)", fontSize: "0.9rem" }}>{t("FRC_no_friends")}</p>
					)}

					{!loading && friends.length > 0 && filteredFriends.length === 0 && (
						<p style={{ color: "var(--ink3)", fontSize: "0.9rem" }}>{t("CVS_no_friends_match")}</p>
					)}

					{filteredFriends.length > 0 && (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 8,
								maxHeight: filteredFriends.length > 3 ? 220 : "none",
								overflowY: filteredFriends.length > 3 ? "auto" : "visible",
							}}
						>
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
										</div>
									</div>

									<button
										className="btn btn-primary btn-sm"
										onClick={() => openDirectConversation(friend)}
										disabled={openingFriendId !== null}
									>
										{openingFriendId === friend.id ? t("CCC_opening") : t("CCC_chat")}
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
