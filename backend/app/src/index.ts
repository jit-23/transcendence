import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import pg from "pg";

import userRoute from "./Routes/userRoute.js"

import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();
const app =  express();
/* app.use(cors({
  origin: 'http://localhost:8081/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
})); */


app.use(cors({
    origin: 'http://localhost:5173',
  credentials: true
}));  
app.use(express.json());

app.use(`/users`, userRoute)



const PORT = 8081;


app.listen(PORT, ()=>{console.log("express connected")});

process.on("SIGINT", async () => {
  console.log("\nStopping the server...");
  
  // Close the Prisma connection so it doesn't hang
  await prisma  .$disconnect();
  console.log("Prisma disconnected.");
  
  process.exit(0);
});
