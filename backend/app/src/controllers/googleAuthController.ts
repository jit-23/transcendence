import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';

const prisma = new PrismaClient();

// ─── Step 1: Redirect the browser to Google's OAuth consent screen ───────────
export const googleAuthRedirect = (_req: Request, res: Response) => {
    const params = new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
        response_type: "code",
        scope:         "openid email profile",
        access_type:   "offline",
        prompt:        "select_account",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

// ─── Step 2: Google redirects back here with ?code=… ─────────────────────────
export const googleAuthCallback = async (req: Request, res: Response) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
        const { code } = req.query;
        if (!code || typeof code !== "string") {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        // Exchange the auth code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id:     process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri:  process.env.GOOGLE_REDIRECT_URI!,
                grant_type:    "authorization_code",
            }),
        });

        if (!tokenRes.ok) {
            console.error("Token exchange failed:", await tokenRes.text());
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const tokens = await tokenRes.json() as { access_token: string };

        // Fetch the user's Google profile
        const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!profileRes.ok) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const profile = await profileRes.json() as {
            id: string;
            email: string;
            name: string;
            picture?: string;
        };

        // Find or create the user in the DB
        let user = await prisma.my_users.findUnique({ where: { googleId: profile.id } });

        if (!user) {
            // Check if this email already exists (account linking)
            const existing = await prisma.my_users.findUnique({ where: { email: profile.email } });
            if (existing) {
                // Link the existing account to Google
                user = await prisma.my_users.update({
                    where: { id: existing.id },
                    data:  { googleId: profile.id },
                });
            } else {
                // Brand-new user — create with a unique username
                let username = profile.name.replace(/\s+/g, "_").toLowerCase().slice(0, 45);
                const taken = await prisma.my_users.findUnique({ where: { name: username } });
                if (taken) username = `${username}_${Date.now().toString().slice(-4)}`;

                user = await prisma.my_users.create({
                    data: {
                        googleId:        profile.id,
                        email:           profile.email,
                        name:            username,
                        password:        null,
                        twoFactorEnabled: false,
                        twoFactorSecret: null,
                        // Use the Google profile picture as a data-URL is impractical;
                        // store the URL directly — the frontend already handles this.
                        avatar:          profile.picture ?? null,
                    },
                });
            }
        }

        if (user.twoFactorEnabled) {
            const tempToken = jwt.sign(
                { userId: user.id, pending2FA: true },
                process.env.JWT_SECRET!,
                { expiresIn: "5m" }
            );
            const hash = new URLSearchParams({ requires2FA: "true", tempToken }).toString();
            return res.redirect(`${FRONTEND_URL}/oauth/callback#${hash}`);
        }

        // Issue a JWT identical to the normal login flow
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

        // Redirect to frontend with the token in the URL hash (never in query string)
        return res.redirect(`${FRONTEND_URL}/oauth/callback#token=${token}`);
    } catch (err: any) {
        console.error("Google OAuth error:", err.message);
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
};
