import express from "express"
import http from "http"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import compression from "compression"
import cors from "cors"
import pg from "pg"
import 'dotenv/config'
import userRoute from "./Routes/userRoute"

import { Server } from "socket.io"
import { PrismaClient } from "@prisma/client"

const connectedByName = new Map<string, string>();

const prisma = new PrismaClient()
const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(`/users`, userRoute)

const PORT = 8081;
const server = app.listen(PORT, () => { console.log("express connected") });

//! SOCKET.IO SETUP

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  const username = socket.handshake.auth.username as string;

  if (!username) return socket.disconnect();

  connectedByName.set(username, socket.id);
  console.log(`${username} connected with id: ${socket.id}`);

  socket.on("private-message", ({ payload }) => {
    const toSocketId = connectedByName.get(payload.to);
    if (toSocketId) {
      io.to(toSocketId).emit("private-message", { from: username, text: payload.text });
    } else {
      socket.emit("user-not-found", { to: payload.to });
    }
  });

  socket.on("typing", ({ to, isTyping }) => {
    const toSocketId = connectedByName.get(to);
    if (!toSocketId) return;
    io.to(toSocketId).emit("typing", { from: username, isTyping: Boolean(isTyping) });
  });

  // ✅ FIXED: was nested inside private-message handler before
  socket.on("disconnect", () => {
    connectedByName.delete(username);
    console.log(`${username} disconnected`);
  });
});

//! SOCKET.IO SETUP

process.on("SIGINT", async () => {
  console.log("\nStopping the server...");
  await prisma.$disconnect();
  console.log("Prisma disconnected.");
  process.exit(0);
});