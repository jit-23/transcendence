import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import 'dotenv/config';

const prisma = new PrismaClient();

function getRequiredEnv(name: string): string | null {
    const value = process.env[name];
    if (!value || !value.trim()) {
        return null;
    }
    return value;
}

function createOAuthState(): string {
    return randomBytes(24).toString("hex");
}

function setOAuthStateCookie(res: Response, cookieName: string, state: string) {
    res.cookie(cookieName, state, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60 * 1000,
        path: "/users/auth",
    });
}

function consumeOAuthState(req: Request, res: Response, cookieName: string): string | null {
    const expectedState = (req as any).cookies?.[cookieName];
    res.clearCookie(cookieName, { path: "/users/auth" });
    if (!expectedState || typeof expectedState !== "string") {
        return null;
    }
    return expectedState;
}

function signAccessToken(userId: number): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

function signPending2FAToken(userId: number): string {
    return jwt.sign(
        { userId, pending2FA: true },
        process.env.JWT_SECRET!,
        { expiresIn: "5m" }
    );
}

function validateOAuthCodeAndState(
    req: Request,
    res: Response,
    frontendUrl: string,
    stateCookieName: string
): string | null {
    const { code, state } = req.query;
    const expectedState = consumeOAuthState(req, res, stateCookieName);

    if (!state || typeof state !== "string" || !expectedState || state !== expectedState) {
        res.redirect(`${frontendUrl}/login?error=oauth_state`);
        return null;
    }

    if (!code || typeof code !== "string") {
        res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        return null;
    }

    return code;
}

async function exchangeAuthCodeForAccessToken(
    tokenUrl: string,
    body: URLSearchParams,
    providerLabel: string
): Promise<string | null> {
    const tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });

    if (!tokenRes.ok) {
        console.error(`${providerLabel} token exchange failed:`, await tokenRes.text());
        return null;
    }

    const tokens = await tokenRes.json() as { access_token?: string };
    if (!tokens.access_token) {
        console.error(`${providerLabel} token response missing access token`);
        return null;
    }

    return tokens.access_token;
}

async function fetchOAuthProfile<T>(profileUrl: string, accessToken: string): Promise<T | null> {
    const profileRes = await fetch(profileUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
        return null;
    }

    return await profileRes.json() as T;
}

function redirectAfterOAuthLogin(
    res: Response,
    frontendUrl: string,
    user: { id: number; twoFactorEnabled: boolean }
) {
    if (user.twoFactorEnabled) {
        const tempToken = signPending2FAToken(user.id);
        const hash = new URLSearchParams({ requires2FA: "true", tempToken }).toString();
        return res.redirect(`${frontendUrl}/oauth/callback#${hash}`);
    }

    const token = signAccessToken(user.id);
    return res.redirect(`${frontendUrl}/oauth/callback#token=${token}`);
}

async function generateUniqueUsername(baseValue: string) {
    const normalized = baseValue.replace(/\s+/g, "_").toLowerCase().slice(0, 45) || "user";
    let username = normalized;

    let taken = await prisma.my_users.findUnique({ where: { name: username } });
    while (taken) {
        username = `${normalized}_${Math.floor(1000 + Math.random() * 9000)}`;
        taken = await prisma.my_users.findUnique({ where: { name: username } });
    }

    return username;
}

function normalizeAvatarUrl(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }

        if (parsed.protocol === "http:") {
            parsed.protocol = "https:";
        }

        if (parsed.hostname.endsWith("googleusercontent.com") && !parsed.searchParams.has("sz")) {
            parsed.searchParams.set("sz", "256");
        }

        return parsed.toString();
    } catch {
        return null;
    }
}

