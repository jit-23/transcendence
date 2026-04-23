import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { Avatar } from "../Avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type ReceivedFriendRequest = {
  id: number;
  sender: {
    id: number;
    name: string;
    email: string;
  };
};

type AppTopbarProps = {
  className?: string;
};

export function AppTopbar({ className = "mb-6 rounded-2xl border border-border bg-surface p-4 shadow-panel" }: AppTopbarProps) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ReceivedFriendRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const requestsPanelRef = useRef<HTMLDivElement | null>(null);

  const authHeader = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8081";
      const res = await fetch(`${apiUrl}/users/friend-request/received`, {
        headers: authHeader(),
      });
      const data = await res.json();
      if (!res.ok) {
        setRequestsError(data.error || "Failed to load friend requests");
        setRequests([]);
      } else {
        setRequests(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    void fetchRequests();
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
    <header className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 font-display text-lg font-semibold text-ink"
          aria-label="Go to dashboard"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface2 text-xs">W</div>
          whiteboard
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={requestsPanelRef}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowRequestsPanel((prev) => !prev)}
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
                    {requestsLoading ? "..." : "Refresh"}
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

          <Button variant="outline" size="sm" onClick={() => navigate("/profile")} className="gap-2">
            <Avatar avatar={user?.avatar} name={user?.name ?? "?"} size={20} />
            <span>{user?.name ?? "Profile"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
