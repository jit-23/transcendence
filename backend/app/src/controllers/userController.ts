import { PrismaClient } from "@prisma/client";
import 'dotenv/config';
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username) return res.status(422).json({ error: "username required" });
        if (!email) return res.status(422).json({ error: "Email required" });
        if (!password) return res.status(422).json({ error: "password required" });

        if (await prisma.my_users.findUnique({ where: { name: username } }))
            return res.status(409).json({ error: "Username exists" });

        if (await prisma.my_users.findUnique({ where: { email } }))
            return res.status(409).json({ error: "Email exists" });

        const hash = await bcrypt.hash(password, 10);

        await prisma.my_users.create({
            data: {
                name: username,
                email,
                password: hash,
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });

        return res.status(201).json({ message: "User created" });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.my_users.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Invalid password" });

        if (user.twoFactorEnabled) {
            // Short-lived token — proves password was verified
            const tempToken = jwt.sign(
                { userId: user.id, pending2FA: true },
                process.env.JWT_SECRET!,
                { expiresIn: "5m" }
            );
            return res.json({ requires2FA: true, tempToken });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            token,
            user: { id: user.id, email: user.email, username: user.name }
        });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

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

    if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ error: "2FA not configured" });
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
    });

    if (!verified) return res.status(400).json({ error: "Invalid code" });

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    return res.json({ token });
};

export const toggle2FA = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const user = await prisma.my_users.findUnique({ where: { id: decoded.userId } });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.twoFactorEnabled) {
            const secret = speakeasy.generateSecret({
                name: `ft_transcendence (${user.email})`,
            });

            const qr = await QRCode.toDataURL(secret.otpauth_url!);

            await prisma.my_users.update({
                where: { id: user.id },
                data: {
                    twoFactorEnabled: true,
                    twoFactorSecret: secret.base32,
                },
            });

            return res.json({ enabled: true, qr });
        } else {
            await prisma.my_users.update({
                where: { id: user.id },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                },
            });

            return res.json({ enabled: false });
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);

        const user = await prisma.my_users.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true, twoFactorEnabled: true }
        });

        return res.json(user);
    } catch {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

export const getUser = async (_req: Request, res: Response) => {
    const users = await prisma.my_users.findMany();
    res.json(users);
};

export const updateUser = async (req: Request, res: Response) => {
    const updated = await prisma.my_users.update({
        where: { id: parseInt(req.body.id) },
        data: { name: req.body.username, email: req.body.email, password: req.body.password }
    });
    res.json(updated);
};