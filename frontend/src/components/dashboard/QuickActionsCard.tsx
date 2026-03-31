type QuickActionsCardProps = {
  canvasButtons: number[];
  onSearchFriends: () => void;
  onGroupChats: () => void;
  onAddCanvas: () => void;
  onOpenCanvas: (canvasNumber: number) => void;
};

export function QuickActionsCard({
  canvasButtons,
  onSearchFriends,
  onGroupChats,
  onAddCanvas,
  onOpenCanvas,
}: QuickActionsCardProps) {
  return (
    <div className="section-card fade-up fade-up-2">
      <div className="section-card-header">
        <h3>Quick Actions</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onSearchFriends}>
            Search Friends
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onGroupChats}>
            Group Chats
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onAddCanvas}
            disabled={canvasButtons.length >= 3}
          >
            {canvasButtons.length >= 3 ? "Max 3 Canvases" : "Add Canvas"}
          </button>
        </div>
      </div>

      {canvasButtons.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {canvasButtons.map((canvasNumber) => (
            <button
              key={canvasNumber}
              className="btn btn-ghost btn-sm"
              onClick={() => onOpenCanvas(canvasNumber)}
            >
              Canvas {canvasNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
