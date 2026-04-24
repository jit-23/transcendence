import React from "react";
import { useTranslation } from "react-i18next";

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

export function CanvasesCard({
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
  const {t} = useTranslation();
  const [newCanvasName, setNewCanvasName] = React.useState("");
  const [showNameInput, setShowNameInput] = React.useState(false);
  const [creatingCanvas, setCreatingCanvas] = React.useState(false);

    const authHeader = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

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
  return (
    <div className="section-card fade-up fade-up-2">
      <div className="section-card-header">
        <h3>{t("CVS_your_canvases")}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowNameInput(true)}
            disabled={canvases.length >= 3 || canvasesLoading}
          >
            {canvasesLoading ? t("CVS_loading_canvases") : canvases.length >= 3 ? t("CVS_max_3_canvases") : t("CVS_add_canvas")}
          </button>
        </div>
      </div>

      {showNameInput && canvases.length < 3 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder={t("CVS_canvas_name_opt")}
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
              {creatingCanvas ? t("CVS_creating_canvas") : t("CVS_create_canvas")}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowNameInput(false);
                setNewCanvasName("");
              }}
            >
              {t("CVS_delete_canvas")}
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
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
            {canvases.map((canvas) => (
              <div
                key={canvas.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  borderRadius: "4px",
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
                    marginBottom: "4px",
                    width: "100%",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    justifyContent: "flex-start",
                  }}
                >
                  {canvas.name}
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => onDeleteCanvas(canvas.id)}
                  style={{ color: "var(--error)", fontSize: "0.75rem" }}
                >
                  Delete
                </button>
                {canvas.isOwner && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => onOpenInviteCanvas(inviteCanvasId === canvas.id ? null : canvas.id)}
                    style={{ marginTop: 4, fontSize: "0.75rem" }}
                  >
                    {inviteCanvasId === canvas.id ? t("CVS_close_invite") : t("CVS_invite")}
                  </button>
                )}

                {canvas.isOwner && inviteCanvasId === canvas.id && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                    {inviteError && <div style={{ color: "var(--error)", fontSize: "0.75rem", marginBottom: 6 }}>{inviteError}</div>}
                    {friendsError && <div style={{ color: "var(--error)", fontSize: "0.75rem", marginBottom: 6 }}>{friendsError}</div>}
                    {friendsLoading && <p style={{ fontSize: "0.75rem", color: "var(--ink3)" }}>Loading friends...</p>}
                    {!friendsLoading && friends.length === 0 && (
                      <p style={{ fontSize: "0.75rem", color: "var(--ink3)" }}>{t("CVS_no_friends")}</p>
                    )}
                    {!friendsLoading && friends.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {friends.map((friend) => (
                          <button
                            key={friend.id}
                            className="btn btn-ghost btn-xs"
                            onClick={() => onInviteFriend(canvas.id, friend.id)}
                            disabled={invitingFriendId === friend.id}
                            style={{ justifyContent: "space-between", fontSize: "0.72rem" }}
                          >
                            <span>{friend.name}</span>
                            <span>{invitingFriendId === friend.id ? t("CVS_inviting") : t("CVS_invite")}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {canvases.length === 0 && !showNameInput && (
        <div style={{ marginTop: 12, textAlign: "center", color: "var(--ink-secondary)" }}>
          <p>{t("CVS_no_canvas")}</p>
        </div>
      )}
    </div>
  );
}

