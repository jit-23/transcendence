import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function getAuthUser(req: Request): { userId: number } | null {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return null;
        return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    } catch {
        return null;
    }
}

export const createGroupConversation = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const incomingMemberIds: unknown[] = Array.isArray(req.body.memberIds) ? req.body.memberIds : [];

        const normalizedMemberIds = incomingMemberIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0);

        const memberIds: number[] = Array.from(new Set<number>(normalizedMemberIds))
            .filter((id) => id !== auth.userId);

        if (!name) return res.status(400).json({ error: "Group name is required" });
        if (memberIds.length < 1) return res.status(400).json({ error: "Select at least one member" });

        const validMembers = await prisma.my_users.findMany({
            where: { id: { in: memberIds } },
            select: { id: true },
        });

        if (validMembers.length !== memberIds.length)
            return res.status(404).json({ error: "One or more members were not found" });

        const conversation = await prisma.conversation.create({
            data: {
                type: "GROUP",
                name,
            },
            select: { id: true, name: true, type: true },
        });

        await prisma.conversation_participants.createMany({
            data: [
                { conversation_id: conversation.id, user_id: auth.userId, role: "owner" },
                ...memberIds.map((memberId) => ({
                    conversation_id: conversation.id,
                    user_id: memberId,
                    role: "member",
                })),
            ],
            skipDuplicates: true,
        });

        return res.status(201).json(conversation);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getMyConversations = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const memberships = await prisma.conversation_participants.findMany({
            where: { user_id: auth.userId },
            include: {
                conversation: {
                    include: {
                        participants: {
                            include: {
                                user: { select: { id: true, name: true, email: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { joinedAt: "desc" },
        });

        const conversations = memberships.map((membership) => {
            const members = membership.conversation.participants.map((participant) => participant.user);
            return {
                id: membership.conversation.id,
                type: membership.conversation.type,
                name: membership.conversation.name,
                members,
            };
        });

        return res.json(conversations);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const getConversationMessages = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const conversationId = Number(req.params.id);
        if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });

        const member = await prisma.conversation_participants.findFirst({
            where: { conversation_id: conversationId, user_id: auth.userId },
            select: { conversation_id: true },
        });

        if (!member) return res.status(403).json({ error: "Not a participant of this conversation" });

        const messages = await prisma.message.findMany({
            where: { conversation_id: conversationId },
            include: {
                sender: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { created_at: "asc" },
            take: 300,
        });

        return res.json(messages);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
