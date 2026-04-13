import { ReceivedFriendRequest } from "./types";

type FriendRequestsCardProps = {
  requests: ReceivedFriendRequest[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onDecide: (requestId: number, action: "accept" | "reject") => void;
};

export function FriendRequestsCard({
  requests,
  loading,
  error,
  onRefresh,
  onDecide,
}: FriendRequestsCardProps) {
  return (
    <div className="section-card fade-up fade-up-2">
      <div className="section-card-header">
        <h3>Friend Requests</h3>
        <button className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="msg msg-error" style={{ marginBottom: 14 }}>{error}</div>}

      {!loading && requests.length === 0 && (
        <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>No pending requests.</p>
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
                  onClick={() => onDecide(request.id, "accept")}
                >
                  Accept
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onDecide(request.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
