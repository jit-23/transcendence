import { PrismaClient } from "@prisma/client";
import winston from "winston";
import 'dotenv/config';
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import { isUserOnline } from "../presenceStore";

const prisma = new PrismaClient();

const fastify = require('fastify')({
  logger: true // This must be true (or a config object)
});
// Configure Winston logger
const logger = winston.createLogger({
    level: "error",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "error.log" })
    ],
});

type AvatarValidationResult =
    | { valid: true; avatar: string }
    | { valid: false; status: number; error: string };

function validateAvatarValue(avatar: string): AvatarValidationResult {
    if (avatar.startsWith("default:")) {
        const num = parseInt(avatar.split(":")[1]);
        if (isNaN(num) || num < 1 || num > 4) {
            return { valid: false, status: 400, error: "Invalid default avatar (choose 1–4)" };
        }
        return { valid: true, avatar };
    }

    if (avatar.startsWith("data:image/")) {
        const sizeBytes = (avatar.length * 3) / 4;
        if (sizeBytes > 2 * 1024 * 1024) {
            return { valid: false, status: 413, error: "Image too large (max 2MB)" };
        }

        const validTypes = ["data:image/jpeg", "data:image/jpg", "data:image/png", "data:image/webp"];
        if (!validTypes.some(t => avatar.startsWith(t))) {
            return { valid: false, status: 400, error: "Only JPG, PNG or WebP allowed" };
        }

        return { valid: true, avatar };
    }

    return { valid: false, status: 400, error: "Invalid avatar format" };
}

function verifyTotpCode(secret: string, code: string): boolean {
    return speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: code,
        window: 1,
    });
}

async function hasBlockRelation(userAId: number, userBId: number) {
    const relation = await prisma.user_block.findFirst({
        where: {
            OR: [
                { blockerId: userAId, blockedId: userBId },
                { blockerId: userBId, blockedId: userAId },
            ],
        },
    });

    return !!relation;
}

async function getBlockedUserIdsFor(userId: number): Promise<number[]> {
    const blockRelations = await prisma.user_block.findMany({
        where: {
            OR: [
                { blockerId: userId },
                { blockedId: userId },
            ],
        },
        select: {
            blockerId: true,
            blockedId: true,
        },
    });

    const blockedUserIds = new Set<number>();
    for (const relation of blockRelations) {
        if (relation.blockerId === userId) blockedUserIds.add(relation.blockedId);
        if (relation.blockedId === userId) blockedUserIds.add(relation.blockerId);
    }

    return Array.from(blockedUserIds);
}

