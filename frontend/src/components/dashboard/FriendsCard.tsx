import { Friend } from "./types";

type FriendsCardProps = {
  friends: Friend[];
  loading: boolean;
  error: string | null;
  unfriendingId: number | null;
  onRefresh: () => void;
  onChat: (friendName: string) => void;
  onUnfriend: (friendId: number) => void;
};

export function FriendsCard({
  friends,
  loading,
  error,
  unfriendingId,
  onRefresh,
  onChat,
  onUnfriend,
}: FriendsCardProps) {
  return (
    <div className="section-card fade-up fade-up-2">
      <div className="section-card-header">
        <h3>My Friends</h3>
        <button className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="msg msg-error" style={{ marginBottom: 14 }}>{error}</div>}

      {!loading && friends.length === 0 && (
        <p style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>You do not have friends yet.</p>
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
                <button className="btn btn-primary btn-sm" onClick={() => onChat(friend.name)}>
                  Chat
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onUnfriend(friend.id)}
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
  );
}
