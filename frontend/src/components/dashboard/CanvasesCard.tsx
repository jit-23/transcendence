import React from "react";
import { useTranslation } from 'react-i18next';

type Canvas = {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type CanvasesCardProps = {
  canvases: Canvas[];
  canvasesLoading: boolean;
  canvasesError?: string | null;
  onAddCanvas: (name: string) => Promise<boolean>;
  onDeleteCanvas: (canvasId: number) => void;
  onOpenCanvas: (canvasId: number) => void;
};

export function CanvasesCard({
  canvases,
  canvasesLoading,
  canvasesError,
  onAddCanvas,
  onDeleteCanvas,
  onOpenCanvas,
}: CanvasesCardProps) {
  const {t} = useTranslation()
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
        <h3>{t("your_canvases")}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowNameInput(true)}
            disabled={canvases.length >= 3 || canvasesLoading}
          >
            {canvasesLoading ? t("loading_canvases") : canvases.length >= 3 ? t("max_3_canvases") : t("add_canvas")}
          </button>
        </div>
      </div>

      {showNameInput && canvases.length < 3 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder={t("canvas_name_opt")}
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
              {creatingCanvas ? t("creating_canvas") : t("create_canvas")}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowNameInput(false);
                setNewCanvasName("");
              }}
            >
              {t("cancel_canvas")}
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
               {t("delete_canvas")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {canvases.length === 0 && !showNameInput && (
        <div style={{ marginTop: 12, textAlign: "center", color: "var(--ink-secondary)" }}>
          <p>{t("no_canvas")}</p>
        </div>
      )}
    </div>
  );
}

