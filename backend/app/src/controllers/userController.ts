import { PrismaClient } from "@prisma/client";
import 'dotenv/config';
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ✅ SIGNUP (AUTO 2FA)
export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username) return res.status(422).json({ error: "username required" });
        if (!email) return res.status(422).json({ error: "Email required" });
        if (!password) return res.status(422).json({ error: "password required" });

        const hash = await bcrypt.hash(password, 10);

        if (await prisma.my_users.findUnique({ where: { name: username } }))
            return res.status(409).json({ error: "Username exists" });

        if (await prisma.my_users.findUnique({ where: { email } }))
            return res.status(409).json({ error: "Email exists" });

        // 🔥 AUTO 2FA SETUP
        const secret = speakeasy.generateSecret({
            name: `ft_transcendence (${email})`,
        });

        const qr = await QRCode.toDataURL(secret.otpauth_url!);

        const user = await prisma.my_users.create({
            data: {
                name: username,
                email,
                password: hash,
                twoFactorEnabled: true,           // 🔥 ALWAYS TRUE
                twoFactorSecret: secret.base32,   // 🔥 STORED IMMEDIATELY
            },
        });

        return res.status(201).json({
            message: "User created",
            qr,
            userId: user.id,
        });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

// ✅ LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.my_users.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Invalid password" });

        // 🔥 ALWAYS REQUIRE 2FA
        if (user.twoFactorEnabled) {
            return res.json({
                requires2FA: true,
                userId: user.id
            });
        }

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ✅ VERIFY 2FA LOGIN
export const login2FA = async (req: Request, res: Response) => {
    const { code, userId } = req.body;

    const user = await prisma.my_users.findUnique({
        where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ error: "2FA not setup" });
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 2,
    });

    if (!verified) {
        return res.status(400).json({ error: "Invalid code" });
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    return res.json({ token });
};

// OTHER (unchanged)
export const getMe = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);

        const user = await prisma.my_users.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true }
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
        data: {
            name: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
    });
    res.json(updated);
};