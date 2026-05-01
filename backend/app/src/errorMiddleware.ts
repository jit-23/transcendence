import cors from 'cors';
import { Request, Response, NextFunction } from "express";

const allowedOrigins = new Set([
  process.env.CORS_ORIGIN || 'https://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://localhost:5173',
  'https://127.0.0.1:5173',
]);

// 2. Define the CORS options separately for clarity
const corsOptions: cors.CorsOptions = {
    origin: (requestOrigin, callback) => {
        // If no origin (like mobile apps) or origin is in whitelist
        if (!requestOrigin || allowedOrigins.has(requestOrigin)) {
            callback(null, true);
        } else {
            console.error(`CORS blocked for origin: ${requestOrigin}`);
            // We pass null/false to "silently" fail without crashing the server
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

// 3. Export the middleware
// We call cors(corsOptions) which returns a standard Express middleware
export const corsMiddleware = cors(corsOptions);

// --- Your Error Middleware remains the same ---
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ error: "Internal Server Error" });
};