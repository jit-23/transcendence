import React from "react";

type Canvas = {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
};

type Friend = {
  id: number;
  name: string;
  email: string;
};

type CanvasesCardProps = {
  title?: string;
  canCreateCanvas?: boolean;
  canvases: Canvas[];
  canvasesLoading: boolean;
  canvasesError?: string | null;
  friends: Friend[];
  friendsLoading: boolean;
  friendsError: string | null;
  inviteCanvasId: number | null;
  inviteError: string | null;
  invitingFriendId: number | null;
  onAddCanvas: (name: string) => Promise<boolean>;
  onDeleteCanvas: (canvasId: number) => void;
  onOpenCanvas: (canvasId: number) => void;
  onOpenInviteCanvas: (canvasId: number | null) => void;
  onInviteFriend: (canvasId: number, friendId: number) => void;
};

const normalizeForSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function CanvasesCard({
  title = "Your Canvases",
  canCreateCanvas = true,
  canvases,
  canvasesLoading,
  canvasesError,
  friends,
  friendsLoading,
  friendsError,
  inviteCanvasId,
  inviteError,
  invitingFriendId,
  onAddCanvas,
  onDeleteCanvas,
  onOpenCanvas,
  onOpenInviteCanvas,
  onInviteFriend,
}: CanvasesCardProps) {
  const [newCanvasName, setNewCanvasName] = React.useState("");
  const [showNameInput, setShowNameInput] = React.useState(false);
  const [creatingCanvas, setCreatingCanvas] = React.useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = React.useState("");

  const handleCreate = async ()   => {
    if (canvases.length >= 3) return;
    setCreatingCanvas(true);
    const requestedName = newCanvasName.trim() || `Canvas ${canvases.length + 1}`;
    const created = await onAddCanvas(requestedName);

    if (created) {
      setNewCanvasName("");
      setShowNameInput(false);
    }
    setCreatingCanvas(false);
  };

  React.useEffect(() => {
    setFriendSearchQuery("");
  }, [inviteCanvasId]);

  const activeCanvas = inviteCanvasId !== null ? canvases.find((canvas) => canvas.id === inviteCanvasId) : undefined;
  const activeSearch = normalizeForSearch(friendSearchQuery.trim());
  const filteredFriends = friends
    .filter((friend) => {
      if (!activeSearch) return true;
      return normalizeForSearch(friend.name).includes(activeSearch);
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  return (
    <div className="section-card fade-up fade-up-2" style={{ padding: "16px", height: "100%", minHeight: 360 }}>
      <div className="section-card-header">
        <h3>{title}</h3>
        {canCreateCanvas && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowNameInput(true)}
              disabled={canvases.length >= 3 || canvasesLoading}
            >
              {canvasesLoading ? "Loading..." : canvases.length >= 3 ? "Max 3 Canvases" : "Add Canvas"}
            </button>
          </div>
        )}
      </div>

      {canCreateCanvas && showNameInput && canvases.length < 3 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Canvas name (optional)"
              value={newCanvasName}
              onChange={(e) => setNewCanvasName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCreate();
                }
              }}
              autoFocus
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--ink)",
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                void handleCreate();
              }}
              disabled={canvasesLoading || creatingCanvas}
            >
              {creatingCanvas ? "Creating..." : "Create"}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowNameInput(false);
                setNewCanvasName("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {canvasesError && (
        <div style={{ marginTop: 10, color: "var(--error)", fontSize: "0.9rem" }}>
          {canvasesError}
        </div>
      )}

      {canvases.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {canvases.map((canvas) => (
              (() => {
                const canManageCanvas = canCreateCanvas || Boolean(canvas.isOwner);

                return (
              <div
                key={canvas.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "var(--surface-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onOpenCanvas(canvas.id)}
                  title={canvas.name}
                  style={{
                    textAlign: "left",
                    marginBottom: "8px",
                    width: "100%",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    justifyContent: "flex-start",
                  }}
                >
                  {canvas.name}
                </button>
                {canManageCanvas && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => onDeleteCanvas(canvas.id)}
                    style={{ color: "var(--error)", fontSize: "0.75rem" }}
                  >
                    Delete
                  </button>
                )}
                {canManageCanvas && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => onOpenInviteCanvas(canvas.id)}
                    style={{ marginTop: 4, fontSize: "0.75rem" }}
                  >
                    Search
                  </button>
                )}
              </div>
                );
              })()
            ))}
          </div>
        </div>
      )}

      {activeCanvas && (canCreateCanvas || activeCanvas.isOwner) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 90,
          }}
          onClick={() => onOpenInviteCanvas(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              maxHeight: "70vh",
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              background: "var(--surface)",
              padding: "14px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <h4 style={{ fontSize: "0.95rem", margin: 0 }}>Invite Friends</h4>
              <button className="btn btn-ghost btn-xs" onClick={() => onOpenInviteCanvas(null)}>Close</button>
            </div>

            <p style={{ color: "var(--ink3)", fontSize: "0.78rem", marginBottom: "10px" }}>
              Canvas: {activeCanvas.name}
            </p>

            <input
              type="text"
              placeholder="Search friends by name"
              value={friendSearchQuery}
              onChange={(event) => setFriendSearchQuery(event.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface2)",
                color: "var(--ink)",
                fontSize: "0.82rem",
                marginBottom: "10px",
              }}
            />

            {inviteError && <div style={{ color: "var(--error)", fontSize: "0.75rem", marginBottom: 6 }}>{inviteError}</div>}
            {friendsError && <div style={{ color: "var(--error)", fontSize: "0.75rem", marginBottom: 6 }}>{friendsError}</div>}
            {friendsLoading && <p style={{ fontSize: "0.78rem", color: "var(--ink3)" }}>Loading friends...</p>}
            {!friendsLoading && friends.length === 0 && (
              <p style={{ fontSize: "0.78rem", color: "var(--ink3)" }}>No friends available to invite.</p>
            )}

            {!friendsLoading && friends.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    className="btn btn-ghost btn-sm"
                    onClick={() => onInviteFriend(activeCanvas.id, friend.id)}
                    disabled={invitingFriendId === friend.id}
                    style={{ justifyContent: "space-between" }}
                  >
                    <span>{friend.name}</span>
                    <span style={{ fontSize: "0.72rem" }}>{invitingFriendId === friend.id ? "Inviting..." : "Invite"}</span>
                  </button>
                ))}
                {filteredFriends.length === 0 && (
                  <p style={{ fontSize: "0.78rem", color: "var(--ink3)" }}>No friends match your search.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {canvases.length === 0 && !showNameInput && (
        <div style={{ marginTop: 14, textAlign: "center", color: "var(--ink-secondary)", padding: "10px 4px" }}>
          <p>No canvases yet</p>
        </div>
      )}
    </div>
  );
}

