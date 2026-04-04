import React from "react";

type Canvas = {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type QuickActionsCardProps = {
  canvases: Canvas[];
  canvasesLoading: boolean;
  canvasesError: string | null;
  onSearchFriends: () => void;
  onGroupChats: () => void;
  onAddCanvas: (name: string) => Promise<boolean>;
  onDeleteCanvas: (canvasId: number) => void;
  onOpenCanvas: (canvasId: number) => void;
};

export function QuickActionsCard({
  canvases,
  canvasesLoading,
  canvasesError,
  onSearchFriends,
  onGroupChats,
  onAddCanvas,
  onDeleteCanvas,
  onOpenCanvas,
}: QuickActionsCardProps) {
  const [newCanvasName, setNewCanvasName] = React.useState("");
  const [showNameInput, setShowNameInput] = React.useState(false);
  const [creatingCanvas, setCreatingCanvas] = React.useState(false);

  const handleCreate = async () => {
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
        <h3>Your Canvases</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onSearchFriends}>
            Search Friends
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onGroupChats}>
            Group Chats
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowNameInput(true)}
            disabled={canvases.length >= 3 || canvasesLoading}
          >
            {canvasesLoading ? "Loading..." : canvases.length >= 3 ? "Max 3 Canvases" : "Add Canvas"}
          </button>
        </div>
      </div>

      {showNameInput && canvases.length < 3 && (
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
              </div>
            ))}
          </div>
        </div>
      )}

      {canvases.length === 0 && !showNameInput && (
        <div style={{ marginTop: 12, textAlign: "center", color: "var(--ink-secondary)" }}>
          <p>No canvases yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}

