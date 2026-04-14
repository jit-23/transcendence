import { Router } from "express";
import {
    createOrGetDirectConversation,
    createGroupConversation,
    deleteGroupConversation,
    getMyConversations,
    getConversationMessages,
} from "../controllers/conversationController";

const router = Router();

router.post("/group", createGroupConversation);
router.post("/direct", createOrGetDirectConversation);
router.get("/my", getMyConversations);
router.get("/:id/messages", getConversationMessages);
router.delete("/:id", deleteGroupConversation);

export default router;
