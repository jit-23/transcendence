import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../../Avatar";
import { AuthContext } from "../../AuthContext";
import { useTheme } from "../../ThemeContext";
import { Button } from "./button";

type ReceivedFriendRequest = {
	id: number;
	sender: {
		id: number;
		name: string;
		email: string;
	};
};

type ReceivedCanvasInvite = {
	id: number;
	addedAt: string;
	canvas: {
		id: number;
		name: string;
		owner: {
			id: number;
			name: string;
			email: string;
		};
	};
};

export function TopBar() {
	const { user, logout } = useContext(AuthContext);
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const requestsPanelRef = useRef<HTMLDivElement | null>(null);
	const [requests, setRequests] = useState<ReceivedFriendRequest[]>([]);
	const [canvasInvites, setCanvasInvites] = useState<ReceivedCanvasInvite[]>([]);
	const [requestsLoading, setRequestsLoading] = useState(false);
	const [canvasInvitesLoading, setCanvasInvitesLoading] = useState(false);
	const [requestsError, setRequestsError] = useState<string | null>(null);
	const [canvasInvitesError, setCanvasInvitesError] = useState<string | null>(null);
	const [showRequestsPanel, setShowRequestsPanel] = useState(false);

	const authHeader = () => ({
		Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		"Content-Type": "application/json",
	});

	const fetchRequests = async (silent = false) => {
		if (!silent) {
			setRequestsLoading(true);
			setRequestsError(null);
		}
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
			const res = await fetch(`${apiUrl}/users/friend-request/received`, {
				headers: authHeader(),
			});
			const data = await res.json();
			if (!res.ok) {
				if (!silent) {
					setRequestsError(data.error || "Failed to load friend requests");
				}
				setRequests([]);
			} else {
				setRequests(data);
			}
		} catch {
			if (!silent) {
				setRequestsError("Network error while loading friend requests");
			}
			setRequests([]);
		} finally {
			if (!silent) {
				setRequestsLoading(false);
			}
		}
	};

	const fetchCanvasInvites = async (silent = false) => {
		if (!silent) {
			setCanvasInvitesLoading(true);
			setCanvasInvitesError(null);
		}
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
			const res = await fetch(`${apiUrl}/canvases/invites/received`, {
				headers: authHeader(),
			});
			const data = await res.json();
			if (!res.ok) {
				if (!silent) {
					setCanvasInvitesError(
						res.status === 404
							? "Canvas invites API not available. Restart backend and run latest migration."
							: data.error || "Failed to load canvas invites"
					);
				}
				setCanvasInvites([]);
			} else {
				setCanvasInvites(data);
			}
		} catch {
			if (!silent) {
				setCanvasInvitesError("Network error while loading canvas invites");
			}
			setCanvasInvites([]);
		} finally {
			if (!silent) {
				setCanvasInvitesLoading(false);
			}
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
			setRequests((prev) => prev.filter((request) => request.id !== requestId));
		} catch {
			setRequestsError("Network error while updating request");
		}
	};

	const decideCanvasInvite = async (canvasId: number, action: "accept" | "reject") => {
		setCanvasInvitesError(null);
		try {
			const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
			const res = await fetch(`${apiUrl}/canvases/${canvasId}/invites/${action}`, {
				method: "POST",
				headers: authHeader(),
			});
			const data = await res.json();
			if (!res.ok) {
				setCanvasInvitesError(data.error || "Failed to update canvas invite");
				return;
			}
			setCanvasInvites((prev) => prev.filter((invite) => invite.canvas.id !== canvasId));
		} catch {
			setCanvasInvitesError("Network error while updating canvas invite");
		}
	};

	useEffect(() => {
		if (!showRequestsPanel) return;
		void fetchRequests();
		void fetchCanvasInvites();
	}, [showRequestsPanel]);

	useEffect(() => {
		void fetchRequests(true);
		void fetchCanvasInvites(true);

		const intervalId = window.setInterval(() => {
			void fetchRequests(true);
			void fetchCanvasInvites(true);
		}, 5000);

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				void fetchRequests(true);
				void fetchCanvasInvites(true);
			}
		};

		const handleWindowFocus = () => {
			void fetchRequests(true);
			void fetchCanvasInvites(true);
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("focus", handleWindowFocus);

		return () => {
			window.clearInterval(intervalId);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("focus", handleWindowFocus);
		};
	}, []);

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
		<header className="topbar">
			<button
				type="button"
				onClick={() => navigate("/dashboard")}
				className="logo-button"
				title="Go to dashboard"
				aria-label="Go to dashboard"
			>
				<div className="logo">
					<div className="logo-mark">W</div>
					whiteboard
				</div>
			</button>

			<div className="topbar-right">
				<div
					className="user-chip"
					role="button"
					tabIndex={0}
					onClick={() => navigate("/profile")}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							navigate("/profile");
						}
					}}
					title="Open profile"
					aria-label="Open profile"
				>
					<Avatar avatar={user?.avatar} name={user?.name ?? "?"} size={24} />
					{user?.name}
				</div>
				<div className="topbar-notification" ref={requestsPanelRef}>
					<Button
						variant="outline"
						size="icon"
						className="relative"
						onClick={() => setShowRequestsPanel((previous) => !previous)}
						title="Friend requests"
						aria-label="Friend requests"
					>
						<svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
							<path d="M12 22a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 22Zm7-5.2V11a7 7 0 1 0-14 0v5.8L3.6 18a1 1 0 0 0 .7 1.8h15.4a1 1 0 0 0 .7-1.8L19 16.8Z" />
						</svg>
						{requests.length + canvasInvites.length > 0 ? (
							<span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-bg">
								{requests.length + canvasInvites.length}
							</span>
						) : null}
					</Button>
					{showRequestsPanel ? (
						<div className="absolute right-0 z-30 mt-2 w-[320px] max-w-[90vw] rounded-xl border border-border bg-surface p-3 shadow-lg">
							<div className="mb-3 flex items-center justify-between gap-3">
								<h3 className="text-base font-semibold">Friend Requests</h3>
								<Button variant="ghost" size="sm" onClick={fetchRequests} disabled={requestsLoading}>
									{requestsLoading ? "..." : "Refresh"}
								</Button>
							</div>

							{requestsError ? (
								<div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
									{requestsError}
								</div>
							) : null}

							{!requestsLoading && requests.length === 0 ? (
								<p className="text-sm text-muted">No pending requests.</p>
							) : null}

							{requests.length > 0 ? (
								<div className="space-y-2">
									{requests.map((request) => (
										<div key={request.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface2 p-2.5">
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-ink">{request.sender.name}</p>
												<p className="truncate text-xs text-muted">{request.sender.email}</p>
											</div>
											<div className="flex gap-1.5">
												<Button size="sm" onClick={() => void decideRequest(request.id, "accept")}>Accept</Button>
												<Button size="sm" variant="outline" onClick={() => void decideRequest(request.id, "reject")}>Reject</Button>
											</div>
										</div>
									))}
								</div>
							) : null}

							<div className="mt-4 border-t border-border pt-3">
								<div className="mb-3 flex items-center justify-between gap-3">
									<h3 className="text-base font-semibold">Canvas Invites</h3>
									<Button variant="ghost" size="sm" onClick={fetchCanvasInvites} disabled={canvasInvitesLoading}>
										{canvasInvitesLoading ? "..." : "Refresh"}
									</Button>
								</div>

								{canvasInvitesError ? (
									<div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
										{canvasInvitesError}
									</div>
								) : null}

								{!canvasInvitesLoading && canvasInvites.length === 0 ? (
									<p className="text-sm text-muted">No pending canvas invites.</p>
								) : null}

								{canvasInvites.length > 0 ? (
									<div className="space-y-2">
										{canvasInvites.map((invite) => (
											<div key={invite.canvas.id} className="rounded-md border border-border bg-surface2 p-2.5">
												<p className="truncate text-sm font-semibold text-ink">{invite.canvas.name}</p>
												<p className="truncate text-xs text-muted">Invited by {invite.canvas.owner.name}</p>
												<div className="mt-2 flex gap-1.5">
													<Button size="sm" onClick={() => void decideCanvasInvite(invite.canvas.id, "accept")}>Accept</Button>
													<Button size="sm" variant="outline" onClick={() => void decideCanvasInvite(invite.canvas.id, "reject")}>Reject</Button>
												</div>
											</div>
										))}
									</div>
								) : null}
							</div>
						</div>
					) : null}
				</div>
				<button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
					{theme === "dark" ? "☀" : "☾"}
				</button>
				<Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
			</div>
		</header>
	);
}

export default TopBar;