function getPasswordPolicyError(password: string): string | null {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must include at least 1 uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must include at least 1 lowercase letter";
    if (!/\d/.test(password)) return "Password must include at least 1 number";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must include at least 1 symbol";
    return null;
}

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
const hasWhitespace = (value: string) => /\s/.test(value);

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, avatar } = req.body;

        if (!username) return res.status(422).json({ error: "username required" });
        if (typeof username !== "string" || hasWhitespace(username.trim())) {
            return res.status(422).json({ error: "Username cannot contain spaces" });
        }
        if (!email)    return res.status(422).json({ error: "Email required" });
        if (!password) return res.status(422).json({ error: "password required" });
        if (typeof password !== "string") return res.status(422).json({ error: "password required" });

        const passwordPolicyError = getPasswordPolicyError(password);
        if (passwordPolicyError) {
            return res.status(422).json({ error: passwordPolicyError });
        }

        if (await prisma.my_users.findUnique({ where: { name: username } }))
            return res.status(409).json({ error: "Username exists" });
        if (await prisma.my_users.findUnique({ where: { email } }))
            return res.status(409).json({ error: "Email exists" });

        // Validate avatar if provided
        let validatedAvatar: string | null = null;
        if (typeof avatar === "string") {
            const avatarValidation = validateAvatarValue(avatar);
            if (avatarValidation.valid) {
                validatedAvatar = avatarValidation.avatar;
            }
        }

        const hash = await bcrypt.hash(password, 10);
        await prisma.my_users.create({
            data: {
                name: username,
                email,
                password: hash,
                avatar: validatedAvatar,
                twoFactorEnabled: false,
                twoFactorSecret: null,
            },
        });

        return res.status(201).json({ message: "User created" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// Login 


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.my_users.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
     if (!passwordMatch) return res.status(401).json({ success: false, error: "Invalid credentials" });
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
  } catch (error) {
    logger.error('Error logging in:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

//  2FA Login 
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

    const verified = verifyTotpCode(user.twoFactorSecret, code);

    if (!verified) return res.status(400).json({ error: "Invalid code" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    return res.json({ token });
};

// 2FA: First step
export const generate2FA = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const user = await prisma.my_users.findUnique({ where: { id: auth.userId } });
        if (!user) return res.status(401).json({ error: "User not found" });
        if (user.twoFactorEnabled) return res.status(400).json({ error: "2FA already enabled" });

        const secret = speakeasy.generateSecret({ name: `ft_transcendence (${user.email})` });
        const qr = await QRCode.toDataURL(secret.otpauth_url!);

        await prisma.my_users.update({ where: { id: user.id }, data: { twoFactorSecret: secret.base32 } });
        return res.json({ qr });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// 2FA: Second step
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

        const valid = verifyTotpCode(user.twoFactorSecret, code);
        if (!valid) return res.status(401).json({ error: "Invalid code — scan the QR again" });

        await prisma.my_users.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
        return res.json({ enabled: true });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// 2FA: Disable it
export const disable2FA = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "Current 2FA code required to disable" });

        const user = await prisma.my_users.findUnique({ where: { id: auth.userId } });
        if (!user) return res.status(401).json({ error: "User not found" });
        if (!user.twoFactorEnabled || !user.twoFactorSecret)
            return res.status(400).json({ error: "2FA is not enabled" });

        const valid = verifyTotpCode(user.twoFactorSecret, code);
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

export const getMe = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const user = await prisma.my_users.findUnique({
            where: { id: auth.userId },
            select: { id: true, name: true, email: true, twoFactorEnabled: true, avatar: true, password: true, googleId: true, fortyTwoId: true },
        });
        if (!user) return res.status(401).json({ error: "User not found" });

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            twoFactorEnabled: user.twoFactorEnabled,
            avatar: user.avatar,
            hasPassword: !!user.password,
            hasOAuthLogin: !!user.googleId || !!user.fortyTwoId,
        });
    } catch {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const userId = Number(req.params.id);
        if (!userId) return res.status(400).json({ error: "Invalid user id" });

        const profile = await prisma.my_users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                createdAt: true,
            },
        });

        if (!profile) return res.status(401).json({ error: "User not found" });

        const isBlocked = !!(await prisma.user_block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: auth.userId,
                    blockedId: userId,
                },
            },
        }));

        const blockedByUser = !!(await prisma.user_block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: userId,
                    blockedId: auth.userId,
                },
            },
        }));

        return res.json({
            ...profile,
            isBlocked,
            blockedByUser,
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const blockUser = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const targetUserId = Number(req.params.id);
        if (!targetUserId) return res.status(400).json({ error: "Invalid user id" });
        if (targetUserId === auth.userId)
            return res.status(400).json({ error: "Cannot block yourself" });

        const target = await prisma.my_users.findUnique({ where: { id: targetUserId } });
        if (!target) return res.status(401).json({ error: "User not found" });

        await prisma.user_block.upsert({
            where: {
                blockerId_blockedId: {
                    blockerId: auth.userId,
                    blockedId: targetUserId,
                },
            },
            create: {
                blockerId: auth.userId,
                blockedId: targetUserId,
            },
            update: {},
        });

        // Delete all friend requests (pending and accepted) on both sides
        await prisma.friend_request.deleteMany({
            where: {
                OR: [
                    { senderId: auth.userId, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: auth.userId },
                ],
            },
        });

        return res.json({ message: "User blocked" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const unblockUser = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const targetUserId = Number(req.params.id);
        if (!targetUserId) return res.status(400).json({ error: "Invalid user id" });
        if (targetUserId === auth.userId)
            return res.status(400).json({ error: "Cannot unblock yourself" });

        await prisma.user_block.deleteMany({
            where: {
                blockerId: auth.userId,
                blockedId: targetUserId,
            },
        });

        return res.json({ message: "User unblocked" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getBlockedUsers = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const blockedUsers = await prisma.user_block.findMany({
            where: { blockerId: auth.userId },
            include: {
                blocked: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json(
            blockedUsers.map((entry: any) => ({
                blockedAt: entry.createdAt,
                ...entry.blocked,
            }))
        );
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// Update Profile 
export const updateMe = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { username, email, currentPassword, newPassword } = req.body;

        const user = await prisma.my_users.findUnique({ where: { id: auth.userId } });
        if (!user) return res.status(401).json({ error: "User not found" });

        const isChangingPassword = typeof newPassword === "string" && newPassword.length > 0;

        if (isChangingPassword) {
            if (!user.password) {
                const providers: string[] = [];
                if (user.googleId) providers.push("Google");
                if (user.fortyTwoId) providers.push("42 login");
                const providerText = providers.length ? providers.join("/") : "OAuth";

                return res.status(400).json({
                    error: `This account uses ${providerText}. Password changes are not supported.`,
                });
            }

            if (!currentPassword)
                return res.status(400).json({ error: "Current password is required" });

            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword)
                return res.status(401).json({ error: "Current password is incorrect" });
        }

        if (username && username !== user.name) {
            if (typeof username !== "string" || hasWhitespace(username.trim())) {
                return res.status(422).json({ error: "Username cannot contain spaces" });
            }
            if (await prisma.my_users.findUnique({ where: { name: username } }))
                return res.status(409).json({ error: "Username already taken" });
        }
        if (email && email !== user.email) {
            if (user.googleId || user.fortyTwoId) {
                return res.status(400).json({ error: "Email changes are not supported for OAuth accounts" });
            }
            if (await prisma.my_users.findUnique({ where: { email } }))
                return res.status(409).json({ error: "Email already in use" });
        }

        const data: any = {};
        if (username) data.name     = username;
        if (email)    data.email    = email;
        if (isChangingPassword) {
            const passwordPolicyError = getPasswordPolicyError(newPassword);
            if (passwordPolicyError)
                return res.status(422).json({ error: passwordPolicyError });
            data.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(data).length === 0)
            return res.status(400).json({ error: "Nothing to update" });

        const updated = await prisma.my_users.update({
            where: { id: auth.userId },
            data,
            select: { id: true, name: true, email: true, twoFactorEnabled: true, avatar: true },
        });

        return res.json({ message: "Profile updated", user: updated });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateAvatar = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { avatar } = req.body;
        if (!avatar || typeof avatar !== "string")
            return res.status(400).json({ error: "Avatar required" });

        const avatarValidation = validateAvatarValue(avatar);
        if (avatarValidation.valid === false) {
            return res.status(avatarValidation.status).json({ error: avatarValidation.error });
        }

        await prisma.my_users.update({
            where: { id: auth.userId },
            data: { avatar: avatarValidation.avatar },
        });

        return res.json({ message: "Avatar updated", avatar: avatarValidation.avatar });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};


export const searchUsers = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { query } = req.query;
        if (!query || typeof query !== 'string')
            return res.status(400).json({ error: "Query parameter required" });

        if (query.trim().length < 1)
            return res.status(400).json({ error: "Search query too short" });

        const blockedUserIds = await getBlockedUserIdsFor(auth.userId);

        const users = await prisma.my_users.findMany({
            where: {
                name: { startsWith: query, mode: 'insensitive' },
                NOT: {
                    id: {
                        in: [auth.userId, ...blockedUserIds],
                    },
                },
            },
            select: { id: true, name: true, email: true, createdAt: true },
            take: 20, // Limit results
        });

        return res.json(users);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── SEND FRIEND REQUEST ──────────────────────────────────────────────────────
export const sendFriendRequest = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { receiverId } = req.body;
        if (!receiverId) return res.status(400).json({ error: "Receiver ID required" });

        if (receiverId === auth.userId)
            return res.status(400).json({ error: "Cannot send request to yourself" });

        const receiver = await prisma.my_users.findUnique({ where: { id: receiverId } });
        if (!receiver) return res.status(401).json({ error: "User not found" });

        const blocked = await hasBlockRelation(auth.userId, receiverId);
        if (blocked)
            return res.status(400).json({ error: "Cannot send request because one user has blocked the other" });

        // Check any existing relation in either direction.
        const existing = await prisma.friend_request.findFirst({
            where: {
                OR: [
                    { senderId: auth.userId, receiverId },
                    { senderId: receiverId, receiverId: auth.userId },
                ],
            },
        });

        if (existing) {
            if (existing.status === "accepted") {
                return res.status(200).json({ error: "You are already friends" });
            }

            if (existing.status === "pending") {
                return; res.status(200).json({ error: "Request already pending" });
            }

            // If previous relation was rejected, allow a fresh invitation.
            await prisma.friend_request.delete({ where: { id: existing.id } });
        }

        const request = await prisma.friend_request.create({
            data: { senderId: auth.userId, receiverId },
        });

        return res.status(201).json({ message: "Friend request sent", request });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── SENT FRIEND REQUESTS ────────────────────────────────────────────────────
export const getSentFriendRequests = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const requests = await prisma.friend_request.findMany({
            where: { senderId: auth.userId, status: "pending" },
            include: {
                receiver: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json(requests);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── RECEIVED FRIEND REQUESTS ────────────────────────────────────────────────
export const getReceivedFriendRequests = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const requests = await prisma.friend_request.findMany({
            where: { receiverId: auth.userId, status: "pending" },
            include: {
                sender: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json(requests);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── ACCEPT FRIEND REQUEST ───────────────────────────────────────────────────
export const acceptFriendRequest = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const requestId = Number(req.params.id);
        if (!requestId) return res.status(400).json({ error: "Invalid request id" });

        const existing = await prisma.friend_request.findUnique({ where: { id: requestId } });
        if (!existing || existing.receiverId !== auth.userId)
            return res.status(401).json({ error: "Request not found" });
        if (existing.status !== "pending")
            return res.status(400).json({ error: "Request already handled" });

        const updated = await prisma.friend_request.update({
            where: { id: requestId },
            data: { status: "accepted" },
        });

        return res.json({ message: "Friend request accepted", request: updated });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── REJECT FRIEND REQUEST ───────────────────────────────────────────────────
export const rejectFriendRequest = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const requestId = Number(req.params.id);
        if (!requestId) return res.status(400).json({ error: "Invalid request id" });

        const existing = await prisma.friend_request.findUnique({ where: { id: requestId } });
        if (!existing || existing.receiverId !== auth.userId)
            return res.status(401).json({ error: "Request not found" });
        if (existing.status !== "pending")
            return res.status(400).json({ error: "Request already handled" });

        const updated = await prisma.friend_request.update({
            where: { id: requestId },
            data: { status: "rejected" },
        });

        return res.json({ message: "Friend request rejected", request: updated });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── FRIENDS LIST ────────────────────────────────────────────────────────────
export const getFriends = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const friendships = await prisma.friend_request.findMany({
            where: {
                status: "accepted",
                OR: [
                    { senderId: auth.userId },
                    { receiverId: auth.userId },
                ],
            },
            include: {
                sender: { select: { id: true, name: true, email: true } },
                receiver: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const seen = new Set<number>();
        const friends = friendships
            .map((item) => (item.senderId === auth.userId ? item.receiver : item.sender))
            .filter((friend) => {
                if (seen.has(friend.id)) return false;
                seen.add(friend.id);
                return true;
            })
            .map((friend) => ({
                ...friend,
                online: isUserOnline(friend.id),
            }));

        return res.json(friends);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

// ─── UNFRIEND ────────────────────────────────────────────────────────────────
export const unfriend = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const friendId = Number(req.params.id);
        if (!friendId) return res.status(400).json({ error: "Invalid friend id" });
        if (friendId === auth.userId)
            return res.status(400).json({ error: "Cannot unfriend yourself" });

        const relation = await prisma.friend_request.findFirst({
            where: {
                status: "accepted",
                OR: [
                    { senderId: auth.userId, receiverId: friendId },
                    { senderId: friendId, receiverId: auth.userId },
                ],
            },
        });

        if (!relation) return res.status(401).json({ error: "Friendship not found" });

        await prisma.friend_request.delete({ where: { id: relation.id } });
        return res.json({ message: "Friend removed" });
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



fastify.post('/login', login);

export { fastify };