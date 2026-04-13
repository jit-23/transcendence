import { Router } from "express";
import {
    addCanvasCollaborator,
    createCanvas,
    deleteCanvas,
    getCanvasById,
    getCanvasCollaborators,
    getUserCanvases,
    removeCanvasCollaborator,
    saveCanvasContent,
    updateCanvas,
} from "../controllers/canvasController";

const router = Router();

router.post("/", createCanvas);
router.get("/", getUserCanvases);
router.get("/:canvasId", getCanvasById);
router.put("/:canvasId", updateCanvas);
router.delete("/:canvasId", deleteCanvas);
router.put("/:canvasId/content", saveCanvasContent);
router.get("/:canvasId/collaborators", getCanvasCollaborators);
router.post("/:canvasId/collaborators", addCanvasCollaborator);
router.delete("/:canvasId/collaborators/:friendId", removeCanvasCollaborator);

export default router;
