import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper: extract & verify JWT from Authorization header
function getAuthUser(req: Request): { userId: number } | null {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return null;
        return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    } catch {
        return null;
    }
}

function parsePositiveInt(value: string): number | null {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) return null;
    return parsed;
}

async function hasCanvasAccess(canvasId: number, userId: number) {
    return prisma.canvas.findFirst({
        where: {
            id: canvasId,
            OR: [
                { userId },
                { collaborators: { some: { userId } } },
            ],
        },
    });
}

async function isFriend(userId: number, friendId: number) {
    const relation = await prisma.friend_request.findFirst({
        where: {
            status: "accepted",
            OR: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId },
            ],
        },
    });

    return Boolean(relation);
}

export async function createCanvas(req: Request, res: Response) {
    try {
		console.log("Received request to create canvas with body:", req.body);
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const { name, content } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ error: "Canvas name is required" });
        }

        const canvas = await prisma.canvas.create({
            data: {
                userId: auth.userId,
                name: name.trim(),
                content: content || null,
            },
        });

        res.status(201).json(canvas);
    } catch (error) {
        console.error("Error creating canvas:", error);
        res.status(500).json({ error: "Failed to create canvas" });
    }
}

export async function getUserCanvases(req: Request, res: Response) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const canvases = await prisma.canvas.findMany({
            where: {
                OR: [
                    { userId: auth.userId },
                    { collaborators: { some: { userId: auth.userId } } },
                ],
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        res.json(
            canvases.map((canvas) => ({
                ...canvas,
                isOwner: canvas.userId === auth.userId,
            }))
        );
    } catch (error) {
        console.error("Error fetching canvases:", error);
        res.status(500).json({ error: "Failed to fetch canvases" });
    }
}

export async function getCanvasById(req: Request, res: Response) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const canvasId = parsePositiveInt(req.params.canvasId as string);
        if (!canvasId) return res.status(400).json({ error: "Invalid canvas id" });

        const canvas = await prisma.canvas.findFirst({
            where: {
                id: canvasId,
                OR: [
                    { userId: auth.userId },
                    { collaborators: { some: { userId: auth.userId } } },
                ],
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                collaborators: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                    orderBy: { addedAt: "asc" },
                },
            },
        });

        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        res.json({
            ...canvas,
            isOwner: canvas.userId === auth.userId,
        });
    } catch (error) {
        console.error("Error fetching canvas:", error);
        res.status(500).json({ error: "Failed to fetch canvas" });
    }
}

export async function saveCanvasContent(req: Request, res: Response) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const canvasId = parsePositiveInt(req.params.canvasId as string);
        if (!canvasId) return res.status(400).json({ error: "Invalid canvas id" });
        const { content } = req.body;

        if (typeof content !== "string") {
            return res.status(400).json({ error: "Content is required" });
        }

        const canvas = await hasCanvasAccess(canvasId, auth.userId);

        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        const updatedCanvas = await prisma.canvas.update({
            where: { id: canvasId },
            data: { content },
        });

        res.json(updatedCanvas);
    } catch (error) {
        console.error("Error saving canvas content:", error);
        res.status(500).json({ error: "Failed to save canvas content" });
    }
}

export async function updateCanvas(req: Request, res: Response) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const canvasId = parsePositiveInt(req.params.canvasId as string);
        if (!canvasId) return res.status(400).json({ error: "Invalid canvas id" });
        const { name } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ error: "Canvas name is required" });
        }

        const canvas = await prisma.canvas.findFirst({
            where: {
                id: canvasId,
                userId: auth.userId,
            },
        });

        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        const updatedCanvas = await prisma.canvas.update({
            where: { id: canvasId },
            data: { name: name.trim() },
        });

        res.json(updatedCanvas);
    } catch (error) {
        console.error("Error updating canvas:", error);
        res.status(500).json({ error: "Failed to update canvas" });
    }
}

