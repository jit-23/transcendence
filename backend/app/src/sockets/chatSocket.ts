import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

type CanvasInvite = {
  inviteId: string;
  fromUsername: string;
  fromUserId: number;
  toUsername: string;
  toUserId: number;
  canvasId: number;
  canvasName: string;
  createdAt: number;
};

type CanvasPresenceMember = {
  userId: number;
  username: string;
};

export function setupChatSocket(server: HttpServer, prisma: PrismaClient) {
  const connectedByName = new Map<string, string>();
  const pendingCanvasInvites = new Map<string, CanvasInvite>();
  const pendingCanvasJoins = new Map<string, Set<number>>();
  const canvasPresenceById = new Map<number, Map<string, CanvasPresenceMember>>();

  const canAccessCanvas = async (userId: number, canvasId: number) => {
    const canvas = await prisma.canvas.findFirst({
      where: {
        id: canvasId,
        OR: [{ userId }, { collaborators: { some: { userId } } }],
      },
      select: { id: true },
    });
    return Boolean(canvas);
  };

  const io = new Server(server, {
    cors: {
      origin: "https://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const username = socket.handshake.auth.username as string;

    if (!username) return socket.disconnect();

    connectedByName.set(username, socket.id);
    console.log(`${username} connected with id: ${socket.id}`);

    let connectedUserId: number | null = null;
    const joinedCanvasIds = new Set<number>();

    const publishCanvasPresence = (canvasId: number) => {
      const roomMembers = canvasPresenceById.get(canvasId);
      const users = roomMembers ? Array.from(roomMembers.values()) : [];
      io.to(`canvas:${canvasId}`).emit("canvas-presence", {
        canvasId,
        users,
      });
    };

    const joinCanvasRoomWithPresence = async (canvasId: number) => {
      if (!connectedUserId) return;

      const allowed = await canAccessCanvas(connectedUserId, canvasId);
      if (!allowed) return;

      socket.join(`canvas:${canvasId}`);
      joinedCanvasIds.add(canvasId);

      const roomMembers = canvasPresenceById.get(canvasId) ?? new Map<string, CanvasPresenceMember>();
      roomMembers.set(socket.id, {
        userId: connectedUserId,
        username,
      });
      canvasPresenceById.set(canvasId, roomMembers);

      publishCanvasPresence(canvasId);
    };

    const flushPendingCanvasJoins = async () => {
      if (!connectedUserId) return;

      const queuedCanvasIds = pendingCanvasJoins.get(socket.id);
      if (!queuedCanvasIds || queuedCanvasIds.size === 0) return;

      for (const canvasId of queuedCanvasIds) {
        await joinCanvasRoomWithPresence(canvasId);
      }

      pendingCanvasJoins.delete(socket.id);
    };

    const emitToUser = (targetUsername: string, event: string, payload: unknown) => {
      const targetSocketId = connectedByName.get(targetUsername);
      if (!targetSocketId) return false;
      io.to(targetSocketId).emit(event, payload);
      return true;
    };

    (async () => {
      const dbUser = await prisma.my_users.findUnique({
        where: { name: username },
        select: { id: true },
      });

      if (!dbUser) {
        socket.disconnect();
        return;
      }

      connectedUserId = dbUser.id;
      const memberships = await prisma.conversation_participants.findMany({
        where: { user_id: dbUser.id },
        select: { conversation_id: true },
      });

      memberships.forEach((membership) => {
        socket.join(`conversation:${membership.conversation_id}`);
      });

      void flushPendingCanvasJoins();
    })();

    socket.on("private-message", ({ payload }) => {
      const toSocketId = connectedByName.get(payload.to);
      if (toSocketId) {
        io.to(toSocketId).emit("private-message", {
          from: username,
          text: payload.text,
        });
      } else {
        socket.emit("user-not-found", { to: payload.to });
      }
    });

    socket.on("typing", ({ to, isTyping }) => {
      const toSocketId = connectedByName.get(to);
      if (!toSocketId) return;
      io.to(toSocketId).emit("typing", {
        from: username,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("conversation-message", async ({ conversationId, text }) => {
      if (!connectedUserId) return;
      const id = Number(conversationId);
      const cleanText = typeof text === "string" ? text.trim() : "";
      if (!id || !cleanText) return;

      const member = await prisma.conversation_participants.findFirst({
        where: { conversation_id: id, user_id: connectedUserId },
        select: { conversation_id: true },
      });

      if (!member) return;

      const message = await prisma.message.create({
        data: {
          conversation_id: id,
          sender_id: connectedUserId,
          content: cleanText,
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      io.to(`conversation:${id}`).emit("conversation-message", {
        conversationId: id,
        message,
      });
    });

    socket.on("conversation-typing", async ({ conversationId, isTyping }) => {
      if (!connectedUserId) return;
      const id = Number(conversationId);
      if (!id) return;

      const member = await prisma.conversation_participants.findFirst({
        where: { conversation_id: id, user_id: connectedUserId },
        select: { conversation_id: true },
      });
      if (!member) return;

      socket.to(`conversation:${id}`).emit("conversation-typing", {
        conversationId: id,
        from: username,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("join-canvas", async ({ canvasId }) => {
      const id = Number(canvasId);
      if (!id) return;

      if (!connectedUserId) {
        const queuedCanvasIds = pendingCanvasJoins.get(socket.id) ?? new Set<number>();
        queuedCanvasIds.add(id);
        pendingCanvasJoins.set(socket.id, queuedCanvasIds);
        return;
      }

      await joinCanvasRoomWithPresence(id);
    });

    socket.on("canvas-shape-commit", async ({ canvasId, shape }) => {
      if (!connectedUserId) return;
      const id = Number(canvasId);
      if (!id || !shape) return;

      const allowed = await canAccessCanvas(connectedUserId, id);
      if (!allowed) return;

      socket.to(`canvas:${id}`).emit("canvas-shape-commit", {
        canvasId: id,
        shape,
      });

      socket.to(`canvas:${id}`).emit("canvas-draft", {
        canvasId: id,
        userId: connectedUserId,
        shape: null,
      });
    });

    socket.on("canvas-draft", async ({ canvasId, shape }) => {
      if (!connectedUserId) return;
      const id = Number(canvasId);
      if (!id) return;

      const allowed = await canAccessCanvas(connectedUserId, id);
      if (!allowed) return;

      socket.to(`canvas:${id}`).emit("canvas-draft", {
        canvasId: id,
        userId: connectedUserId,
        shape: shape ?? null,
      });
    });

    socket.on("canvas-cursor", async ({ canvasId, x, y, visible }) => {
      if (!connectedUserId) return;
      const id = Number(canvasId);
      if (!id) return;

      const allowed = await canAccessCanvas(connectedUserId, id);
      if (!allowed) return;

      if (visible === false) {
        socket.to(`canvas:${id}`).emit("canvas-cursor", {
          canvasId: id,
          userId: connectedUserId,
          username,
          visible: false,
        });
        return;
      }

      if (typeof x !== "number" || typeof y !== "number") return;

      socket.to(`canvas:${id}`).emit("canvas-cursor", {
        canvasId: id,
        userId: connectedUserId,
        username,
        x,
        y,
        visible: true,
      });
    });

    socket.on("canvas-clear", async ({ canvasId }) => {
      if (!connectedUserId) return;
      const id = Number(canvasId);
      if (!id) return;

      const allowed = await canAccessCanvas(connectedUserId, id);
      if (!allowed) return;

      socket.to(`canvas:${id}`).emit("canvas-clear", { canvasId: id });
    });

    socket.on("canvas-undo", async ({ canvasId }) => {
      if (!connectedUserId) return;
      const id = Number(canvasId);
      if (!id) return;

      const allowed = await canAccessCanvas(connectedUserId, id);
      if (!allowed) return;

      socket.to(`canvas:${id}`).emit("canvas-undo", { canvasId: id });
    });

    socket.on("canvas-redo", async ({ canvasId, shape }) => {
      if (!connectedUserId) return;
      const id = Number(canvasId);
      if (!id || !shape) return;

      const allowed = await canAccessCanvas(connectedUserId, id);
      if (!allowed) return;

      socket.to(`canvas:${id}`).emit("canvas-redo", {
        canvasId: id,
        shape,
      });
    });

    socket.on("canvas-background", async ({ canvasId, color }) => {
      if (!connectedUserId) return;
      const id = Number(canvasId);
      if (!id || typeof color !== "string") return;

      const allowed = await canAccessCanvas(connectedUserId, id);
      if (!allowed) return;

      socket.to(`canvas:${id}`).emit("canvas-background", {
        canvasId: id,
        color,
      });
    });

    socket.on("disconnect", () => {
      if (connectedByName.get(username) === socket.id) {
        connectedByName.delete(username);
      }

      pendingCanvasJoins.delete(socket.id);

      for (const canvasId of joinedCanvasIds) {
        if (connectedUserId) {
          socket.to(`canvas:${canvasId}`).emit("canvas-draft", {
            canvasId,
            userId: connectedUserId,
            shape: null,
          });
          socket.to(`canvas:${canvasId}`).emit("canvas-cursor", {
            canvasId,
            userId: connectedUserId,
            username,
            visible: false,
          });
        }

        const roomMembers = canvasPresenceById.get(canvasId);
        if (!roomMembers) continue;

        roomMembers.delete(socket.id);

        if (roomMembers.size === 0) {
          canvasPresenceById.delete(canvasId);
        } else {
          canvasPresenceById.set(canvasId, roomMembers);
        }

        publishCanvasPresence(canvasId);
      }
    });
  });
    //////
    // Canvas Invite Events
    
}