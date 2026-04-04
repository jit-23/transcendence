import express from "express"
import http from "http"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import compression from "compression"
import cors from "cors"
import pg from "pg"
import 'dotenv/config'
import userRoute from "./Routes/userRoute"
import conversationRoute from "./Routes/conversationRoute"
import canvasRoute from "./Routes/canvasRoute"

import { PrismaClient } from "@prisma/client"
import { setupChatSocket } from "./sockets/chatSocket"

const prisma = new PrismaClient()
const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));

app.use(`/users`, userRoute)
app.use(`/conversations`, conversationRoute)
app.use(`/canvases`, canvasRoute)

const PORT = 8081;
const server = app.listen(PORT, () => { console.log("express connected") });

setupChatSocket(server, prisma);

process.on("SIGINT", async () => {
  console.log("\nStopping the server...");
  await prisma.$disconnect();
  console.log("Prisma disconnected.");
  process.exit(0);
});