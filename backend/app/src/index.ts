import express from "express"
import https from "https"
import fs from "fs"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import compression from "compression"
import cors from "cors"
import pg from "pg"
import 'dotenv/config'
import userRoute from "./Routes/userRoute"
import conversationRoute from "./Routes/conversationRoute"
import canvasRoute from "./Routes/CanvasRoute"
import { metricsMiddleware, register } from "./monitoring/metrics"

import { errorMiddleware, corsMiddleware } from './errorMiddleware';

import { PrismaClient } from "@prisma/client"
import { setupChatSocket } from "./sockets/chatSocket"

const prisma = new PrismaClient()
const app = express()

app.use(corsMiddleware);
app.use(compression());

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(metricsMiddleware);

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(`/users`, userRoute)
app.use(`/conversations`, conversationRoute)
app.use(`/canvases`, canvasRoute)
app.use(errorMiddleware);
const PORT = 8081;

const keyPath = process.env.SSL_KEY_PATH || '/etc/ssl/certs/server.key';
const certPath = process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.cert';

let server: https.Server;
try {
  const options: https.ServerOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  server = https.createServer(options, app);
} catch (err: any) {
  console.error("Failed to load SSL certificates:", err.message);
  process.exit(1);
}

server.listen(PORT, () => { 
});

setupChatSocket(server, prisma);

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});