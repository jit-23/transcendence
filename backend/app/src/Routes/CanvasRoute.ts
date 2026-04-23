import { Router } from "express";
import {
    addCanvasCollaborator,
    createCanvas,
    deleteCanvas,
    getCanvasById,
    getCanvasCollaborators,
    getReceivedCanvasInvites,
    acceptCanvasInvite,
    rejectCanvasInvite,
    getUserCanvases,
    removeCanvasCollaborator,
    saveCanvasContent,
    updateCanvas,
} from "../controllers/canvasController";

const router = Router();

router.post("/", createCanvas);
router.get("/", getUserCanvases);
router.get("/invites/received", getReceivedCanvasInvites);
router.post("/:canvasId/invites/accept", acceptCanvasInvite);
router.post("/:canvasId/invites/reject", rejectCanvasInvite);
router.get("/:canvasId", getCanvasById);
router.put("/:canvasId", updateCanvas);
router.delete("/:canvasId", deleteCanvas);
router.put("/:canvasId/content", saveCanvasContent);
router.get("/:canvasId/collaborators", getCanvasCollaborators);
router.post("/:canvasId/collaborators", addCanvasCollaborator);
router.delete("/:canvasId/collaborators/:friendId", removeCanvasCollaborator);

export default router;
