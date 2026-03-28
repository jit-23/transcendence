import { PrismaClient } from "@prisma/client";
import 'dotenv/config';
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ─── helper: extract & verify JWT from Authorization header ───────────────────
function getAuthUser(req: Request): { userId: number } | null {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return null;
        return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    } catch {
        return null;
    }
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username) return res.status(422).json({ error: "username required" });
        if (!email)    return res.status(422).json({ error: "Email required" });
        if (!password) return res.status(422).json({ error: "password required" });

        if (await prisma.my_users.findUnique({ where: { name: username } }))
            return res.status(409).json({ error: "Username exists" });
        if (await prisma.my_users.findUnique({ where: { email } }))
            return res.status(409).json({ error: "Email exists" });

        const hash = await bcrypt.hash(password, 10);
        await prisma.my_users.create({
            data: { name: username, email, password: hash, twoFactorEnabled: false, twoFactorSecret: null },
        });

        return res.status(201).json({ message: "User created" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.my_users.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Invalid password" });

        if (user.twoFactorEnabled) {
            const tempToken = jwt.sign(
                { userId: user.id, pending2FA: true },
                process.env.JWT_SECRET!,
                { expiresIn: "5m" }
            );
            return res.json({ requires2FA: true, tempToken });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
        return res.status(200).json({ token, user: { id: user.id, email: user.email, username: user.name } });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── VERIFY 2FA LOGIN (rate limited in route) ─────────────────────────────────
export const login2FA = async (req: Request, res: Response) => {
    const { code, tempToken } = req.body;
    if (!tempToken) return res.status(400).json({ error: "Missing token" });

    let payload: any;
    try {
        payload = jwt.verify(tempToken, process.env.JWT_SECRET!);
    } catch {
        return res.status(401).json({ error: "Session expired, please login again" });
    }

    if (!payload.pending2FA) return res.status(400).json({ error: "Invalid token type" });

    const user = await prisma.my_users.findUnique({ where: { id: payload.userId } });
    if (!user || !user.twoFactorSecret) return res.status(400).json({ error: "2FA not configured" });

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
    });

    if (!verified) return res.status(400).json({ error: "Invalid code" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    return res.json({ token });
};

// ─── 2FA: STEP 1 ──────────────────────────────────────────────────────────────
export const generate2FA = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const user = await prisma.my_users.findUnique({ where: { id: auth.userId } });
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.twoFactorEnabled) return res.status(400).json({ error: "2FA already enabled" });

        const secret = speakeasy.generateSecret({ name: `ft_transcendence (${user.email})` });
        const qr = await QRCode.toDataURL(secret.otpauth_url!);

        await prisma.my_users.update({ where: { id: user.id }, data: { twoFactorSecret: secret.base32 } });
        return res.json({ qr });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── 2FA: STEP 2 ──────────────────────────────────────────────────────────────
export const confirm2FA = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "Code required" });

        const user = await prisma.my_users.findUnique({ where: { id: auth.userId } });
        if (!user || !user.twoFactorSecret)
            return res.status(400).json({ error: "No 2FA setup in progress — generate QR first" });
        if (user.twoFactorEnabled)
            return res.status(400).json({ error: "2FA already active" });

        const valid = speakeasy.totp.verify({
            secret: user.twoFactorSecret, encoding: "base32", token: code, window: 1,
        });
        if (!valid) return res.status(401).json({ error: "Invalid code — scan the QR again" });

        await prisma.my_users.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
        return res.json({ enabled: true });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── 2FA: DISABLE ─────────────────────────────────────────────────────────────
export const disable2FA = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "Current 2FA code required to disable" });

        const user = await prisma.my_users.findUnique({ where: { id: auth.userId } });
        if (!user) return res.status(404).json({ error: "User not found" });
        if (!user.twoFactorEnabled || !user.twoFactorSecret)
            return res.status(400).json({ error: "2FA is not enabled" });

        const valid = speakeasy.totp.verify({
            secret: user.twoFactorSecret, encoding: "base32", token: code, window: 1,
        });
        if (!valid) return res.status(401).json({ error: "Invalid 2FA code" });

        await prisma.my_users.update({
            where: { id: user.id },
            data: { twoFactorEnabled: false, twoFactorSecret: null },
        });
        return res.json({ enabled: false });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const user = await prisma.my_users.findUnique({
            where: { id: auth.userId },
            select: { id: true, name: true, email: true, twoFactorEnabled: true },
        });
        return res.json(user);
    } catch {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

// ─── UPDATE MY PROFILE ────────────────────────────────────────────────────────
// Requires current password to make any change.
// Only updates fields that are actually provided.
// Hashes new password if provided.
export const updateMe = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { username, email, currentPassword, newPassword } = req.body;

        const user = await prisma.my_users.findUnique({ where: { id: auth.userId } });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Always verify current password first
        if (!currentPassword)
            return res.status(400).json({ error: "Current password is required" });
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword)
            return res.status(401).json({ error: "Current password is incorrect" });

        // Check uniqueness only if the value is actually changing
        if (username && username !== user.name) {
            if (await prisma.my_users.findUnique({ where: { name: username } }))
                return res.status(409).json({ error: "Username already taken" });
        }
        if (email && email !== user.email) {
            if (await prisma.my_users.findUnique({ where: { email } }))
                return res.status(409).json({ error: "Email already in use" });
        }

        const data: any = {};
        if (username) data.name     = username;
        if (email)    data.email    = email;
        if (newPassword) {
            if (newPassword.length < 6)
                return res.status(422).json({ error: "New password must be at least 6 characters" });
            data.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(data).length === 0)
            return res.status(400).json({ error: "Nothing to update" });

        const updated = await prisma.my_users.update({
            where: { id: auth.userId },
            data,
            select: { id: true, name: true, email: true, twoFactorEnabled: true },
        });

        return res.json({ message: "Profile updated", user: updated });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── GET ALL / UPDATE (kept for compatibility) ────────────────────────────────
export const getUser = async (_req: Request, res: Response) => {
    const users = await prisma.my_users.findMany();
    res.json(users);
};

export const updateUser = async (req: Request, res: Response) => {
    const updated = await prisma.my_users.update({
        where: { id: parseInt(req.body.id) },
        data: { name: req.body.username, email: req.body.email, password: req.body.password },
    });
    res.json(updated);
};