export async function deleteCanvas(req: Request, res: Response) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const canvasId = parsePositiveInt(req.params.canvasId as string);
        if (!canvasId) return res.status(400).json({ error: "Invalid canvas id" });

        const canvas = await prisma.canvas.findFirst({
            where: {
                id: canvasId,
                userId: auth.userId,
            },
        });

        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        await prisma.canvas.delete({
            where: { id: canvasId },
        });

        res.json({ message: "Canvas deleted successfully" });
    } catch (error) {
        console.error("Error deleting canvas:", error);
        res.status(500).json({ error: "Failed to delete canvas" });
    }
}

export async function getCanvasCollaborators(req: Request, res: Response) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const canvasId = parsePositiveInt(req.params.canvasId as string);
        if (!canvasId) return res.status(400).json({ error: "Invalid canvas id" });

        const canvas = await prisma.canvas.findFirst({
            where: {
                id: canvasId,
                OR: [
                    { userId: auth.userId },
                    { collaborators: { some: { userId: auth.userId } } },
                ],
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                collaborators: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                    orderBy: { addedAt: "asc" },
                },
            },
        });

        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        return res.json({
            owner: canvas.user,
            collaborators: canvas.collaborators.map((collaboration) => ({
                ...collaboration.user,
                addedAt: collaboration.addedAt,
            })),
            isOwner: canvas.userId === auth.userId,
        });
    } catch (error) {
        console.error("Error fetching collaborators:", error);
        return res.status(500).json({ error: "Failed to fetch collaborators" });
    }
}

export async function addCanvasCollaborator(req: Request, res: Response) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const canvasId = parsePositiveInt(req.params.canvasId as string);
        if (!canvasId) return res.status(400).json({ error: "Invalid canvas id" });

        const friendId = Number(req.body.friendId);
        if (!friendId || Number.isNaN(friendId)) {
            return res.status(400).json({ error: "friendId is required" });
        }

        const canvas = await prisma.canvas.findFirst({
            where: { id: canvasId, userId: auth.userId },
        });

        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        if (friendId === auth.userId) {
            return res.status(400).json({ error: "You already have access to this canvas" });
        }

        const friend = await prisma.my_users.findUnique({
            where: { id: friendId },
            select: { id: true, name: true, email: true },
        });

        if (!friend) {
            return res.status(404).json({ error: "Friend not found" });
        }

        const friendRelation = await isFriend(auth.userId, friendId);
        if (!friendRelation) {
            return res.status(403).json({ error: "You can only add accepted friends" });
        }

        const existing = await prisma.canvas_collaborator.findUnique({
            where: { canvasId_userId: { canvasId, userId: friendId } },
        });

        if (existing) {
            return res.status(409).json({ error: "Friend is already a collaborator" });
        }

        const collaboration = await prisma.canvas_collaborator.create({
            data: { canvasId, userId: friendId },
        });

        return res.status(201).json({
            message: "Collaborator added",
            collaborator: {
                ...friend,
                addedAt: collaboration.addedAt,
            },
        });
    } catch (error) {
        console.error("Error adding collaborator:", error);
        return res.status(500).json({ error: "Failed to add collaborator" });
    }
}

export async function removeCanvasCollaborator(req: Request, res: Response) {
    try {
        const auth = getAuthUser(req);
        if (!auth) return res.status(401).json({ error: "Unauthorized" });

        const canvasId = parsePositiveInt(req.params.canvasId as string);
        if (!canvasId) return res.status(400).json({ error: "Invalid canvas id" });

        const collaboratorId = parsePositiveInt(req.params.friendId as string);
        if (!collaboratorId) return res.status(400).json({ error: "Invalid collaborator id" });

        const canvas = await prisma.canvas.findFirst({
            where: { id: canvasId, userId: auth.userId },
        });

        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        const removed = await prisma.canvas_collaborator.deleteMany({
            where: { canvasId, userId: collaboratorId },
        });

        if (removed.count === 0) {
            return res.status(404).json({ error: "Collaborator not found" });
        }

        return res.json({ message: "Collaborator removed" });
    } catch (error) {
        console.error("Error removing collaborator:", error);
        return res.status(500).json({ error: "Failed to remove collaborator" });
    }
}
