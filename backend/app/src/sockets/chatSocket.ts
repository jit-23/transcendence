import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

export function setupChatSocket(server: HttpServer, prisma: PrismaClient) {
  const connectedByName = new Map<string, string>();

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
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

    socket.on("disconnect", () => {
      connectedByName.delete(username);
      console.log(`${username} disconnected`);
    });
  });

  return io;
}