// ─── Step 1: Redirect the browser to Google's OAuth consent screen ───────────
export const googleAuthRedirect = (_req: Request, res: Response) => {
    const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
    const redirectUri = getRequiredEnv("GOOGLE_REDIRECT_URI");
	
	if (!clientId || !redirectUri) {
		return res.status(500).send("Google OAuth is not configured");
	}

    const state = createOAuthState();
    setOAuthStateCookie(res, "oauth_state_google", state);

    const params = new URLSearchParams({
        client_id:     clientId,
        redirect_uri:  redirectUri,
        response_type: "code",
        scope:         "openid email profile",
        access_type:   "offline",
        prompt:        "select_account",
        state,
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

export const fortyTwoAuthRedirect = (_req: Request, res: Response) => {
    const clientId = getRequiredEnv("FORTYTWO_CLIENT_ID");
    const redirectUri = getRequiredEnv("FORTYTWO_REDIRECT_URI");

    if (!clientId || !redirectUri) {
        console.error("42 OAuth configuration missing. Check FORTYTWO_CLIENT_ID and FORTYTWO_REDIRECT_URI.");
        return res.status(500).send("42 OAuth is not configured");
    }

    const state = createOAuthState();
    setOAuthStateCookie(res, "oauth_state_42", state);

    const params = new URLSearchParams({
        client_id:     clientId,
        redirect_uri:  redirectUri,
        response_type: "code",
        scope:         "public",
        state,
    });
    res.redirect(`https://api.intra.42.fr/oauth/authorize?${params}`);
};

// ─── Step 2: Google redirects back here with ?code=… ─────────────────────────
export const googleAuthCallback = async (req: Request, res: Response) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || "https://localhost:5173";
    const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
    const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");
    const redirectUri = getRequiredEnv("GOOGLE_REDIRECT_URI");

    if (!clientId || !clientSecret || !redirectUri) {
        console.error("Google OAuth configuration missing. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI.");
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_misconfigured`);
    }

    try {
        const code = validateOAuthCodeAndState(req, res, FRONTEND_URL, "oauth_state_google");
        if (!code) return;

        const accessToken = await exchangeAuthCodeForAccessToken(
            "https://oauth2.googleapis.com/token",
            new URLSearchParams({
                code,
                client_id:     clientId,
                client_secret: clientSecret,
                redirect_uri:  redirectUri,
                grant_type:    "authorization_code",
            }),
            "Google"
        );
        if (!accessToken) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const profile = await fetchOAuthProfile<{
            id: string;
            email: string;
            name: string;
            picture?: string;
        }>("https://www.googleapis.com/oauth2/v2/userinfo", accessToken);
        if (!profile) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const googleAvatar = normalizeAvatarUrl(profile.picture);

        // Find or create the user in the DB
        let user = await prisma.my_users.findUnique({ where: { googleId: profile.id } });

        if (!user) {
            // Check if this email already exists (account linking)
            const existing = await prisma.my_users.findUnique({ where: { email: profile.email } });
            if (existing) {
                // Link the existing account to Google
                user = await prisma.my_users.update({
                    where: { id: existing.id },
                    data: {
                        googleId: profile.id,
                        avatar: existing.avatar || googleAvatar,
                    },
                });
            } else {
                // Brand-new user — create with a unique username
                const username = await generateUniqueUsername(profile.name);

                user = await prisma.my_users.create({
                    data: {
                        googleId:        profile.id,
                        email:           profile.email,
                        name:            username,
                        password:        null,
                        twoFactorEnabled: false,
                        twoFactorSecret: null,
                        avatar:          googleAvatar,
                    },
                });
            }
        } else if (!user.avatar && googleAvatar) {
            user = await prisma.my_users.update({
                where: { id: user.id },
                data: { avatar: googleAvatar },
            });
        }

        return redirectAfterOAuthLogin(res, FRONTEND_URL, user);
    } catch (err: any) {
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
};

export const fortyTwoAuthCallback = async (req: Request, res: Response) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || "https://localhost:5173";
    const clientId = getRequiredEnv("FORTYTWO_CLIENT_ID");
    const clientSecret = getRequiredEnv("FORTYTWO_CLIENT_SECRET");
    const redirectUri = getRequiredEnv("FORTYTWO_REDIRECT_URI");

    if (!clientId || !clientSecret || !redirectUri) {
        console.error("42 OAuth configuration missing. Check FORTYTWO_CLIENT_ID, FORTYTWO_CLIENT_SECRET and FORTYTWO_REDIRECT_URI.");
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_misconfigured`);
    }

    try {
        const code = validateOAuthCodeAndState(req, res, FRONTEND_URL, "oauth_state_42");
        if (!code) return;

        const accessToken = await exchangeAuthCodeForAccessToken(
            "https://api.intra.42.fr/oauth/token",
            new URLSearchParams({
                code,
                client_id:     clientId,
                client_secret: clientSecret,
                redirect_uri:  redirectUri,
                grant_type:    "authorization_code",
            }),
            "42"
        );
        if (!accessToken) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const profile = await fetchOAuthProfile<{
            id: number;
            email: string | null;
            login: string;
            displayname?: string | null;
            image?: { link?: string | null };
        }>("https://api.intra.42.fr/v2/me", accessToken);
        if (!profile) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        if (!profile.email) {
            return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
        }

        const fortyTwoId = String(profile.id);
        const fortyTwoAvatar = normalizeAvatarUrl(profile.image?.link);
        let user = await prisma.my_users.findUnique({ where: { fortyTwoId } });

        if (!user) {
            const existing = await prisma.my_users.findUnique({ where: { email: profile.email } });
            if (existing) {
                user = await prisma.my_users.update({
                    where: { id: existing.id },
                    data:  {
                        fortyTwoId,
                        avatar: existing.avatar || fortyTwoAvatar,
                    },
                });
            } else {
                const username = await generateUniqueUsername(profile.login || profile.displayname || "user");
                user = await prisma.my_users.create({
                    data: {
                        fortyTwoId,
                        email:           profile.email,
                        name:            username,
                        password:        null,
                        twoFactorEnabled: false,
                        twoFactorSecret: null,
                        avatar:          fortyTwoAvatar,
                    },
                });
            }
        }

        return redirectAfterOAuthLogin(res, FRONTEND_URL, user);
    } catch (err: any) {
        console.error("42 OAuth error:", err.message);
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
};
