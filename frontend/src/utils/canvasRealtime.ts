import { Socket } from "socket.io-client";

type CanvasShapeCommitPayload<Shape> = {
  canvasId: number;
  shape?: Shape;
};

type CanvasEventPayload = {
  canvasId: number;
};

type CanvasRedoPayload<Shape> = {
  canvasId: number;
  shape?: Shape;
};

type CanvasBackgroundPayload = {
  canvasId: number;
  color?: string;
};

type CanvasPresencePayload = {
  canvasId: number;
  users?: Array<{ userId: number; username: string }>;
};

type CanvasDraftPayload<Shape> = {
  canvasId: number;
  userId?: number;
  shape?: Shape | null;
};

type CanvasCursorPayload = {
  canvasId: number;
  userId?: number;
  username?: string;
  x?: number;
  y?: number;
  visible?: boolean;
};

type CanvasShapeDeletePayload = {
  canvasId: number;
  shapeIds?: string[];
};

export type CanvasRealtimeHandlers<Shape> = {
  onShapeCommit: (shape: Shape) => void;
  onShapeDelete: (shapeIds: string[]) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: (shape: Shape) => void;
  onBackground: (color: string) => void;
  onPresence: (users: Array<{ userId: number; username: string }>) => void;
  onDraft: (userId: number, shape: Shape | null) => void;
  onCursor: (payload: { userId: number; username: string; x: number; y: number; visible: boolean }) => void;
};

const isValidCanvasId = (canvasId: number | null) =>
  Boolean(canvasId && Number.isInteger(canvasId) && canvasId > 0);

export const joinCanvasRoom = (socket: Socket, canvasId: number | null) => {
  if (!isValidCanvasId(canvasId)) return;
  socket.emit("join-canvas", { canvasId });
};

export const emitCanvasEvent = (
  socket: Socket | null,
  canvasId: number | null,
  eventName: string,
  payload: Record<string, unknown> = {}
) => {
  if (!socket || !isValidCanvasId(canvasId)) return;
  socket.emit(eventName, {
    canvasId,
    ...payload,
  });
};

export const registerCanvasRealtimeHandlers = <Shape>(
  socket: Socket,
  canvasId: number | null,
  handlers: CanvasRealtimeHandlers<Shape>
) => {
  const handleShapeCommit = ({ canvasId: incomingCanvasId, shape }: CanvasShapeCommitPayload<Shape>) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId || !shape) return;
    handlers.onShapeCommit(shape);
  };

  const handleClear = ({ canvasId: incomingCanvasId }: CanvasEventPayload) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId) return;
    handlers.onClear();
  };

  const handleUndo = ({ canvasId: incomingCanvasId }: CanvasEventPayload) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId) return;
    handlers.onUndo();
  };

  const handleRedo = ({ canvasId: incomingCanvasId, shape }: CanvasRedoPayload<Shape>) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId || !shape) return;
    handlers.onRedo(shape);
  };

  const handleBackground = ({ canvasId: incomingCanvasId, color }: CanvasBackgroundPayload) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId || typeof color !== "string") return;
    handlers.onBackground(color);
  };

  const handlePresence = ({ canvasId: incomingCanvasId, users }: CanvasPresencePayload) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId) return;
    handlers.onPresence(Array.isArray(users) ? users : []);
  };

  const handleDraft = ({ canvasId: incomingCanvasId, userId, shape }: CanvasDraftPayload<Shape>) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId || !userId) return;
    handlers.onDraft(userId, shape ?? null);
  };

  const handleCursor = ({ canvasId: incomingCanvasId, userId, username, x, y, visible }: CanvasCursorPayload) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId || !userId || !username) return;
    if (visible === false) {
      handlers.onCursor({ userId, username, x: 0, y: 0, visible: false });
      return;
    }
    if (typeof x !== "number" || typeof y !== "number") return;
    handlers.onCursor({ userId, username, x, y, visible: true });
  };

  const handleShapeDelete = ({ canvasId: incomingCanvasId, shapeIds }: CanvasShapeDeletePayload) => {
    if (!isValidCanvasId(canvasId) || Number(incomingCanvasId) !== canvasId) return;
    if (!Array.isArray(shapeIds) || shapeIds.length === 0) return;
    handlers.onShapeDelete(shapeIds);
  };

  socket.on("canvas-shape-commit", handleShapeCommit);
  socket.on("canvas-shape-delete", handleShapeDelete);
  socket.on("canvas-clear", handleClear);
  socket.on("canvas-undo", handleUndo);
  socket.on("canvas-redo", handleRedo);
  socket.on("canvas-background", handleBackground);
  socket.on("canvas-presence", handlePresence);
  socket.on("canvas-draft", handleDraft);
  socket.on("canvas-cursor", handleCursor);

  return () => {
    socket.off("canvas-shape-commit", handleShapeCommit);
    socket.off("canvas-shape-delete", handleShapeDelete);
    socket.off("canvas-clear", handleClear);
    socket.off("canvas-undo", handleUndo);
    socket.off("canvas-redo", handleRedo);
    socket.off("canvas-background", handleBackground);
    socket.off("canvas-presence", handlePresence);
    socket.off("canvas-draft", handleDraft);
    socket.off("canvas-cursor", handleCursor);
  };
};
