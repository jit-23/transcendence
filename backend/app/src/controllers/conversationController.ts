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

async function areFriends(userId: number, friendId: number) {
    const relation = await prisma.friend_request.findFirst({
        where: {
            status: "accepted",
            OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId },
            ],
        },
        select: { id: true },
    });

    return Boolean(relation);
}

export const createOrGetDirectConversation = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const friendId = Number(req.body.friendId);
        if (!Number.isInteger(friendId) || friendId <= 0)
            return res.status(400).json({ error: "Invalid friendId" });

        if (friendId === auth.userId)
            return res.status(400).json({ error: "Cannot create direct chat with yourself" });

        const friend = await prisma.my_users.findUnique({
            where: { id: friendId },
            select: { id: true, name: true, email: true },
        });
        if (!friend) return res.status(404).json({ error: "Friend not found" });

        const friends = await areFriends(auth.userId, friendId);
        if (!friends) return res.status(403).json({ error: "You can only chat directly with accepted friends" });

        const existing = await prisma.conversation.findFirst({
            where: {
                type: "DIRECT",
                AND: [
                    { participants: { some: { user_id: auth.userId } } },
                    { participants: { some: { user_id: friendId } } },
                    {
                        participants: {
                            every: {
                                OR: [
                                    { user_id: auth.userId },
                                    { user_id: friendId },
                                ],
                            },
                        },
                    },
                ],
            },
            select: { id: true, type: true, name: true },
        });

        if (existing) return res.json(existing);

        const created = await prisma.conversation.create({
            data: {
                type: "DIRECT",
                name: null,
            },
            select: { id: true, type: true, name: true },
        });

        await prisma.conversation_participants.createMany({
            data: [
                { conversation_id: created.id, user_id: auth.userId, role: "member" },
                { conversation_id: created.id, user_id: friendId, role: "member" },
            ],
            skipDuplicates: true,
        });

        return res.status(201).json(created);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const createGroupConversation = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth)
            return res.status(401).json({ error: "Unauthorized" });

        const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const incomingMemberIds: unknown[] = Array.isArray(req.body.memberIds) ? req.body.memberIds : [];

        const normalizedMemberIds = incomingMemberIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0);

        const memberIds: number[] = Array.from(new Set<number>(normalizedMemberIds))
            .filter((id) => id !== auth.userId);

        if (!name) return res.status(400).json({ error: "Group name is required" });

        const validMembers = memberIds.length
            ? await prisma.my_users.findMany({
                where: { id: { in: memberIds } },
                select: { id: true },
            })
            : [];

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

export const addMembersToGroupConversation = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const conversationId = Number(req.params.id);
        if (!Number.isInteger(conversationId) || conversationId <= 0) {
            return res.status(400).json({ error: "Invalid conversation id" });
        }

        const incomingMemberIds: unknown[] = Array.isArray(req.body.memberIds) ? req.body.memberIds : [];
        const normalizedMemberIds = incomingMemberIds
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0);

        const memberIds: number[] = Array.from(new Set<number>(normalizedMemberIds))
            .filter((id) => id !== auth.userId);

        if (memberIds.length === 0) {
            return res.status(400).json({ error: "At least one member is required" });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, type: true },
        });

        if (!conversation || conversation.type !== "GROUP") {
            return res.status(404).json({ error: "Group conversation not found" });
        }

        const myMembership = await prisma.conversation_participants.findFirst({
            where: {
                conversation_id: conversationId,
                user_id: auth.userId,
            },
            select: { role: true },
        });

        if (!myMembership) {
            return res.status(403).json({ error: "Not a participant of this group" });
        }

        if (myMembership.role !== "owner") {
            return res.status(403).json({ error: "Only group owners can add members" });
        }

        const existingParticipants = await prisma.conversation_participants.findMany({
            where: { conversation_id: conversationId },
            select: { user_id: true },
        });

        const existingParticipantIds = new Set(existingParticipants.map((participant) => participant.user_id));
        const newMemberIds = memberIds.filter((id) => !existingParticipantIds.has(id));

        if (newMemberIds.length === 0) {
            return res.status(400).json({ error: "All selected users are already in the group" });
        }

        const validMembers = await prisma.my_users.findMany({
            where: { id: { in: newMemberIds } },
            select: { id: true },
        });

        if (validMembers.length !== newMemberIds.length) {
            return res.status(404).json({ error: "One or more members were not found" });
        }

        for (const memberId of newMemberIds) {
            const friends = await areFriends(auth.userId, memberId);
            if (!friends) {
                return res.status(403).json({ error: "You can only add accepted friends" });
            }
        }

        await prisma.conversation_participants.createMany({
            data: newMemberIds.map((memberId) => ({
                conversation_id: conversationId,
                user_id: memberId,
                role: "member",
            })),
            skipDuplicates: true,
        });

        return res.json({ message: "Members added", addedCount: newMemberIds.length });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to add group members" });
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
                role: membership.role,
            };
        });

        return res.json(conversations);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const deleteGroupConversation = async (req: Request, res: Response) => {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const conversationId = Number(req.params.id);
        if (!Number.isInteger(conversationId) || conversationId <= 0) {
            return res.status(400).json({ error: "Invalid conversation id" });
        }

        const membership = await prisma.conversation_participants.findFirst({
            where: { conversation_id: conversationId, user_id: auth.userId },
            select: { role: true, conversation_id: true },
        });

        if (!membership) {
            return res.status(403).json({ error: "Not a participant of this conversation" });
        }

        if (membership.role === "owner") {
            await prisma.conversation.delete({
                where: { id: conversationId },
            });

            return res.json({ message: "Group deleted" });
        }

        await prisma.conversation_participants.delete({
            where: {
                conversation_id_user_id: {
                    conversation_id: conversationId,
                    user_id: auth.userId,
                },
            },
        });

        return res.json({ message: "Left group" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to delete conversation" });
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
